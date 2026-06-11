import { randomUUID } from 'node:crypto';
import { eventStatusSchema, prioritySchema } from '@handover/shared';
import { query } from '../db/pool.js';
import { config } from '../config.js';
import { uploadThreadImage } from './s3.js';
import { log } from '../logger.js';
import { updateEvent } from './events.js';

type ThreadRow = {
  id: string;
  event_id: string;
  message: string;
  image_url: string | null;
  image_key: string | null;
  status_after: 'resolved' | 'unresolved' | 'pending' | null;
  priority_after: 'critical' | 'high' | 'medium' | 'low' | null;
  created_by_user_id: string | null;
  created_at: Date;
  author_name: string | null;
  author_email: string | null;
};

function toThread(row: ThreadRow) {
  return {
    id: row.id,
    eventId: row.event_id,
    message: row.message,
    imageUrl: row.image_url,
    imageKey: row.image_key,
    statusAfter: row.status_after,
    priorityAfter: row.priority_after,
    createdByUserId: row.created_by_user_id,
    createdAt: row.created_at.toISOString(),
    authorName: row.author_name,
    authorEmail: row.author_email
  };
}

export async function listThreads(eventId: string) {
  const result = await query<ThreadRow>(
    `SELECT t.*, u.name AS author_name, u.email AS author_email
     FROM event_threads t
     LEFT JOIN users u ON u.id = t.created_by_user_id
     JOIN events e ON e.id = t.event_id
     WHERE t.event_id = $1 AND e.hotel_id = $2
     ORDER BY t.created_at ASC`,
    [eventId, config.hotelId]
  );
  return result.rows.map(toThread);
}

export async function addThread(eventId: string, input: { message: string; statusAfter?: string | null; priorityAfter?: string | null; image?: File | null }, userId: string) {
  const message = input.message.trim();
  if (!message) throw new Error('Thread message is required');
  if (message.length > 2000) throw new Error('Thread message must be 2000 characters or less');
  const statusAfter = input.statusAfter ? eventStatusSchema.parse(input.statusAfter) : null;
  const priorityAfter = input.priorityAfter ? prioritySchema.parse(input.priorityAfter) : null;

  const existing = await query('SELECT id FROM events WHERE id = $1 AND hotel_id = $2', [eventId, config.hotelId]);
  if (!existing.rows[0]) return null;

  let image: { key: string; url: string } | null = null;
  if (input.image) {
    image = await uploadThreadImage(eventId, input.image);
    log('info', 'thread image uploaded', { eventId, imageKey: image.key, imageUrl: image.url, contentType: input.image.type, size: input.image.size });
  }

  if (statusAfter || priorityAfter) {
    await updateEvent(eventId, {
      ...(statusAfter ? { status: statusAfter } : {}),
      ...(priorityAfter ? { priorityOverride: priorityAfter } : {})
    }, userId);
  }

  const result = await query<ThreadRow>(
    `WITH inserted AS (
      INSERT INTO event_threads (id, event_id, message, image_url, image_key, status_after, priority_after, created_by_user_id)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *
    )
    SELECT inserted.*, u.name AS author_name, u.email AS author_email
    FROM inserted LEFT JOIN users u ON u.id = inserted.created_by_user_id`,
    [`thr_${randomUUID()}`, eventId, message, image?.url ?? null, image?.key ?? null, statusAfter, priorityAfter, userId]
  );
  return toThread(result.rows[0]);
}
