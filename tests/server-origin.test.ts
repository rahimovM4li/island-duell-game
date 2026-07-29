import { describe, expect, it } from 'vitest';
import { isOriginAllowed } from '../server/src/index';

describe('public Socket.IO origin allowlist', () => {
  it('allows same-host tools, localhost, Render and explicitly configured Poki origins', () => {
    expect(isOriginAllowed(undefined)).toBe(true);
    expect(isOriginAllowed('http://localhost:5173')).toBe(true);
    expect(isOriginAllowed('http://127.0.0.1:3191')).toBe(true);
    expect(isOriginAllowed('https://island-duell-game.onrender.com')).toBe(true);
    expect(isOriginAllowed('https://game.example.poki.test', ['https://game.example.poki.test'])).toBe(true);
  });

  it('rejects unconfigured cross-origin browsers', () => {
    expect(isOriginAllowed('https://unrelated.example')).toBe(false);
  });
});
