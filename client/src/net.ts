// Socket.io client wrapper: typed emit/on helpers for the §8 message catalog.
import { io, Socket } from 'socket.io-client';
import { C2S, S2C, PROTOCOL_VERSION } from '@shared/protocol';
import type {
  GameEvent, InputMsg, KickedMsg, LobbyStateMsg, MatchEndMsg, MatchStartMsg,
  RoundEndMsg, RoundStartMsg, SessionMsg, SnapshotMsg,
} from '@shared/protocol';
import type { BotDifficulty, MatchMode, Recipe } from '@shared/constants';

export interface NetHandlers {
  onLobby(m: LobbyStateMsg): void;
  onJoinError(msg: string): void;
  onKicked(msg: KickedMsg): void;
  onMatchStart(m: MatchStartMsg): void;
  onRoundStart(m: RoundStartMsg): void;
  onSnapshot(m: SnapshotMsg): void;
  onEvents(evs: GameEvent[]): void;
  onRoundEnd(m: RoundEndMsg): void;
  onMatchEnd(m: MatchEndMsg): void;
  onSession(m: SessionMsg): void;
  onConnectionState(state: 'connected' | 'disconnected' | 'error', detail?: string): void;
  onConnectionNotice(notice: { type: 'lost' | 'reconnected' | 'hostChanged'; playerId: string; graceMs?: number }): void;
}

export class Net {
  socket: Socket;
  /** bytes received in the current stats window (F3 debug) */
  bytesIn = 0;
  playerId = '';
  rttMs = 0;
  jitterMs = 0;
  lossPct = 0;
  private sentProbes = 0;
  private lostProbes = 0;
  private pendingProbes = new Map<number, number>();
  private probeSeq = 0;
  private probeHandle: ReturnType<typeof setInterval>;
  private disposed = false;

  constructor(url: string | undefined, h: NetHandlers) {
    const options = {
      transports: ['websocket'] as ('websocket')[],
      reconnection: true, reconnectionDelay: 500, reconnectionDelayMax: 2500,
    };
    this.socket = url ? io(url, options) : io(options);

    this.socket.on(S2C.lobbyState, (m) => h.onLobby(m));
    this.socket.on(S2C.session, (m: SessionMsg) => { this.playerId = m.playerId; h.onSession(m); });
    this.socket.on(S2C.connectionNotice, (m) => h.onConnectionNotice(m));
    this.socket.on(S2C.joinError, (m) => h.onJoinError(typeof m === 'string' ? m : m?.reason ?? 'Beitritt abgelehnt'));
    this.socket.on(S2C.kicked, (m: KickedMsg) => h.onKicked(m));
    this.socket.on(S2C.matchStart, (m) => h.onMatchStart(m));
    this.socket.on(S2C.roundStart, (m) => h.onRoundStart(m));
    this.socket.on(S2C.snapshot, (m) => { this.bytesIn += JSON.stringify(m).length; h.onSnapshot(m); });
    this.socket.on(S2C.event, (evs) => h.onEvents(Array.isArray(evs) ? evs : [evs]));
    this.socket.on(S2C.roundEnd, (m) => h.onRoundEnd(m));
    this.socket.on(S2C.matchEnd, (m) => h.onMatchEnd(m));
    this.socket.on('connect', () => h.onConnectionState('connected'));
    this.socket.on('disconnect', (reason) => h.onConnectionState('disconnected', reason));
    this.socket.on('connect_error', (error) => h.onConnectionState('error', error.message));
    this.probeHandle = setInterval(() => this.probe(), 2000);
  }

  get id(): string { return this.playerId; }

  join(name: string, resumeToken?: string): void {
    this.socket.emit(C2S.join, { v: PROTOCOL_VERSION, name, ...(resumeToken ? { resumeToken } : {}) });
  }
  setReady(ready: boolean): void { this.socket.emit(C2S.setReady, { ready }); }
  startMatch(mode: MatchMode): void { this.socket.emit(C2S.startMatch, { mode }); }
  startPractice(bots: number, difficulty: BotDifficulty, mode: MatchMode): void {
    this.socket.emit(C2S.startPractice, { bots, difficulty, mode });
  }
  sendInput(inp: InputMsg): void { this.socket.emit(C2S.input, inp); }
  craft(recipe: Recipe): void { this.socket.emit(C2S.craft, { recipe }); }
  useBandage(): void { this.socket.emit(C2S.useBandage); }
  rematch(): void { this.socket.emit(C2S.rematch); }
  kickPlayer(playerId: string): void { this.socket.emit(C2S.kickPlayer, { playerId }); }

  leaveGame(): Promise<void> {
    if (!this.socket.connected) return Promise.resolve();
    return new Promise((resolve) => {
      let done = false;
      const finish = () => { if (!done) { done = true; resolve(); } };
      const timer = setTimeout(finish, 800);
      this.socket.emit(C2S.leaveGame, () => { clearTimeout(timer); finish(); });
    });
  }

  /** Stop reconnects, probes and event delivery before replacing this session. */
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    clearInterval(this.probeHandle);
    this.pendingProbes.clear();
    this.socket.removeAllListeners();
    this.socket.disconnect();
  }

  private probe(): void {
    if (this.disposed) return;
    const now = performance.now();
    for (const [id, at] of this.pendingProbes) {
      if (now - at > 4500) { this.pendingProbes.delete(id); this.lostProbes += 1; }
    }
    if (!this.socket.connected) { this.updateLoss(); return; }
    const id = ++this.probeSeq;
    this.pendingProbes.set(id, now);
    this.sentProbes += 1;
    this.socket.emit(C2S.pingProbe, id, () => {
      const started = this.pendingProbes.get(id);
      if (started === undefined) return;
      this.pendingProbes.delete(id);
      const rtt = performance.now() - started;
      this.jitterMs = this.rttMs ? this.jitterMs * 0.75 + Math.abs(rtt - this.rttMs) * 0.25 : 0;
      this.rttMs = this.rttMs ? this.rttMs * 0.72 + rtt * 0.28 : rtt;
      this.updateLoss();
    });
  }

  private updateLoss(): void {
    this.lossPct = this.sentProbes > 0 ? this.lostProbes / this.sentProbes * 100 : 0;
    if (this.sentProbes > 50) { this.sentProbes = Math.ceil(this.sentProbes / 2); this.lostProbes = Math.ceil(this.lostProbes / 2); }
  }
}
