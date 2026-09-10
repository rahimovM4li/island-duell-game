// Test-only IPC control; no debug routes or events are exposed by the game server.
import { startServer } from '../../../server/src/index';

const server = await startServer(3192, { timeScale: 0.1 });
process.on('message', async (message: { id: number; action: string }) => {
  try {
    const room = (server.rooms as any).rooms.get(server.rooms.roomIds()[0]);
    if (message.action === 'finishRound') {
      const bot = [...room.players.values()].find((player: any) => player.isBot);
      room.kill(bot, null, 'zone');
      room.flushDeaths([]);
      room.checkRoundEnd();
    } else if (message.action === 'finishMatch') {
      room.endMatch();
    }
    process.send?.({ id: message.id, state: {
      running: room?.started ?? false,
      roundActive: room?.roundActive ?? false,
      seed: room?.seed,
      players: room?.players.size ?? 0,
      roomCount: server.rooms.roomCount,
    } });
  } catch (error) {
    process.send?.({ id: message.id, error: String(error) });
  }
});
process.send?.({ ready: true });
