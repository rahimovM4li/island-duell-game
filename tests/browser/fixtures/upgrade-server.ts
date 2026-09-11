import { startServer } from '../../../server/src/index';
import { freshMoveState } from '../../../shared/src/movement';
import { sampleHeight } from '../../../shared/src/terrain';

const server = await startServer(3193);
process.on('message', (message: { id: number; action: string }) => {
  try {
    const room = (server.rooms as any).rooms.get(server.rooms.roomIds()[0]);
    const player = room && [...room.players.values()].find((p: any) => !p.isBot) as any;
    let yaw: number | undefined;
    if (message.action === 'prepare') {
      room.tickBots = () => {};
      const wreck = room.gen.pois.find((p: any) => p.id === 'wreck');
      const x = wreck.x - Math.cos(wreck.rootYaw) * 11 + Math.sin(wreck.rootYaw) * 6;
      const z = wreck.z + Math.sin(wreck.rootYaw) * 11 + Math.cos(wreck.rootYaw) * 6;
      player.move = freshMoveState({ x, y: sampleHeight(room.gen.params, x, z) + 0.1, z });
      room.phys.setPlayerPos(player.id, player.move.pos);
      player.inv.primary = { type: 'rifle', mag: 20 };
      player.inv.secondary = { type: 'pistol', mag: 7 };
      player.inv.active = 1;
      player.inv.ammo.rifle = 60;
      player.inv.ammo.pistol = 48;
      room.pushInventory(player);
      yaw = Math.atan2(x - wreck.x, z - wreck.z);
    }
    process.send?.({ id: message.id, state: { ready: !!player, yaw, mag: player?.inv.primary?.mag, reloading: player?.reloadUntil > 0 } });
  } catch (error) { process.send?.({ id: message.id, error: String(error) }); }
});
process.send?.({ ready: true });
