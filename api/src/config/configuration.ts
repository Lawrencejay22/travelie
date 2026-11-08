export interface AppConfig {
  nodeEnv: string;
  port: number;
  databaseUrl: string;
  jwtAccessSecret: string;
  jwtAccessTtl: string;
  corsOrigins: string[];
  publicApiUrl: string;
  googleMapsApiKey?: string;
  googleOAuthClientIds: string[];
}

export function loadConfig(): AppConfig {
  const env = process.env;
  const databaseUrl = env.DATABASE_URL;
  const jwtAccessSecret = env.JWT_ACCESS_SECRET;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required');
  }
  if (!jwtAccessSecret || jwtAccessSecret.length < 16) {
    throw new Error('JWT_ACCESS_SECRET must be at least 16 characters');
  }

  return {
    nodeEnv: env.NODE_ENV ?? 'development',
    port: Number(env.PORT ?? 4000),
    databaseUrl,
    jwtAccessSecret,
    jwtAccessTtl: env.JWT_ACCESS_TTL ?? '15m',
    corsOrigins: (
      env.CORS_ORIGIN ?? 'http://localhost:5173,http://localhost:8081'
    )
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
    publicApiUrl: env.PUBLIC_API_URL ?? 'http://localhost:4000',
    googleMapsApiKey: env.GOOGLE_MAPS_API_KEY,
    googleOAuthClientIds: (env.GOOGLE_OAUTH_CLIENT_IDS ?? '')
      .split(',')
      .map((clientId) => clientId.trim())
      .filter(Boolean),
  };
}
