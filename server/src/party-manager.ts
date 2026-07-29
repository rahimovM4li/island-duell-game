import { randomBytes } from 'node:crypto';
import type { Server, Socket } from 'socket.io';
import { MAX_PLAYERS, RECONNECT_GRACE_MS } from '@shared/constants';
import {
  C2S,
  isCreatePartyMsg,
  isJoinPartyMsg,
  isPartySettingsMsg,
  S2C,
  type CreatePartyMsg,
  type JoinPartyMsg,
  type PartyErrorMsg,
  type PartyQueueStatus,
  type PartySelection,
  type PartyStateMsg,
} from '@shared/protocol';
import {
  isPlayerSkinId,
  normalizePlayerName,
  uniquePlayerName,
  type PlayerSkinId,
} from '@shared/multiplayer';

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 6;
const JOIN_ATTEMPTS_PER_WINDOW = 7;
const JOIN_WINDOW_MS = 10_000;

export interface PartyMatchMember {
  id: string;
  token: string;
  name: string;
  skin: PlayerSkinId;
  socket: Socket;
  partyCode: string;
}

interface PartyMember extends PartyMatchMember {
  connected: boolean;
}

interface Party {
  code: string;
  hostId: string;
  members: Map<string, PartyMember>;
  selection: PartySelection;
  fillBots: boolean;
  queueStatus: PartyQueueStatus;
  roomId?: string;
  countdownEndsAt: number | null;
}

export interface PartyAssignmentResult {
  ok: boolean;
  roomId?: string;
  reason?: string;
}

export interface PartyManagerCallbacks {
  startPrivateMatch(code: string, members: PartyMatchMember[], fillBots: boolean): PartyAssignmentResult;
  startPublicQueue(code: string, members: PartyMatchMember[]): PartyAssignmentResult;
  cancelPublicQueue(code: string, roomId: string): void;
  resumeInRoom(member: PartyMatchMember, roomId: string): boolean;
}

export interface PartyManagerOptions {
  reconnectGraceMs?: number;
}

interface RateEntry {
  attempts: number;
  resetAt: number;
}

export class PartyManager {
  private readonly parties = new Map<string, Party>();
  private readonly tokenParties = new Map<string, string>();
  private readonly disconnectTimers = new Map<string, ReturnType<typeof setTimeout>>();
  private readonly joinRates = new Map<string, RateEntry>();
  private readonly reconnectGraceMs: number;

  constructor(
    private readonly io: Server,
    private readonly callbacks: PartyManagerCallbacks,
    options: PartyManagerOptions = {},
  ) {
    this.reconnectGraceMs = options.reconnectGraceMs ?? RECONNECT_GRACE_MS;
  }

  get partyCount(): number { return this.parties.size; }

  codes(): string[] { return [...this.parties.keys()]; }

  codeForToken(token: string): string | undefined {
    return this.tokenParties.get(token);
  }

  registerSocket(socket: Socket): void {
    socket.on(C2S.createParty, (payload: unknown) => this.createParty(socket, payload));
    socket.on(C2S.joinPartyByCode, (payload: unknown) => this.joinParty(socket, payload));
    socket.on(C2S.leaveParty, (ack: unknown) => {
      this.leaveParty(socket);
      if (typeof ack === 'function') (ack as () => void)();
    });
    socket.on(C2S.updatePartySettings, (payload: unknown) => this.updateSettings(socket, payload));
    socket.on(C2S.startPartyQuickMatch, () => this.startPrivateMatch(socket));
    socket.on(C2S.startPartyQueue, () => this.startPublicQueue(socket));
    socket.on(C2S.cancelPartyQueue, () => this.cancelQueue(socket));
  }

  handleDisconnect(socket: Socket): void {
    const party = this.partyForSocket(socket);
    const member = this.memberForSocket(socket, party);
    if (!party || !member || member.socket.id !== socket.id) return;
    member.connected = false;
    if (party.hostId === member.id) this.migrateHost(party, member.id);
    if (party.roomId && (party.queueStatus === 'queued' || party.queueStatus === 'countdown')) {
      this.cancelPartyRoom(party);
    }
    this.broadcast(party);

    const key = this.timerKey(party.code, member.id);
    const oldTimer = this.disconnectTimers.get(key);
    if (oldTimer) clearTimeout(oldTimer);
    const timer = setTimeout(() => {
      this.disconnectTimers.delete(key);
      const current = party.members.get(member.id);
      if (!current || current.connected) return;
      this.removeMember(party, member.id, false);
    }, this.reconnectGraceMs);
    this.disconnectTimers.set(key, timer);
  }

  updateRoomStatus(
    code: string,
    status: PartyQueueStatus,
    countdownEndsAt: number | null,
  ): void {
    const party = this.parties.get(this.normalizeCode(code));
    if (!party) return;
    party.queueStatus = status;
    party.countdownEndsAt = countdownEndsAt;
    this.broadcast(party);
  }

  completeMatch(code: string): void {
    const party = this.parties.get(this.normalizeCode(code));
    if (!party) return;
    party.roomId = undefined;
    party.queueStatus = 'idle';
    party.countdownEndsAt = null;
    party.fillBots = party.members.size >= MAX_PLAYERS ? false : party.fillBots;
    for (const member of party.members.values()) {
      if (member.socket.data.roomId) delete member.socket.data.roomId;
    }
    this.broadcast(party);
  }

  dispose(): void {
    for (const timer of this.disconnectTimers.values()) clearTimeout(timer);
    this.disconnectTimers.clear();
    this.parties.clear();
    this.tokenParties.clear();
    this.joinRates.clear();
  }

  private createParty(socket: Socket, payload: unknown): void {
    if (!isCreatePartyMsg(payload) || !this.validateProfile(socket, payload, 'create')) return;
    if (this.rejectAssigned(socket, 'create', payload.resumeToken)) return;

    const code = this.generateCode();
    const member = this.makeMember(socket, payload, code, []);
    const party: Party = {
      code,
      hostId: member.id,
      members: new Map([[member.id, member]]),
      selection: 'quick',
      fillBots: false,
      queueStatus: 'idle',
      countdownEndsAt: null,
    };
    this.parties.set(code, party);
    this.tokenParties.set(member.token, code);
    this.bindPartySocket(socket, party, member, false);
    this.broadcast(party);
  }

  private joinParty(socket: Socket, payload: unknown): void {
    if (!this.consumeJoinAttempt(socket)) {
      this.error(socket, 'join', 'Zu viele Code-Versuche. Bitte warte einen Moment.');
      return;
    }
    if (!isJoinPartyMsg(payload) || !this.validateProfile(socket, payload, 'join')) return;
    const code = this.normalizeCode(payload.code);
    if (this.rejectAssigned(socket, 'join', payload.resumeToken, code)) return;
    const party = this.parties.get(code);
    if (!party) {
      this.error(socket, 'join', 'Diese Party wurde nicht gefunden. Prüfe den Teamcode.');
      return;
    }

    const resumed = payload.resumeToken
      ? [...party.members.values()].find((entry) => entry.token === payload.resumeToken)
      : undefined;
    if (resumed) {
      if (resumed.connected && resumed.socket.id !== socket.id) {
        this.error(socket, 'join', 'Diese Party-Sitzung ist bereits verbunden.');
        return;
      }
      const timerKey = this.timerKey(code, resumed.id);
      const timer = this.disconnectTimers.get(timerKey);
      if (timer) clearTimeout(timer);
      this.disconnectTimers.delete(timerKey);
      resumed.socket = socket;
      resumed.connected = true;
      resumed.name = uniquePlayerName(
        normalizePlayerName(payload.name)!,
        [...party.members.values()].filter((entry) => entry.id !== resumed.id).map((entry) => entry.name),
      );
      resumed.skin = payload.skin;
      this.bindPartySocket(socket, party, resumed, true);
      if (party.roomId && !this.callbacks.resumeInRoom(resumed, party.roomId)) {
        this.error(socket, 'join', 'Das laufende Match konnte nicht wiederhergestellt werden.');
      }
      this.broadcast(party);
      return;
    }

    if (party.queueStatus === 'match') {
      this.error(socket, 'join', 'Die Party befindet sich bereits in einem Match.');
      return;
    }
    if (party.queueStatus !== 'idle') {
      this.error(socket, 'join', 'Die Party sucht bereits ein Match. Bitte versuche es gleich erneut.');
      return;
    }
    if (party.members.size >= MAX_PLAYERS) {
      this.error(socket, 'join', `Diese Party ist voll (maximal ${MAX_PLAYERS} Spieler).`);
      return;
    }

    const member = this.makeMember(
      socket,
      payload,
      code,
      [...party.members.values()].map((entry) => entry.name),
    );
    party.members.set(member.id, member);
    if (party.members.size >= MAX_PLAYERS) party.fillBots = false;
    this.tokenParties.set(member.token, code);
    this.bindPartySocket(socket, party, member, false);
    this.broadcast(party);
  }

  private leaveParty(socket: Socket): void {
    const party = this.partyForSocket(socket);
    const member = this.memberForSocket(socket, party);
    if (!party || !member) {
      this.error(socket, 'leave', 'Du bist aktuell in keiner Party.');
      return;
    }
    if (party.queueStatus === 'match') {
      this.error(socket, 'leave', 'Verlasse zuerst das laufende Match.');
      return;
    }
    if (party.roomId) this.cancelPartyRoom(party);
    this.removeMember(party, member.id, true);
  }

  private updateSettings(socket: Socket, payload: unknown): void {
    const party = this.requireHost(socket, 'settings');
    if (!party) return;
    if (!isPartySettingsMsg(payload)) {
      this.error(socket, 'settings', 'Diese Party-Einstellungen sind ungültig.');
      return;
    }
    if (party.queueStatus !== 'idle') {
      this.error(socket, 'settings', 'Während der Suche oder eines Matches können Optionen nicht geändert werden.');
      return;
    }
    party.selection = payload.selection;
    party.fillBots = payload.selection === 'quick'
      && party.members.size >= 2
      && party.members.size < MAX_PLAYERS
      && payload.fillBots;
    this.broadcast(party);
  }

  private startPrivateMatch(socket: Socket): void {
    const party = this.requireHost(socket, 'start');
    if (!party || !this.canStartParty(party, 'start')) return;
    if (party.selection !== 'quick') {
      this.error(socket, 'start', 'Wähle zuerst Schnellspiel.');
      return;
    }
    const members = this.connectedMembers(party);
    if (members.length < 2) {
      this.error(socket, 'start', 'Schnellspiel benötigt mindestens zwei echte Party-Mitglieder.');
      return;
    }
    const fillBots = members.length < MAX_PLAYERS && party.fillBots;
    const result = this.callbacks.startPrivateMatch(party.code, members, fillBots);
    this.finishAssignment(socket, party, result, 'match', 'start');
  }

  private startPublicQueue(socket: Socket): void {
    const party = this.requireHost(socket, 'queue');
    if (!party || !this.canStartParty(party, 'queue')) return;
    if (party.selection !== 'multiplayer') {
      this.error(socket, 'queue', 'Wähle zuerst Multiplayer.');
      return;
    }
    const result = this.callbacks.startPublicQueue(party.code, this.connectedMembers(party));
    this.finishAssignment(socket, party, result, 'queued', 'queue');
  }

  private cancelQueue(socket: Socket): void {
    const party = this.requireHost(socket, 'cancel');
    if (!party) return;
    if (!party.roomId || (party.queueStatus !== 'queued' && party.queueStatus !== 'countdown')) {
      this.error(socket, 'cancel', 'Diese Party befindet sich nicht in der öffentlichen Suche.');
      return;
    }
    this.cancelPartyRoom(party);
    this.broadcast(party);
  }

  private canStartParty(party: Party, operation: PartyErrorMsg['operation']): boolean {
    if (party.queueStatus !== 'idle' || party.roomId) {
      const socket = party.members.get(party.hostId)?.socket;
      if (socket) this.error(socket, operation, 'Die Party ist bereits einer Queue oder einem Match zugewiesen.');
      return false;
    }
    if ([...party.members.values()].some((member) => !member.connected)) {
      const socket = party.members.get(party.hostId)?.socket;
      if (socket) this.error(socket, operation, 'Warte, bis alle Party-Mitglieder wieder verbunden sind.');
      return false;
    }
    return true;
  }

  private finishAssignment(
    socket: Socket,
    party: Party,
    result: PartyAssignmentResult,
    successStatus: PartyQueueStatus,
    operation: PartyErrorMsg['operation'],
  ): void {
    if (!result.ok || !result.roomId) {
      this.error(socket, operation, result.reason ?? 'Die Insel konnte nicht vorbereitet werden.');
      return;
    }
    party.roomId = result.roomId;
    party.queueStatus = successStatus === 'match'
      ? 'match'
      : party.queueStatus === 'idle' ? successStatus : party.queueStatus;
    if (party.queueStatus !== 'countdown') party.countdownEndsAt = null;
    this.broadcast(party);
  }

  private cancelPartyRoom(party: Party): void {
    if (party.roomId) this.callbacks.cancelPublicQueue(party.code, party.roomId);
    party.roomId = undefined;
    party.queueStatus = 'idle';
    party.countdownEndsAt = null;
    for (const member of party.members.values()) delete member.socket.data.roomId;
  }

  private makeMember(
    socket: Socket,
    profile: CreatePartyMsg | JoinPartyMsg,
    partyCode: string,
    existingNames: string[],
  ): PartyMember {
    return {
      id: randomBytes(8).toString('hex'),
      token: randomBytes(24).toString('hex'),
      name: uniquePlayerName(normalizePlayerName(profile.name)!, existingNames),
      skin: profile.skin,
      socket,
      connected: true,
      partyCode,
    };
  }

  private bindPartySocket(socket: Socket, party: Party, member: PartyMember, resumed: boolean): void {
    socket.data.partyCode = party.code;
    socket.data.playerId = member.id;
    socket.emit(S2C.session, {
      playerId: member.id,
      resumeToken: member.token,
      resumed,
      reconnectGraceMs: this.reconnectGraceMs,
      partyCode: party.code,
      ...(party.roomId ? { roomId: party.roomId } : {}),
    });
  }

  private removeMember(party: Party, memberId: string, explicit: boolean): void {
    const member = party.members.get(memberId);
    if (!member) return;
    const timerKey = this.timerKey(party.code, memberId);
    const timer = this.disconnectTimers.get(timerKey);
    if (timer) clearTimeout(timer);
    this.disconnectTimers.delete(timerKey);
    party.members.delete(memberId);
    this.tokenParties.delete(member.token);
    if (member.socket.data.partyCode === party.code) delete member.socket.data.partyCode;
    if (!member.socket.data.roomId) delete member.socket.data.playerId;
    if (explicit) member.socket.emit(S2C.partyState, null);

    if (party.members.size === 0) {
      if (party.roomId && party.queueStatus !== 'match') this.cancelPartyRoom(party);
      this.parties.delete(party.code);
      return;
    }
    if (party.hostId === memberId) this.migrateHost(party, memberId);
    if (party.members.size >= MAX_PLAYERS) party.fillBots = false;
    this.broadcast(party);
  }

  private migrateHost(party: Party, oldHostId: string): void {
    if (party.hostId !== oldHostId) return;
    party.hostId = [...party.members.values()].find((entry) => entry.connected && entry.id !== oldHostId)?.id
      ?? [...party.members.values()].find((entry) => entry.id !== oldHostId)?.id
      ?? oldHostId;
    if (party.hostId !== oldHostId) {
      for (const member of party.members.values()) {
        if (member.connected) {
          member.socket.emit(S2C.connectionNotice, { type: 'hostChanged', playerId: party.hostId });
        }
      }
    }
  }

  private requireHost(socket: Socket, operation: PartyErrorMsg['operation']): Party | undefined {
    const party = this.partyForSocket(socket);
    const member = this.memberForSocket(socket, party);
    if (!party || !member) {
      this.error(socket, operation, 'Du bist aktuell in keiner Party.');
      return undefined;
    }
    if (party.hostId !== member.id) {
      this.error(socket, operation, 'Nur der Party-Host darf diese Aktion ausführen.');
      return undefined;
    }
    return party;
  }

  private partyForSocket(socket: Socket): Party | undefined {
    const code = typeof socket.data.partyCode === 'string' ? socket.data.partyCode : undefined;
    return code ? this.parties.get(code) : undefined;
  }

  private memberForSocket(socket: Socket, party = this.partyForSocket(socket)): PartyMember | undefined {
    const id = typeof socket.data.playerId === 'string' ? socket.data.playerId : undefined;
    return party && id ? party.members.get(id) : undefined;
  }

  private connectedMembers(party: Party): PartyMatchMember[] {
    return [...party.members.values()]
      .filter((member) => member.connected)
      .map((member) => member);
  }

  private broadcast(party: Party): void {
    const state: PartyStateMsg = {
      code: party.code,
      hostId: party.hostId,
      members: [...party.members.values()].map((member) => ({
        id: member.id,
        name: member.name,
        skin: member.skin,
        isHost: member.id === party.hostId,
        connected: member.connected,
      })),
      maxPlayers: MAX_PLAYERS,
      selection: party.selection,
      fillBots: party.members.size < MAX_PLAYERS && party.fillBots,
      queueStatus: party.queueStatus,
      ...(party.roomId ? { roomId: party.roomId } : {}),
      countdownEndsAt: party.countdownEndsAt,
    };
    for (const member of party.members.values()) {
      if (member.connected) member.socket.emit(S2C.partyState, state);
    }
  }

  private validateProfile(
    socket: Socket,
    profile: CreatePartyMsg | JoinPartyMsg,
    operation: PartyErrorMsg['operation'],
  ): boolean {
    if (!normalizePlayerName(profile.name)) {
      this.error(socket, operation, 'Der Name muss 2–16 erlaubte Zeichen enthalten.');
      return false;
    }
    if (!isPlayerSkinId(profile.skin)) {
      this.error(socket, operation, 'Diese Charakterfarbe ist nicht verfügbar.');
      return false;
    }
    return true;
  }

  private rejectAssigned(
    socket: Socket,
    operation: PartyErrorMsg['operation'],
    resumeToken?: string,
    requestedCode?: string,
  ): boolean {
    const partyCode = typeof socket.data.partyCode === 'string' ? socket.data.partyCode : undefined;
    const roomId = typeof socket.data.roomId === 'string' ? socket.data.roomId : undefined;
    const tokenParty = resumeToken ? this.tokenParties.get(resumeToken) : undefined;
    if (!partyCode && !roomId && (!tokenParty || tokenParty === requestedCode)) return false;
    if (resumeToken && partyCode && this.tokenParties.get(resumeToken) === partyCode) return false;
    this.error(socket, operation, 'Du gehörst bereits zu einer Party, Queue oder einem Match.');
    return true;
  }

  private consumeJoinAttempt(socket: Socket): boolean {
    const key = socket.handshake.address || socket.id;
    const now = Date.now();
    const current = this.joinRates.get(key);
    if (!current || current.resetAt <= now) {
      this.joinRates.set(key, { attempts: 1, resetAt: now + JOIN_WINDOW_MS });
      return true;
    }
    current.attempts += 1;
    return current.attempts <= JOIN_ATTEMPTS_PER_WINDOW;
  }

  private generateCode(): string {
    for (let attempt = 0; attempt < 100; attempt++) {
      const bytes = randomBytes(CODE_LENGTH);
      let code = '';
      for (let index = 0; index < CODE_LENGTH; index++) {
        code += CODE_ALPHABET[bytes[index] % CODE_ALPHABET.length];
      }
      if (!this.parties.has(code)) return code;
    }
    throw new Error('Party-Code konnte nicht kollisionsfrei erzeugt werden.');
  }

  private normalizeCode(code: string): string {
    return code.trim().toUpperCase();
  }

  private timerKey(code: string, memberId: string): string {
    return `${code}:${memberId}`;
  }

  private error(socket: Socket, operation: PartyErrorMsg['operation'], reason: string): void {
    socket.emit(S2C.partyError, { operation, reason } satisfies PartyErrorMsg);
  }
}
