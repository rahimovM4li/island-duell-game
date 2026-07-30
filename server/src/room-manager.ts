import { randomBytes } from 'node:crypto';
import type { Server, Socket } from 'socket.io';
import type { RapierModule } from '@shared/physics';
import {
  C2S,
  isJoinMsg,
  isQuickPlayMsg,
  isTrainingMsg,
  S2C,
  type JoinMsg,
  type QuickPlayMsg,
  type RoomKind,
  type TrainingMsg,
} from '@shared/protocol';
import { isPlayerSkinId, normalizePlayerName } from '@shared/multiplayer';
import { GameRoom } from './game';
import {
  PartyManager,
  type PartyMatchMember,
} from './party-manager';

export interface RoomManagerOptions {
  countdownMs?: number;
  timeScale?: number;
  partyReconnectGraceMs?: number;
}

const GAME_SOCKET_EVENTS = [
  C2S.setReady,
  C2S.startMatch,
  C2S.startPractice,
  C2S.input,
  C2S.craft,
  C2S.useBandage,
  C2S.rematch,
  C2S.leaveGame,
  C2S.kickPlayer,
  C2S.pingProbe,
] as const;

export class RoomManager {
  // Intentionally in-memory for one Render instance. Horizontal scaling will
  // require shared room/token state plus a Socket.IO adapter (for example Redis).
  private readonly rooms = new Map<string, GameRoom>();
  private readonly tokenRooms = new Map<string, string>();
  private readonly roomPartyCodes = new Map<string, Set<string>>();
  readonly parties: PartyManager;
  private roomSequence = 0;

  constructor(
    private readonly io: Server,
    private readonly rapier: RapierModule,
    private readonly options: RoomManagerOptions = {},
  ) {
    this.parties = new PartyManager(io, {
      startPrivateMatch: (code, members, fillBots) =>
        this.startPrivatePartyMatch(code, members, fillBots),
      startPublicQueue: (code, members) => this.assignPartyPublic(code, members),
      cancelPublicQueue: (code, roomId) => this.releasePartyFromRoom(code, roomId),
      resumeInRoom: (member, roomId) => this.resumePartyMember(member, roomId),
    }, { reconnectGraceMs: options.partyReconnectGraceMs });
    io.on('connection', (socket) => this.onConnection(socket));
  }

  get roomCount(): number { return this.rooms.size; }
  get partyCount(): number { return this.parties.partyCount; }

  roomIds(): string[] {
    return [...this.rooms.keys()];
  }

  roomIdForToken(token: string): string | undefined {
    return this.tokenRooms.get(token);
  }

  private onConnection(socket: Socket): void {
    this.parties.registerSocket(socket);

    socket.on(C2S.quickPlay, (payload: unknown) => {
      if (!isQuickPlayMsg(payload)) {
        socket.emit(S2C.joinError, { reason: 'Die Profildaten sind unvollständig.' });
        return;
      }
      this.assignQuickPlay(socket, payload);
    });

    socket.on(C2S.startTrainingRoom, (payload: unknown) => {
      if (!isTrainingMsg(payload)) {
        socket.emit(S2C.joinError, { reason: 'Die Trainingseinstellungen sind ungültig.' });
        return;
      }
      this.assignTraining(socket, payload);
    });

    // Compatibility path for the existing local host/ready test flow.
    socket.on(C2S.join, (payload: unknown) => {
      if (!isJoinMsg(payload)) {
        socket.emit(S2C.joinError, { reason: 'Die Profildaten sind ungültig.' });
        return;
      }
      this.assignLegacy(socket, payload);
    });

    socket.on('disconnect', () => {
      this.parties.handleDisconnect(socket);
      const roomId = typeof socket.data.roomId === 'string' ? socket.data.roomId : undefined;
      if (roomId) this.rooms.get(roomId)?.handleDisconnect(socket);
    });
  }

  private assignQuickPlay(socket: Socket, profile: QuickPlayMsg): void {
    if (!this.validateProfile(socket, profile)) return;
    if (typeof socket.data.partyCode === 'string') {
      socket.emit(S2C.joinError, { reason: 'Starte Multiplayer für die gesamte Party über den Party-Host.' });
      return;
    }
    if (this.rejectDuplicateAssignment(socket)) return;
    socket.emit(S2C.matchmakingState, { state: 'searching', message: 'Passende Insel wird gesucht …' });

    const resumedRoom = profile.resumeToken
      ? this.roomForResumeToken(profile.resumeToken, 'quick')
      : undefined;
    const room = resumedRoom
      ?? [...this.rooms.values()].find((candidate) =>
        candidate.kind === 'quick' && candidate.canAcceptNewPlayer())
      ?? this.createRoom('quick', true);

    if (!room.attachSocket(socket, profile)) return;
    socket.emit(S2C.matchmakingState, { state: 'assigned', message: 'Insel gefunden.' });
  }

  private assignTraining(socket: Socket, profile: TrainingMsg): void {
    if (!this.validateProfile(socket, profile)) return;
    if (typeof socket.data.partyCode === 'string') {
      socket.emit(S2C.joinError, { reason: 'Training ist nur ohne aktive Party verfügbar.' });
      return;
    }
    if (this.rejectDuplicateAssignment(socket)) return;
    socket.emit(S2C.matchmakingState, { state: 'searching', message: 'Training wird vorbereitet …' });
    const resumedRoom = profile.resumeToken
      ? this.roomForResumeToken(profile.resumeToken, 'training')
      : undefined;
    const room = resumedRoom ?? this.createRoom('training', false);
    if (!room.attachSocket(socket, profile)) return;
    socket.emit(S2C.matchmakingState, { state: 'assigned', message: 'Training bereit.' });
    if (!resumedRoom) {
      queueMicrotask(() => room.startPractice(profile.bots, profile.difficulty, profile.mode));
    }
  }

  private assignLegacy(socket: Socket, profile: JoinMsg): void {
    if (!this.validateProfile(socket, profile, true)) return;
    if (typeof socket.data.partyCode === 'string') {
      socket.emit(S2C.joinError, { reason: 'Verlasse zuerst die aktive Party.' });
      return;
    }
    if (this.rejectDuplicateAssignment(socket)) return;
    const resumedRoom = profile.resumeToken
      ? this.roomForResumeToken(profile.resumeToken, 'legacy')
      : undefined;
    const legacyRoom = [...this.rooms.values()].find((candidate) => candidate.kind === 'legacy');
    // The legacy host/ready path represents one explicit lobby. Public Quick
    // Play, not this compatibility path, is responsible for creating new rooms.
    const room = resumedRoom ?? legacyRoom ?? this.createRoom('legacy', false);
    room.attachSocket(socket, profile);
  }

  private validateProfile(socket: Socket, profile: JoinMsg, allowMissingSkin = false): boolean {
    if (!normalizePlayerName(profile.name)) {
      socket.emit(S2C.joinError, { reason: 'Der Name muss 2–16 erlaubte Zeichen enthalten.' });
      return false;
    }
    if ((!allowMissingSkin && profile.skin === undefined)
      || (profile.skin !== undefined && !isPlayerSkinId(profile.skin))) {
      socket.emit(S2C.joinError, { reason: 'Diese Charakterfarbe ist nicht verfügbar.' });
      return false;
    }
    return true;
  }

  private rejectDuplicateAssignment(socket: Socket): boolean {
    const roomId = typeof socket.data.roomId === 'string' ? socket.data.roomId : undefined;
    if (!roomId) return false;
    const room = this.rooms.get(roomId);
    if (room) {
      socket.emit(S2C.roomAssigned, { roomId, kind: room.kind, resumed: true });
      socket.emit(S2C.matchmakingState, {
        state: 'assigned',
        message: 'Du bist bereits einer Insel zugewiesen.',
      });
    }
    return true;
  }

  private roomForResumeToken(token: string, kind?: RoomKind): GameRoom | undefined {
    const roomId = this.tokenRooms.get(token);
    const room = roomId ? this.rooms.get(roomId) : undefined;
    if (!room || !room.hasResumeToken(token)) {
      this.tokenRooms.delete(token);
      return undefined;
    }
    // a stale token from another mode must not hijack an explicit mode choice
    // (e.g. a quick-match token redirecting a "Training" click into the old room)
    if (kind && room.kind !== kind) return undefined;
    return room;
  }

  private startPrivatePartyMatch(
    code: string,
    members: PartyMatchMember[],
    fillBots: boolean,
  ): { ok: boolean; roomId?: string; reason?: string } {
    if (members.length < 2 || members.length > 5) {
      return { ok: false, reason: 'Schnellspiel benötigt zwei bis fünf verbundene Party-Mitglieder.' };
    }
    const room = this.createRoom('party-quick', false);
    if (!room.attachPreparedGroup(members)) {
      this.removeRoom(room.roomId);
      return { ok: false, reason: 'Die Party konnte nicht geschlossen in den privaten Raum wechseln.' };
    }
    this.roomPartyCodes.set(room.roomId, new Set([code]));
    queueMicrotask(() => {
      if (!this.rooms.has(room.roomId)) return;
      if (!room.startPartyQuickMatch(fillBots, 'quick')) {
        this.releasePartyFromRoom(code, room.roomId);
        this.parties.completeMatch(code);
      }
    });
    return { ok: true, roomId: room.roomId };
  }

  private assignPartyPublic(
    code: string,
    members: PartyMatchMember[],
  ): { ok: boolean; roomId?: string; reason?: string } {
    if (members.length < 1 || members.length > 5) {
      return { ok: false, reason: 'Die Partygröße ist für Multiplayer ungültig.' };
    }
    const room = [...this.rooms.values()].find((candidate) =>
      candidate.kind === 'quick' && candidate.canAcceptGroup(members.length))
      ?? this.createRoom('quick', true);
    if (!room.attachPreparedGroup(members)) {
      if (room.playerCount === 0) this.removeRoom(room.roomId);
      return { ok: false, reason: 'Für die gesamte Party ist aktuell kein gemeinsamer Platz frei.' };
    }
    const codes = this.roomPartyCodes.get(room.roomId) ?? new Set<string>();
    codes.add(code);
    this.roomPartyCodes.set(room.roomId, codes);
    for (const member of members) {
      member.socket.emit(S2C.matchmakingState, {
        state: 'assigned',
        message: 'Die gesamte Party wurde derselben öffentlichen Insel zugewiesen.',
      });
    }
    return { ok: true, roomId: room.roomId };
  }

  private resumePartyMember(member: PartyMatchMember, roomId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;
    const tracked = this.roomPartyCodes.get(roomId);
    if (tracked && !tracked.has(member.partyCode)) return false;
    return room.resumePreparedSocket(member);
  }

  private releasePartyFromRoom(code: string, roomId: string): void {
    const room = this.rooms.get(roomId);
    room?.releasePartyConnections(code);
    const tracked = this.roomPartyCodes.get(roomId);
    tracked?.delete(code);
    if (tracked && tracked.size === 0) this.roomPartyCodes.delete(roomId);
  }

  private finishPartyMatches(roomId: string, reportedCodes: string[]): void {
    const room = this.rooms.get(roomId);
    const tracked = this.roomPartyCodes.get(roomId);
    const codes = new Set([...(tracked ?? []), ...reportedCodes]);
    for (const code of codes) {
      room?.releasePartyConnections(code);
      this.parties.completeMatch(code);
    }
    this.roomPartyCodes.delete(roomId);
  }

  private createRoom(kind: RoomKind, autoStart: boolean): GameRoom {
    const roomId = `room-${++this.roomSequence}-${randomBytes(3).toString('hex')}`;
    const room = new GameRoom(this.io, this.rapier, {
      roomId,
      kind,
      autoStart,
      countdownMs: this.options.countdownMs ?? (autoStart ? 15_000 : undefined),
      timeScale: this.options.timeScale,
      onEmpty: (id) => this.removeRoom(id),
      onTokenIssued: (token, id) => this.tokenRooms.set(token, id),
      onTokenRevoked: (token) => this.tokenRooms.delete(token),
      onSocketReleased: (released, id) => this.releaseSocket(released, id),
      onLobbyChanged: (id, state, partyCodes) => {
        const tracked = this.roomPartyCodes.get(id);
        const codes = tracked ? [...tracked] : partyCodes;
        const status = state.status === 'match'
          ? 'match'
          : state.status === 'countdown' ? 'countdown' : 'queued';
        for (const code of codes) {
          this.parties.updateRoomStatus(code, status, state.countdownEndsAt);
        }
      },
      onMatchFinished: (id, partyCodes) => this.finishPartyMatches(id, partyCodes),
    });
    this.rooms.set(roomId, room);
    return room;
  }

  private releaseSocket(socket: Socket, roomId: string): void {
    if (socket.data.roomId !== roomId) return;
    for (const event of GAME_SOCKET_EVENTS) socket.removeAllListeners(event);
    void socket.leave(roomId);
    delete socket.data.roomId;
    if (typeof socket.data.partyCode !== 'string') delete socket.data.playerId;
  }

  private removeRoom(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;
    this.rooms.delete(roomId);
    this.roomPartyCodes.delete(roomId);
    room.dispose();
    for (const [token, mappedRoom] of this.tokenRooms) {
      if (mappedRoom === roomId) this.tokenRooms.delete(token);
    }
  }

  dispose(): void {
    for (const room of this.rooms.values()) room.dispose();
    this.rooms.clear();
    this.tokenRooms.clear();
    this.roomPartyCodes.clear();
    this.parties.dispose();
  }
}
