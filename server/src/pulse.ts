import { createHmac } from 'node:crypto';
import { RULES } from './rules.js';

export interface Pulse {
  index: number;
  /** ms after contest start */
  at: number;
  /** opaque challenge the phone must echo back */
  nonce: string;
}

/**
 * Deterministic, unpredictable pulse schedule for one contest.
 * Derived from a server secret + contest id, so it can be re-derived for audit but cannot be predicted
 * by a client. Every sitter in a race gets the same schedule (fair) but only learns each pulse when it fires.
 */
export function pulseSchedule(secret: string, contestId: string, horizonMs: number): Pulse[] {
  const out: Pulse[] = [];
  let t = 0;
  for (let i = 0; ; i++) {
    const h = createHmac('sha256', secret).update(`${contestId}:${i}`).digest();
    const gap = RULES.pulseMinGapMs + (h.readUInt32BE(0) % (RULES.pulseMaxGapMs - RULES.pulseMinGapMs + 1));
    t += gap;
    if (t > horizonMs) break;
    out.push({ index: i, at: t, nonce: h.subarray(4, 20).toString('hex') });
  }
  return out;
}

/** The pulse (if any) that is live at `elapsedMs`. */
export function livePulse(schedule: Pulse[], elapsedMs: number): Pulse | undefined {
  return schedule.find((p) => elapsedMs >= p.at && elapsedMs < p.at + RULES.pulseResponseWindowMs);
}

export function pulseAnswerOk(p: Pulse, nonce: string, answeredAtMs: number): boolean {
  return nonce === p.nonce && answeredAtMs >= p.at && answeredAtMs < p.at + RULES.pulseResponseWindowMs;
}
