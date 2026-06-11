import { describe, expect, it } from 'vitest';
import { computePriority } from './priority.js';

const base = { timestamp: '2026-05-28T02:00:00+08:00' } as const;

describe('computePriority', () => {
  it('keeps resolved items low', () => {
    expect(computePriority({ ...base, type: 'maintenance', status: 'resolved', description: 'Leak fixed' }).priority).toBe('low');
  });

  it('flags travel-blocking safe issue as critical', () => {
    const result = computePriority({ ...base, type: 'maintenance', status: 'unresolved', description: 'Safe cannot open, passport and cash locked in, guest has morning flight' });
    expect(result.priority).toBe('critical');
  });

  it('flags deposit checkout risk as high', () => {
    expect(computePriority({ ...base, type: 'deposit_issue', status: 'unresolved', description: 'Deposit not collected before checkout' }).priority).toBe('high');
  });

  it('honors manual override', () => {
    const result = computePriority({ ...base, type: 'note', status: 'unresolved', description: 'Leak', priorityOverride: 'medium' });
    expect(result.priority).toBe('medium');
    expect(result.prioritySource).toBe('manual');
  });
});
