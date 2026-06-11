import { createMiddleware } from 'hono/factory';
import { getUserById, verifyToken } from '../services/auth.js';

type Variables = { userId: string };

export const requireAuth = createMiddleware<{ Variables: Variables }>(async (c, next) => {
  const header = c.req.header('authorization') ?? '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) return c.json({ error: 'Authentication required' }, 401);
  try {
    const userId = await verifyToken(match[1]);
    const user = await getUserById(userId);
    if (!user) return c.json({ error: 'Authentication required' }, 401);
    c.set('userId', user.id);
    await next();
  } catch {
    return c.json({ error: 'Authentication required' }, 401);
  }
});
