// Island Duell LAN host: `npm start` → other players open http://<LAN-IP>:3000 (§8).
import { createServer } from 'node:http';
import { networkInterfaces } from 'node:os';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import express from 'express';
import { Server } from 'socket.io';
import RAPIER from '@dimforge/rapier3d-compat';
import { DEFAULT_PORT } from '@shared/constants';
import { GameRoom } from './game';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface StartedServer {
  port: number;
  close: () => Promise<void>;
}

export async function startServer(port = Number(process.env.PORT ?? DEFAULT_PORT)): Promise<StartedServer> {
  await RAPIER.init();

  const app = express();
  const http = createServer(app);
  const io = new Server(http, { cors: { origin: '*' } });

  const room = new GameRoom(io, RAPIER);

  app.get('/health', (_req, res) => res.json({ ok: true }));

  const dist = path.resolve(__dirname, '../../client/dist');
  if (existsSync(dist)) {
    app.use(express.static(dist));
    app.get(/^\/(?!socket\.io|health).*/, (_req, res) => res.sendFile(path.join(dist, 'index.html')));
  } else {
    app.get('/', (_req, res) => res.send(
      'Island Duell server läuft. Client-Build fehlt — `npm run build` ausführen oder im Dev-Modus den Vite-Client (Port 5173) nutzen.',
    ));
  }

  await new Promise<void>((resolve) => http.listen(port, '0.0.0.0', resolve));

  const addrs: string[] = [];
  for (const list of Object.values(networkInterfaces())) {
    for (const ni of list ?? []) {
      if (ni.family === 'IPv4' && !ni.internal) addrs.push(ni.address);
    }
  }
  console.log(`\n  Island Duell — Host läuft auf Port ${port}`);
  console.log(`  Lokal:    http://localhost:${port}`);
  for (const a of addrs) console.log(`  Im WLAN:  http://${a}:${port}`);
  console.log('');

  return {
    port,
    close: () => new Promise((resolve) => {
      room.dispose();
      io.close();
      http.close(() => resolve());
    }),
  };
}

// direct execution (not imported by tests)
const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
if (isMain) {
  startServer().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
