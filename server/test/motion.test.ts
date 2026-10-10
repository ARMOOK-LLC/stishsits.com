import { describe, expect, it } from 'vitest';
import { analyzeMotion } from '../src/motion.js';
import { stillLog } from './helpers.js';

describe('analyzeMotion', () => {
  it('scores a clean still log as the full duration with no flags', () => {
    const v = analyzeMotion(stillLog(10_000));
    expect(v.moved).toBe(false);
    expect(v.stillMs).toBe(10_000);
    expect(v.flags).toEqual([]);
    expect(v.observedHz).toBeGreaterThan(45);
  });
  it('stops the clock at the start of a sustained move', () => {
    const v = analyzeMotion(stillLog(10_000, 50, 6_000));
    expect(v.moved).toBe(true);
    expect(v.stillMs).toBe(6_000);
  });
  it('tolerates a short twitch below the sustain window', () => {
    const log = stillLog(5_000);
    for (const s of log) if (s.t >= 2_000 && s.t < 2_200) s.a[0] = 0.5;
    expect(analyzeMotion(log).moved).toBe(false);
  });
  it('flags a flatline (replayed/emulated) feed', () => {
    const log = stillLog(5_000).map((s) => ({
      ...s,
      a: [0, 0, 0] as [number, number, number],
      g: [0, 0, 0] as [number, number, number],
    }));
    expect(analyzeMotion(log).flags).toContain('FLATLINE_SENSOR');
  });
  it('flags gaps, low rate, time going backwards and impossible values', () => {
    const log = stillLog(5_000, 10);
    log.push({ t: 1, a: [99, 0, 0], g: [0, 0, 0] });
    const f = analyzeMotion(log).flags;
    expect(f).toEqual(expect.arrayContaining(['LOW_SAMPLE_RATE', 'NON_MONOTONIC_TIME', 'IMPOSSIBLE_VALUE']));
    expect(analyzeMotion([]).flags).toContain('EMPTY_LOG');
  });
  it('carries client-reported flags', () => {
    expect(analyzeMotion(stillLog(1_000), ['APP_BACKGROUNDED']).flags).toEqual([
      'CLIENT_REPORTED',
      'APP_BACKGROUNDED',
    ]);
  });
});
