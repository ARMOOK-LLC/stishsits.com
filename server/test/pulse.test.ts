import { describe, expect, it } from 'vitest';
import { livePulse, pulseAnswerOk, pulseSchedule } from '../src/pulse.js';
import { RULES } from '../src/rules.js';

describe('pulse schedule', () => {
  const s = pulseSchedule('x'.repeat(32), 'contest-1', 3_600_000);
  it('is deterministic per (secret, contest) and different across contests', () => {
    expect(pulseSchedule('x'.repeat(32), 'contest-1', 3_600_000)).toEqual(s);
    expect(pulseSchedule('x'.repeat(32), 'contest-2', 3_600_000)[0]).not.toEqual(s[0]);
    expect(pulseSchedule('y'.repeat(32), 'contest-1', 3_600_000)[0]).not.toEqual(s[0]);
  });
  it('keeps gaps inside the posted bounds', () => {
    let prev = 0;
    for (const p of s) {
      expect(p.at - prev).toBeGreaterThanOrEqual(RULES.pulseMinGapMs);
      expect(p.at - prev).toBeLessThanOrEqual(RULES.pulseMaxGapMs);
      prev = p.at;
    }
  });
  it('only accepts the right nonce inside the window', () => {
    const p = s[0]!;
    expect(livePulse(s, p.at + 1)).toEqual(p);
    expect(livePulse(s, p.at - 1)).toBeUndefined();
    expect(pulseAnswerOk(p, p.nonce, p.at + 100)).toBe(true);
    expect(pulseAnswerOk(p, 'nope', p.at + 100)).toBe(false);
    expect(pulseAnswerOk(p, p.nonce, p.at + RULES.pulseResponseWindowMs)).toBe(false);
  });
});
