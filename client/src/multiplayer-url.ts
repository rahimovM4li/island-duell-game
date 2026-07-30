export interface MultiplayerUrlEnvironment {
  override?: string;
  dev: boolean;
  pageProtocol: string;
}

export function resolveMultiplayerUrl(environment: MultiplayerUrlEnvironment): string | undefined {
  const override = environment.override?.trim();
  if (override) {
    let parsed: URL;
    try {
      parsed = new URL(override);
    } catch {
      throw new Error('VITE_MULTIPLAYER_URL ist keine gültige URL (inklusive Protokoll angeben, z. B. https://…).');
    }
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new Error('VITE_MULTIPLAYER_URL muss eine HTTP- oder HTTPS-Adresse sein.');
    }
    if (!environment.dev && environment.pageProtocol === 'https:' && parsed.protocol === 'http:') {
      // upgrading is only safe on default ports — with an explicit port the
      // server almost certainly does not speak HTTPS there, so fail loudly
      if (parsed.port) {
        throw new Error(
          'VITE_MULTIPLAYER_URL verwendet HTTP mit explizitem Port auf einer HTTPS-Seite — bitte eine HTTPS-Adresse konfigurieren.',
        );
      }
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
