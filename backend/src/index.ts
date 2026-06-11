import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { requestId } from 'hono/request-id';
import { config } from './config.js';
import { log } from './logger.js';
import { rateLimit } from './middleware/rateLimit.js';
import { authRoutes } from './routes/auth.js';
import { eventRoutes } from './routes/events.js';
import { reconcileRoutes } from './routes/reconcile.js';

const app = new Hono();
app.use('*', requestId());
app.use('*', cors({ origin: config.corsOrigins, allowHeaders: ['Content-Type', 'Authorization'], allowMethods: ['GET', 'POST', 'PATCH', 'OPTIONS'] }));
app.use('*', rateLimit);
app.use('*', async (c, next) => {
  const start = Date.now();
  await next();
  log('info', 'request completed', { requestId: c.get('requestId'), method: c.req.method, path: c.req.path, status: c.res.status, durationMs: Date.now() - start });
});

app.get('/health', (c) => c.json({ ok: true, service: 'handover-api' }));
app.route('/auth', authRoutes);
app.route('/events', eventRoutes);
app.route('/reconcile', reconcileRoutes);

serve({ fetch: app.fetch, port: config.port });
log('info', 'api server started', { port: config.port });
