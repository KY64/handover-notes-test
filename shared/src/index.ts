import { z } from 'zod';

export const eventStatusSchema = z.enum(['resolved', 'unresolved', 'pending']);
export type EventStatus = z.infer<typeof eventStatusSchema>;

export const prioritySchema = z.enum(['critical', 'high', 'medium', 'low']);
export type Priority = z.infer<typeof prioritySchema>;

export const eventSchema = z.object({
  id: z.string(),
  hotelId: z.string(),
  timestamp: z.string(),
  shiftId: z.string(),
  businessDate: z.string(),
  type: z.string().min(1),
  status: eventStatusSchema,
  room: z.string().nullable(),
  guest: z.string().nullable(),
  description: z.string().min(1),
  source: z.enum(['seed', 'manual', 'reconciliation']),
  sourceRef: z.string().nullable(),
  createdByUserId: z.string().nullable(),
  updatedByUserId: z.string().nullable(),
  priorityOverride: prioritySchema.nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  priority: prioritySchema,
  prioritySource: z.enum(['computed', 'manual']),
  priorityReason: z.string()
});
export type HandoverEvent = z.infer<typeof eventSchema>;

export const createEventSchema = z.object({
  timestamp: z.string().datetime({ offset: true }),
  type: z.string().min(1).max(80),
  status: eventStatusSchema,
  room: z.string().trim().min(1).max(20).nullable().optional(),
  guest: z.string().trim().min(1).max(160).nullable().optional(),
  description: z.string().trim().min(1).max(4000),
  priorityOverride: prioritySchema.nullable().optional()
});
export type CreateEventInput = z.infer<typeof createEventSchema>;

export const updateEventSchema = z.object({
  status: eventStatusSchema.optional(),
  type: z.string().min(1).max(80).optional(),
  room: z.string().trim().min(1).max(20).nullable().optional(),
  guest: z.string().trim().min(1).max(160).nullable().optional(),
  description: z.string().trim().min(1).max(4000).optional(),
  priorityOverride: prioritySchema.nullable().optional()
}).refine((value) => Object.keys(value).length > 0, 'At least one field is required');
export type UpdateEventInput = z.infer<typeof updateEventSchema>;

export const authSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(200),
  name: z.string().trim().min(1).max(120).optional()
});

export const loginSchema = authSchema.pick({ email: true, password: true });

export const shiftKindSchema = z.enum(['day', 'night', 'morning']);
export type ShiftKind = z.infer<typeof shiftKindSchema>;

export const shiftDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'shiftStartDate must use yyyy-mm-dd format');

export const shiftIdSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}-(day|night|morning)$/, 'shiftId must use yyyy-mm-dd-day, yyyy-mm-dd-night, or yyyy-mm-dd-morning format');

export const reconcileSchema = z.object({
  rawText: z.string().trim().min(10).max(30000),
  sourceLabel: z.string().trim().min(1).max(200).optional(),
  shiftStartDate: shiftDateSchema,
  shiftKind: shiftKindSchema
});

export function makeShiftId(shiftStartDate: string, shiftKind: ShiftKind) {
  const parsedDate = shiftDateSchema.parse(shiftStartDate);
  return shiftIdSchema.parse(`${parsedDate}-${shiftKind}`);
}

export type ReconcileInput = z.infer<typeof reconcileSchema>;

export type ApiUser = { id: string; email: string; name: string; createdAt: string };
