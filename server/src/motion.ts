import { RULES } from './rules.js';

/** One sensor sample. t = ms since the sitter's start; a = accel (g, gravity removed); g = gyro (rad/s). */
export interface Sample {
  t: number;
  a: [number, number, number];
  g: [number, number, number];
}

export type TamperFlag =
  | 'EMPTY_LOG'
  | 'NON_MONOTONIC_TIME'
  | 'LOW_SAMPLE_RATE'
  | 'SAMPLE_GAP'
  | 'FLATLINE_SENSOR'
  | 'IMPOSSIBLE_VALUE'
  | 'MISSED_PULSE'
  | 'APP_BACKGROUNDED'
  | 'CLIENT_REPORTED';

export interface MotionVerdict {
  /** ms from start to the first sustained movement, or the log length if none */
  stillMs: number;
  moved: boolean;
  flags: TamperFlag[];
  sampleCount: number;
  observedHz: number;
}

const mag = (v: [number, number, number]) => Math.hypot(v[0], v[1], v[2]);

/**
 * Score a motion log. Pure function, so the same log always yields the same verdict
 * (the referee can re-run it during a challenge). Flags are advisory: they route a result to
 * human review, they do not by themselves disqualify.
 */
export function analyzeMotion(samples: Sample[], clientFlags: TamperFlag[] = []): MotionVerdict {
  const flags = new Set<TamperFlag>(clientFlags.length ? ['CLIENT_REPORTED', ...clientFlags] : []);
  if (samples.length === 0) {
    return { stillMs: 0, moved: false, flags: ['EMPTY_LOG', ...flags], sampleCount: 0, observedHz: 0 };
  }

  let movingSince: number | undefined;
  let movedAt: number | undefined;
  let prevT = samples[0]!.t;
  let identicalRun = 0;
  let maxIdenticalRun = 0;
  let prevKey = '';

  for (const s of samples) {
    if (s.t < prevT) flags.add('NON_MONOTONIC_TIME');
    if (s.t - prevT > RULES.maxSampleGapMs) flags.add('SAMPLE_GAP');
    prevT = s.t;

    const all = [...s.a, ...s.g];
    if (all.some((x) => !Number.isFinite(x) || Math.abs(x) > 64)) flags.add('IMPOSSIBLE_VALUE');

    // Real sensors always have noise. Long runs of bit-identical readings suggest a replayed or emulated feed.
    const key = all.join(',');
    identicalRun = key === prevKey ? identicalRun + 1 : 0;
    maxIdenticalRun = Math.max(maxIdenticalRun, identicalRun);
    prevKey = key;

    const over = mag(s.a) > RULES.accelMoveThresholdG || mag(s.g) > RULES.gyroMoveThresholdRad;
    if (over) {
      movingSince ??= s.t;
      if (movedAt === undefined && s.t - movingSince >= RULES.moveSustainMs) movedAt = movingSince;
    } else {
      movingSince = undefined;
    }
  }
  if (maxIdenticalRun >= RULES.expectedSampleHz * 2) flags.add('FLATLINE_SENSOR');

  const first = samples[0]!.t;
  const last = samples.reduce((m, s) => Math.max(m, s.t), first);
  const spanMs = Math.max(1, last - first);
  const observedHz = ((samples.length - 1) * 1000) / spanMs;
  if (samples.length > 1 && observedHz < RULES.minSampleHz) flags.add('LOW_SAMPLE_RATE');

  return {
    stillMs: (movedAt ?? last) - first,
    moved: movedAt !== undefined,
    flags: [...flags],
    sampleCount: samples.length,
    observedHz: Math.round(observedHz * 10) / 10,
  };
}
