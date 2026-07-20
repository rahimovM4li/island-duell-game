// Socket.io client wrapper: typed emit/on helpers for the §8 message catalog.
import { io, Socket } from 'socket.io-client';
import { C2S, S2C, PROTOCOL_VERSION } from '@shared/protocol';
import type {
  GameEvent, InputMsg, LobbyStateMsg, MatchEndMsg, MatchStartMsg,
  RoundEndMsg, RoundStartMsg, SnapshotMsg,
} from '@shared/protocol';
import type { Recipe } from '@shared/constants';

export interface NetHandlers {
  onLobby(m: LobbyStateMsg): void;
  onJoinError(msg: string): void;
  onMatchStart(m: MatchStartMsg): void;
  onRoundStart(m: RoundStartMsg): void;
  onSnapshot(m: SnapshotMsg): void;
  onEvents(evs: GameEvent[]): void;
  onRoundEnd(m: RoundEndMsg): void;
  onMatchEnd(m: MatchEndMsg): void;
  onDisconnect(): void;
}

export class Net {
  socket: Socket;
  /** bytes received in the current stats window (F3 debug) */
  bytesIn = 0;

  constructor(url: string | undefined, h: NetHandlers) {
    this.socket = url ? io(url, { transports: ['websocket'] }) : io({ transports: ['websocket'] });

    this.socket.on(S2C.lobbyState, (m) => h.onLobby(m));
    this.socket.on(S2C.joinError, (m) => h.onJoinError(typeof m === 'string' ? m : m?.reason ?? 'Beitritt abgelehnt'));
    this.socket.on(S2C.matchStart, (m) => h.onMatchStart(m));
    this.socket.on(S2C.roundStart, (m) => h.onRoundStart(m));
    this.socket.on(S2C.snapshot, (m) => { this.bytesIn += JSON.stringify(m).length; h.onSnapshot(m); });
    this.socket.on(S2C.event, (evs) => h.onEvents(Array.isArray(evs) ? evs : [evs]));
    this.socket.on(S2C.roundEnd, (m) => h.onRoundEnd(m));
    this.socket.on(S2C.matchEnd, (m) => h.onMatchEnd(m));
    this.socket.on('disconnect', () => h.onDisconnect());
  }

  get id(): string { return this.socket.id ?? ''; }

  join(name: string): void { this.socket.emit(C2S.join, { v: PROTOCOL_VERSION, name }); }
  setReady(ready: boolean): void { this.socket.emit(C2S.setReady, { ready }); }
  startMatch(): void { this.socket.emit(C2S.startMatch); }
  sendInput(inp: InputMsg): void { this.socket.emit(C2S.input, inp); }
  craft(recipe: Recipe): void { this.socket.emit(C2S.craft, { recipe }); }
  useBandage(): void { this.socket.emit(C2S.useBandage); }
  rematch(): void { this.socket.emit(C2S.rematch); }
}
