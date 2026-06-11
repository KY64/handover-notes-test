import { Hono } from 'hono';
import { ZodError } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { reconcileAndWrite } from '../services/reconcile.js';

export const reconcileRoutes = new Hono<{ Variables: { userId: string } }>();

reconcileRoutes.post('/', requireAuth, async (c) => {
  try {
    const result = await reconcileAndWrite(await c.req.json(), c.get('userId'));
    return c.json(result, 201);
  } catch (error: any) {
    if (error instanceof ZodError) {
      return c.json({
        error: 'Invalid reconciliation input. Required shift format: shiftStartDate must be yyyy-mm-dd and shiftKind must be one of day, night, morning. The resulting shiftId format is yyyy-mm-dd-day, yyyy-mm-dd-night, or yyyy-mm-dd-morning.',
        details: error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message }))
      }, 400);
    }
    return c.json({ error: error?.message ?? 'Could not reconcile note' }, 400);
  }
});
