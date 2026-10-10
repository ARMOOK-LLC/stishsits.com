/** Machine-readable subset of docs/contest-rules.md (v0, draft). */
export const RULES = {
  version: '0.1.0-draft',
  minField: 2,
  maxTotalCutBps: 3000,
  /** A pulse must be answered within this many ms. */
  pulseResponseWindowMs: 4000,
  /** Random gap between pulses (rule 9: about every 40 to 120 s; sudden death 15 s is TODO). */
  pulseMinGapMs: 40_000,
  pulseMaxGapMs: 120_000,
  /** Motion-log sampling expectation. */
  expectedSampleHz: 50,
  minSampleHz: 30,
  /** Max gap in a motion log before it is flagged. */
  maxSampleGapMs: 250,
  /** Magnitude thresholds (accel in g with gravity removed, gyro in rad/s). */
  accelMoveThresholdG: 0.06,
  gyroMoveThresholdRad: 0.12,
  /** Motion above threshold for this long counts as moving (taps and breathing tolerated). */
  moveSustainMs: 300,
} as const;

export const DIVISIONS = ['beginner', 'intermediate', 'open', 'invite'] as const;
export type Division = (typeof DIVISIONS)[number];
