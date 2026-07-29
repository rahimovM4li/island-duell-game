export interface MultiplayerUrlEnvironment {
  override?: string;
  dev: boolean;
  pageProtocol: string;
}

export function resolveMultiplayerUrl(environment: MultiplayerUrlEnvironment): string | undefined {
  const override = environment.override?.trim();
  if (override) {
    const parsed = new URL(override);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new Error('VITE_MULTIPLAYER_URL muss eine HTTP- oder HTTPS-Adresse sein.');
    }
    if (!environment.dev && environment.pageProtocol === 'https:' && parsed.protocol === 'http:') {
      parsed.protocol = 'https:';
    }
    return parsed.toString().replace(/\/$/, '');
  }
  if (environment.dev) return 'http://localhost:3000';
  return undefined;
}

export function currentMultiplayerUrl(): string | undefined {
  return resolveMultiplayerUrl({
    override: import.meta.env.VITE_MULTIPLAYER_URL,
    dev: import.meta.env.DEV,
    pageProtocol: location.protocol,
  });
}
