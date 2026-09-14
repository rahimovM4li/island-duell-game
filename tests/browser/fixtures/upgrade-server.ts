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
      player.inv.active = 2;
      player.inv.ammo.rifle = 60;
      player.inv.ammo.pistol = 48;
      player.inv.throwables = { frag: 1, smoke: 1, flash: 1 };
      room.pushInventory(player);
      yaw = Math.atan2(x - wreck.x, z - wreck.z);
    }
    if (message.action === 'preview-model') {
      const bot = [...room.players.values()].find((p: any) => p.isBot) as any;
      const { x, z } = player.move.pos;
      // Choose a nearby point at the same terrain height for an unobstructed model view.
      let angle = 0, best = Infinity;
      for (let i = 0; i < 32; i++) {
        const a = i * Math.PI / 16;
        const h = sampleHeight(room.gen.params, x + Math.cos(a) * 3.2, z + Math.sin(a) * 3.2);
        const error = Math.abs(h - player.move.pos.y);
        if (error < best) { best = error; angle = a; }
      }
      const position = { x: x + Math.cos(angle) * 3.2, y: sampleHeight(room.gen.params, x + Math.cos(angle) * 3.2, z + Math.sin(angle) * 3.2) + 0.1, z: z + Math.sin(angle) * 3.2 };
      bot.move = freshMoveState(position);
      room.phys.setPlayerPos(bot.id, position);
      bot.inv.active = 1;
      bot.yaw = Math.atan2(position.x - x, position.z - z);
      yaw = Math.atan2(x - position.x, z - position.z);
      player.blindUntil = 0;
      player.blindIntensity = 0;
    }
    process.send?.({ id: message.id, state: { ready: !!player, yaw, mag: player?.inv.primary?.mag, reloading: player?.reloadUntil > 0, active: player?.inv.active, throwables: player?.inv.throwables, readyToFire: !!player && room.t >= player.cooldownUntil } });
  } catch (error) { process.send?.({ id: message.id, error: String(error) }); }
});
process.send?.({ ready: true });
