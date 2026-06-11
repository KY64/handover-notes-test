import type { Priority } from '@handover/shared';

export type PriorityInput = {
  type: string;
  status: 'resolved' | 'unresolved' | 'pending';
  description: string;
  timestamp: string;
  priorityOverride?: Priority | null;
};

export function computePriority(event: PriorityInput): { priority: Priority; prioritySource: 'computed' | 'manual'; priorityReason: string } {
  if (event.priorityOverride) {
    return { priority: event.priorityOverride, prioritySource: 'manual', priorityReason: 'Manually overridden by staff.' };
  }
  if (event.status === 'resolved') {
    return { priority: 'low', prioritySource: 'computed', priorityReason: 'Resolved items are kept visible for context but do not need action.' };
  }

  const text = `${event.type} ${event.description}`.toLowerCase();
  const critical = [
    'passport', 'cash', 'safe', 'cannot leave', 'flight', 'ambulance', 'unwell', 'medical',
    'leak', 'soaked', 'electrical', 'fire', 'security', 'locked in'
  ];
  if (critical.some((word) => text.includes(word))) {
    return { priority: 'critical', prioritySource: 'computed', priorityReason: 'Guest safety, security, travel-blocking, or active facilities risk needs immediate handover attention.' };
  }

  const high = ['deposit', 'checkout', 'charge', 'finance', 'compliance', 'immigration', 'deadline', 'damage', 'approval', 'dispute'];
  if (high.some((word) => text.includes(word))) {
    return { priority: 'high', prioritySource: 'computed', priorityReason: 'Financial, compliance, checkout, or approval risk needs follow-up before normal tasks.' };
  }

  if (event.status === 'unresolved') {
    return { priority: 'medium', prioritySource: 'computed', priorityReason: 'Unresolved carry-over item needs follow-up.' };
  }
  return { priority: 'medium', prioritySource: 'computed', priorityReason: 'Pending item needs staff review.' };
}
