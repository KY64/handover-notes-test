import { Hono } from 'hono';
import { createEvent, listEvents, updateEvent } from '../services/events.js';
import { requireAuth } from '../middleware/auth.js';
import { addThread, listThreads } from '../services/threads.js';
import { log } from '../logger.js';

export const eventRoutes = new Hono<{ Variables: { userId: string } }>();

eventRoutes.get('/', async (c) => {
  const status = c.req.query('status');
  const room = c.req.query('room');
  return c.json({ events: await listEvents({ status, room }) });
});

eventRoutes.post('/', requireAuth, async (c) => {
  try {
    const event = await createEvent(await c.req.json(), c.get('userId'));
    log('info', 'event created', { requestId: c.get('requestId'), eventId: event.id, userId: c.get('userId'), status: event.status, priority: event.priority, source: event.source });
    return c.json({ event }, 201);
  } catch (error: any) {
    return c.json({ error: error?.message ?? 'Invalid event' }, 400);
  }
});

eventRoutes.patch('/:id', requireAuth, async (c) => {
  try {
    const event = await updateEvent(c.req.param('id'), await c.req.json(), c.get('userId'));
    if (!event) return c.json({ error: 'Event not found' }, 404);
    log('info', 'event updated', { requestId: c.get('requestId'), eventId: event.id, userId: c.get('userId'), status: event.status, priority: event.priority, prioritySource: event.prioritySource });
    return c.json({ event });
  } catch (error: any) {
    return c.json({ error: error?.message ?? 'Invalid update' }, 400);
  }
});


eventRoutes.get('/:id/threads', requireAuth, async (c) => {
  const eventId = c.req.param('id');
  const threads = await listThreads(eventId);
  log('info', 'event threads listed', { requestId: c.get('requestId'), eventId, userId: c.get('userId'), threadCount: threads.length });
  return c.json({ threads });
});

eventRoutes.post('/:id/threads', requireAuth, async (c) => {
  try {
    const body = await c.req.parseBody();
    const image = body.image instanceof File ? body.image : null;
    const thread = await addThread(c.req.param('id'), {
      message: String(body.message ?? ''),
      statusAfter: body.statusAfter ? String(body.statusAfter) : null,
      priorityAfter: body.priorityAfter ? String(body.priorityAfter) : null,
      image
    }, c.get('userId'));
    if (!thread) return c.json({ error: 'Event not found' }, 404);
    log('info', 'event thread created', { requestId: c.get('requestId'), eventId: c.req.param('id'), threadId: thread.id, userId: c.get('userId'), hasImage: Boolean(thread.imageUrl), statusAfter: thread.statusAfter, priorityAfter: thread.priorityAfter });
    return c.json({ thread }, 201);
  } catch (error: any) {
    return c.json({ error: error?.message ?? 'Invalid thread' }, 400);
  }
});
