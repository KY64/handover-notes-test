import { describe, expect, it } from 'vitest';
import { makeShiftId, reconcileSchema } from '@handover/shared';

describe('reconciliation shift validation', () => {
  it('formats shift id as yyyy-mm-dd-kind', () => {
    expect(makeShiftId('2026-05-27', 'night')).toBe('2026-05-27-night');
  });

  it('rejects non yyyy-mm-dd dates', () => {
    const result = reconcileSchema.safeParse({ rawText: 'night log content', shiftStartDate: '27-05-2026', shiftKind: 'night' });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].message).toContain('yyyy-mm-dd');
  });
});
