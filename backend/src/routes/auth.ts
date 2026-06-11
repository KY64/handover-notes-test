import { Hono } from 'hono';
import { getUserById, login, signup } from '../services/auth.js';
import { requireAuth } from '../middleware/auth.js';

export const authRoutes = new Hono<{ Variables: { userId: string } }>();

authRoutes.post('/signup', async (c) => {
  try {
    return c.json(await signup(await c.req.json()), 201);
  } catch (error: any) {
    if (error?.code === '23505') return c.json({ error: 'Email is already registered' }, 409);
    return c.json({ error: error?.message ?? 'Invalid signup request' }, 400);
  }
});

authRoutes.post('/login', async (c) => {
  const result = await login(await c.req.json());
  if (!result) return c.json({ error: 'Invalid email or password' }, 401);
  return c.json(result);
});

authRoutes.get('/me', requireAuth, async (c) => {
  return c.json({ user: await getUserById(c.get('userId')) });
});
