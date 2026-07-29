// Island Duell LAN host: `npm start` → other players open http://<LAN-IP>:3000 (§8).
import { createServer } from 'node:http';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import express from 'express';
import { Server } from 'socket.io';
import RAPIER from '@dimforge/rapier3d-compat';
import { DEFAULT_PORT } from '@shared/constants';
import { RoomManager, type RoomManagerOptions } from './room-manager';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface StartedServer {
  port: number;
  rooms: RoomManager;
  close: () => Promise<void>;
}

export interface StartServerOptions extends RoomManagerOptions {
  corsOrigins?: string[];
}

const DEFAULT_PUBLIC_ORIGINS = ['https://island-duell-game.onrender.com'];

export function isOriginAllowed(origin: string | undefined, configured: string[] = []): boolean {
  if (!origin) return true;
  if (/^http:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/.test(origin)) return true;
  return [...DEFAULT_PUBLIC_ORIGINS, ...configured].includes(origin);
}

export async function startServer(
  port = Number(process.env.PORT ?? DEFAULT_PORT),
  options: StartServerOptions = {},
): Promise<StartedServer> {
  await RAPIER.init();

  const app = express();
  const http = createServer(app);
  const envOrigins = (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  const configuredOrigins = options.corsOrigins ?? envOrigins;
  const originAllowed = (origin: string | undefined) => isOriginAllowed(origin, configuredOrigins);
  const io = new Server(http, {
    cors: {
      origin: (origin, callback) => callback(null, originAllowed(origin)),
      credentials: false,
    },
    allowRequest: (request, callback) => callback(null, originAllowed(request.headers.origin)),
  });

  const rooms = new RoomManager(io, RAPIER, options);

  app.get('/health', (_req, res) => res.json({
    ok: true,
    rooms: rooms.roomCount,
    parties: rooms.partyCount,
  }));

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

  console.log(`\n  Island Duell — Server läuft auf Port ${port}\n`);

  return {
    port,
    rooms,
    close: () => new Promise((resolve) => {
      rooms.dispose();
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
