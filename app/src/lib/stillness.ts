/**
 * On-device stillness tracking. Pure logic (no React Native imports) so it is unit-testable.
 * Thresholds mirror server/src/rules.ts; the SERVER verdict is authoritative, this is only live feedback.
 */
export type Vec3 = [number, number, number];
export interface Sample {
  t: number;
  a: Vec3;
  g: Vec3;
}

export type ClientFlag = 'APP_BACKGROUNDED' | 'SAMPLE_GAP' | 'LOW_SAMPLE_RATE' | 'SENSOR_UNAVAILABLE';

export const THRESHOLDS = {
  accelMoveThresholdG: 0.06,
  gyroMoveThresholdRad: 0.12,
  moveSustainMs: 300,
  maxSampleGapMs: 250,
  minSampleHz: 30,
  updateIntervalMs: 20, // 50 Hz
} as const;

const mag = (v: Vec3) => Math.hypot(v[0], v[1], v[2]);

export class StillnessTracker {
  readonly samples: Sample[] = [];
  readonly flags = new Set<ClientFlag>();
  private movingSince?: number;
  movedAt?: number;
  private gravity: Vec3 = [0, 0, 0];
  private primed = false;

  /** Feed a raw accelerometer reading (g, includes gravity) and gyro reading (rad/s). */
  push(t: number, rawAccel: Vec3, gyro: Vec3): void {
    // simple low-pass to estimate and remove gravity
    const k = 0.9;
    if (!this.primed) {
      this.gravity = [...rawAccel];
      this.primed = true;
    } else {
      this.gravity = [0, 1, 2].map((i) => k * this.gravity[i]! + (1 - k) * rawAccel[i]!) as Vec3;
    }
    const a = [0, 1, 2].map((i) => round(rawAccel[i]! - this.gravity[i]!)) as Vec3;
    const g = gyro.map(round) as Vec3;

    const prev = this.samples[this.samples.length - 1];
    if (prev && t - prev.t > THRESHOLDS.maxSampleGapMs) this.flags.add('SAMPLE_GAP');
    this.samples.push({ t, a, g });

    const over = mag(a) > THRESHOLDS.accelMoveThresholdG || mag(g) > THRESHOLDS.gyroMoveThresholdRad;
    if (over) {
      this.movingSince ??= t;
      if (this.movedAt === undefined && t - this.movingSince >= THRESHOLDS.moveSustainMs) {
        this.movedAt = this.movingSince;
      }
    } else {
      this.movingSince = undefined;
    }
  }

  /** Call when AppState leaves "active" during a sit: leaving the app is a tamper signal. */
  backgrounded(): void {
    this.flags.add('APP_BACKGROUNDED');
  }

  get moved(): boolean {
    return this.movedAt !== undefined;
  }

  stillMs(now?: number): number {
    const first = this.samples[0]?.t ?? 0;
    const last = this.samples[this.samples.length - 1]?.t ?? first;
    return (this.movedAt ?? now ?? last) - first;
  }

  finish(): { samples: Sample[]; flags: ClientFlag[] } {
    const n = this.samples.length;
    if (n > 1) {
      const span = this.samples[n - 1]!.t - this.samples[0]!.t;
      if (((n - 1) * 1000) / Math.max(1, span) < THRESHOLDS.minSampleHz) this.flags.add('LOW_SAMPLE_RATE');
    }
    return { samples: this.samples, flags: [...this.flags] };
  }
}

const round = (x: number) => Math.round(x * 1e5) / 1e5;

export function formatDuration(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const pad = (n: number) => String(n).padStart(2, '0');
  return h ? `${h}:${pad(m)}:${pad(s % 60)}` : `${pad(m)}:${pad(s % 60)}`;
}
