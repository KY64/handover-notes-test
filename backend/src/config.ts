import 'dotenv/config';

function numberFromEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) throw new Error(`${name} must be a positive number`);
  return parsed;
}

export const config = {
  port: numberFromEnv('PORT', 8787),
  hotelId: process.env.HOTEL_ID ?? 'lumen-sg',
  hotelTimezone: process.env.HOTEL_TIMEZONE ?? '+08:00',
  databaseUrl: process.env.DATABASE_URL ?? 'postgres://postgres:postgres@localhost:5432/postgres',
  redisUrl: process.env.REDIS_URL ?? 'redis://localhost:6379',
  jwtSecret: process.env.JWT_SECRET ?? 'dev-only-change-me-please',
  corsOrigins: (process.env.CORS_ORIGIN ?? 'http://localhost:5173').split(',').map((origin) => origin.trim()).filter(Boolean),
  rateLimitEnabled: process.env.RATE_LIMIT_ENABLED !== 'false',
  rateLimitWindowSeconds: numberFromEnv('RATE_LIMIT_WINDOW_SECONDS', 300),
  rateLimitMaxRequests: numberFromEnv('RATE_LIMIT_MAX_REQUESTS', 20),
  openRouterApiKey: process.env.OPENROUTER_API_KEY,
  openRouterModel: process.env.OPENROUTER_MODEL ?? 'openai/gpt-4o-mini',
  openRouterBaseUrl: process.env.OPENROUTER_BASE_URL ?? 'https://openrouter.ai/api/v1',
  awsRegion: process.env.AWS_REGION ?? 'ap-southeast-1',
  s3Bucket: process.env.AWS_S3_BUCKET ?? 'handover-shift-notes-ky64-poc',
  s3PublicBaseUrl: process.env.S3_PUBLIC_BASE_URL
};
