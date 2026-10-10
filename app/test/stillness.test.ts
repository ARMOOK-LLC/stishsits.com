import { describe, expect, it } from 'vitest';
import { StillnessTracker, formatDuration } from '../src/lib/stillness';

const G: [number, number, number] = [0, 0, -1];
const feed = (
  t: StillnessTracker,
  ms: number,
  fn: (ms: number) => [number, number, number] = () => G,
  hz = 50,
) => {
  for (let ms0 = 0; ms0 <= ms; ms0 += 1000 / hz) t.push(Math.round(ms0), fn(ms0), [0.001, -0.001, 0]);
};

describe('StillnessTracker', () => {
  it('stays still with gravity removed', () => {
    const t = new StillnessTracker();
    feed(t, 5_000);
    expect(t.moved).toBe(false);
    expect(t.stillMs()).toBe(5_000);
    expect(t.finish().flags).toEqual([]);
  });
  it('locks the time at a sustained move', () => {
    const t = new StillnessTracker();
    feed(t, 6_000, (ms) => (ms >= 3_000 ? [0.4, 0, -1] : G));
    expect(t.moved).toBe(true);
    expect(t.stillMs()).toBe(3_000);
  });
  it('flags backgrounding, gaps and low sample rate', () => {
    const t = new StillnessTracker();
    feed(t, 2_000, undefined, 5);
    t.backgrounded();
    expect(t.finish().flags.sort()).toEqual(['APP_BACKGROUNDED', 'LOW_SAMPLE_RATE']);
    const g = new StillnessTracker();
    g.push(0, G, [0, 0, 0]);
    g.push(1_000, G, [0, 0, 0]);
    expect(g.finish().flags).toContain('SAMPLE_GAP');
  });
  it('formats durations', () => {
    expect(formatDuration(65_000)).toBe('01:05');
    expect(formatDuration(3_725_000)).toBe('1:02:05');
  });
});
