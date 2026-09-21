import { startServer } from '../../../server/src/index';
import { freshMoveState } from '../../../shared/src/movement';
import { sampleHeight } from '../../../shared/src/terrain';

const server = await startServer(3193);
process.on('message', (message: { id: number; action: string }) => {
  try {
    const room = (server.rooms as any).rooms.get(server.rooms.roomIds()[0]);
    const player = room && [...room.players.values()].find((p: any) => !p.isBot) as any;
    let yaw: number | undefined;
    if (message.action.startsWith('visit-')) {
      room.tickBots = () => {};
      const place = message.action.slice(6);
      const poi = room.gen.pois.find((p: any) => p.id === (place.startsWith('bunker') ? 'bunker' : 'watchtower'));
      const rear = place === 'bunker-rear';
      const lx = rear ? 0 : 8, lz = rear ? -5.5 : 15;
      const x = place === 'ruins' ? 0 : poi.x + Math.cos(poi.rootYaw) * lx + Math.sin(poi.rootYaw) * lz;
      const z = place === 'ruins' ? 31 : poi.z - Math.sin(poi.rootYaw) * lx + Math.cos(poi.rootYaw) * lz;
      player.move = freshMoveState({ x, y: sampleHeight(room.gen.params, x, z) + 0.25, z });
      room.phys.setPlayerPos(player.id, player.move.pos);
      player.inv.primary = { type: 'rifle', mag: 20 }; player.inv.active = 2;
      room.pushInventory(player);
      yaw = place === 'ruins' ? 0 : Math.atan2(x - poi.x, z - poi.z);
      for (const bot of room.players.values() as Iterable<any>) if (bot.isBot) {
        const bx = poi.x + Math.cos(poi.rootYaw) * -2, bz = poi.z - Math.sin(poi.rootYaw) * -2;
        bot.move = freshMoveState({ x: bx, y: sampleHeight(room.gen.params, bx, bz) + 0.1, z: bz });
        room.phys.setPlayerPos(bot.id, bot.move.pos);
        bot.yaw = poi.rootYaw;
      }
    }
    if (message.action === 'prepare') {
      room.tickBots = () => {};
      const wreck = room.gen.pois.find((p: any) => p.id === 'wreck');
      const x = wreck.x - Math.cos(wreck.rootYaw) * 11 + Math.sin(wreck.rootYaw) * 6;
      const z = wreck.z + Math.sin(wreck.rootYaw) * 11 + Math.cos(wreck.rootYaw) * 6;
      player.move = freshMoveState({ x, y: sampleHeight(room.gen.params, x, z) + 0.1, z });
      room.phys.setPlayerPos(player.id, player.move.pos);
      player.inv.primary = { type: 'rifle', mag: 20 };
      player.inv.secondary = { type: 'pistol', mag: 7 };
      player.inv.active = 2;
      player.inv.ammo.rifle = 60;
      player.inv.ammo.pistol = 48;
      player.inv.throwables = { frag: 1, smoke: 1, flash: 1 };
      room.pushInventory(player);
      yaw = Math.atan2(x - wreck.x, z - wreck.z);
    }
    if (message.action === 'empty-slots') {
      player.inv.primary = player.inv.secondary = null;
      player.inv.throwables = { frag: 0, smoke: 0, flash: 0 };
      player.inv.active = 1;
      room.pushInventory(player);
    }
    process.send?.({ id: message.id, state: { ready: !!player, yaw, mag: player?.inv.primary?.mag, reloading: player?.reloadUntil > 0, active: player?.inv.active, throwables: player?.inv.throwables, readyToFire: !!player && room.t >= player.cooldownUntil } });
  } catch (error) { process.send?.({ id: message.id, error: String(error) }); }
});
process.send?.({ ready: true });
