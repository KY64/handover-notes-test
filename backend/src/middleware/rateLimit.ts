import { createMiddleware } from 'hono/factory';
import { Redis } from 'ioredis';
import { config } from '../config.js';
import { log } from '../logger.js';

const redis = config.redisUrl ? new Redis(config.redisUrl, { lazyConnect: true, maxRetriesPerRequest: 1 }) : null;
const memory = new Map<string, number[]>();
let redisReady = false;

async function ensureRedis() {
  if (!redis || redisReady) return redisReady;
  try {
    await redis.connect();
    redisReady = true;
  } catch (error) {
    log('warn', 'redis unavailable; using in-memory rate limit', { error: error instanceof Error ? error.message : String(error) });
  }
  return redisReady;
}

export const rateLimit = createMiddleware(async (c, next) => {
  if (!config.rateLimitEnabled) return next();
  const ip = c.req.header('x-forwarded-for')?.split(',')[0]?.trim() || c.req.header('x-real-ip') || 'local';
  const key = `rate:${ip}`;
  const now = Date.now();
  const windowMs = config.rateLimitWindowSeconds * 1000;
  let count = 0;

  if (await ensureRedis()) {
    const member = `${now}:${Math.random()}`;
    const min = now - windowMs;
    const pipeline = redis!.pipeline();
    pipeline.zremrangebyscore(key, 0, min);
    pipeline.zadd(key, now, member);
    pipeline.zcard(key);
    pipeline.pexpire(key, windowMs);
    const results = await pipeline.exec();
    count = Number(results?.[2]?.[1] ?? 0);
  } else {
    const active = (memory.get(key) ?? []).filter((time) => time > now - windowMs);
    active.push(now);
    memory.set(key, active);
    count = active.length;
  }

  const remaining = Math.max(config.rateLimitMaxRequests - count, 0);
  c.header('X-RateLimit-Limit', String(config.rateLimitMaxRequests));
  c.header('X-RateLimit-Remaining', String(remaining));
  if (count > config.rateLimitMaxRequests) {
    c.header('Retry-After', String(config.rateLimitWindowSeconds));
    log('warn', 'rate limit rejected request', { path: c.req.path, ip, count });
    return c.json({ error: 'Too many requests' }, 429);
  }
  await next();
});
