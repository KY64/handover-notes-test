import { randomUUID } from 'node:crypto';
import { createEventSchema, updateEventSchema, type CreateEventInput, type HandoverEvent, type UpdateEventInput } from '@handover/shared';
import { query } from '../db/pool.js';
import { config } from '../config.js';
import { businessDateForShift, shiftIdForTimestamp } from './time.js';
import { computePriority } from './priority.js';

type EventRow = {
  id: string;
  hotel_id: string;
  timestamp: Date;
  shift_id: string;
  business_date: string;
  type: string;
  status: 'resolved' | 'unresolved' | 'pending';
  room: string | null;
  guest: string | null;
  description: string;
  source: 'seed' | 'manual' | 'reconciliation';
  source_ref: string | null;
  created_by_user_id: string | null;
  updated_by_user_id: string | null;
  priority_override: 'critical' | 'high' | 'medium' | 'low' | null;
  created_at: Date;
  updated_at: Date;
};

function toEvent(row: EventRow): HandoverEvent {
  const timestamp = row.timestamp.toISOString();
  const priority = computePriority({
    type: row.type,
    status: row.status,
    description: row.description,
    timestamp,
    priorityOverride: row.priority_override
  });
  return {
    id: row.id,
    hotelId: row.hotel_id,
    timestamp,
    shiftId: row.shift_id,
    businessDate: String(row.business_date).slice(0, 10),
    type: row.type,
    status: row.status,
    room: row.room,
    guest: row.guest,
    description: row.description,
    source: row.source,
    sourceRef: row.source_ref,
    createdByUserId: row.created_by_user_id,
    updatedByUserId: row.updated_by_user_id,
    priorityOverride: row.priority_override,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
    ...priority
  };
}

export async function listEvents(filters: { status?: string; room?: string } = {}) {
  const clauses = ['hotel_id = $1'];
  const params: unknown[] = [config.hotelId];
  if (filters.status) {
    params.push(filters.status);
    clauses.push(`status = $${params.length}`);
  }
  if (filters.room) {
    params.push(filters.room);
    clauses.push(`room = $${params.length}`);
  }
  const result = await query<EventRow>(`SELECT * FROM events WHERE ${clauses.join(' AND ')} ORDER BY timestamp DESC`, params);
  return result.rows.map(toEvent).sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3 } as const;
    return order[a.priority] - order[b.priority] || a.timestamp.localeCompare(b.timestamp);
  });
}

export async function createEvent(
  input: CreateEventInput,
  userId: string | null,
  source: 'manual' | 'seed' | 'reconciliation' = 'manual',
  sourceRef: string | null = null,
  shiftOverride?: { shiftId: string; businessDate: string }
) {
  const parsed = createEventSchema.parse(input);
  const id = source === 'seed' ? `seed_${randomUUID()}` : `evt_${randomUUID()}`;
  const shiftId = shiftOverride?.shiftId ?? shiftIdForTimestamp(config.hotelId, parsed.timestamp);
  const businessDate = shiftOverride?.businessDate ?? businessDateForShift(parsed.timestamp);
  const result = await query<EventRow>(
    `INSERT INTO events (id, hotel_id, timestamp, shift_id, business_date, type, status, room, guest, description, source, source_ref, created_by_user_id, updated_by_user_id, priority_override)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$13,$14)
     RETURNING *`,
    [id, config.hotelId, parsed.timestamp, shiftId, businessDate, parsed.type, parsed.status, parsed.room ?? null, parsed.guest ?? null, parsed.description, source, sourceRef, userId, parsed.priorityOverride ?? null]
  );
  return toEvent(result.rows[0]);
}

export async function upsertSeedEvent(input: CreateEventInput & { id: string }) {
  const parsed = createEventSchema.parse(input);
  const shiftId = shiftIdForTimestamp(config.hotelId, parsed.timestamp);
  const businessDate = businessDateForShift(parsed.timestamp);
  await query(
    `INSERT INTO events (id, hotel_id, timestamp, shift_id, business_date, type, status, room, guest, description, source, source_ref)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'seed',$1)
     ON CONFLICT (id) DO NOTHING`,
    [input.id, config.hotelId, parsed.timestamp, shiftId, businessDate, parsed.type, parsed.status, parsed.room ?? null, parsed.guest ?? null, parsed.description]
  );
}

export async function updateEvent(id: string, input: UpdateEventInput, userId: string) {
  const parsed = updateEventSchema.parse(input);
  const current = await query<EventRow>('SELECT * FROM events WHERE id = $1 AND hotel_id = $2', [id, config.hotelId]);
  if (!current.rows[0]) return null;
  const oldStatus = current.rows[0].status;
  const next = { ...current.rows[0], ...parsed };
  const result = await query<EventRow>(
    `UPDATE events SET status=$1, type=$2, room=$3, guest=$4, description=$5, priority_override=$6, updated_by_user_id=$7, updated_at=now()
     WHERE id=$8 AND hotel_id=$9 RETURNING *`,
    [next.status, next.type, next.room, next.guest, next.description, next.priorityOverride ?? next.priority_override, userId, id, config.hotelId]
  );
  if (parsed.status && parsed.status !== oldStatus) {
    await query('INSERT INTO event_status_history (id, event_id, old_status, new_status, changed_by_user_id) VALUES ($1,$2,$3,$4,$5)', [randomUUID(), id, oldStatus, parsed.status, userId]);
  }
  return toEvent(result.rows[0]);
}
