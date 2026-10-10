import { randomUUID } from 'node:crypto';
import { DIVISIONS, RULES, type Division } from './rules.js';
import { analyzeMotion, type MotionVerdict, type Sample, type TamperFlag } from './motion.js';
import { pulseAnswerOk, pulseSchedule, type Pulse } from './pulse.js';

export type ContestStatus = 'open' | 'locked' | 'live' | 'scored' | 'canceled';

export interface ContestTerms {
  title: string;
  division: Division;
  /** entry in base units of the test asset; informational here, enforced on-chain by the escrow */
  entryAmount: number;
  minEntrants: number;
  maxEntrants: number;
  promoterBps: number;
  venueBps: number;
  refereeBps: number;
  /** max contest length in ms (pulse horizon) */
  maxDurationMs: number;
}

export interface Entrant {
  address: string;
  joinedAt: number;
  pulsesAnswered: number[];
  verdict?: MotionVerdict;
}

export interface Contest {
  id: string;
  terms: ContestTerms;
  status: ContestStatus;
  createdAt: number;
  startedAt?: number;
  entrants: Map<string, Entrant>;
  schedule: Pulse[];
}

export class ContestError extends Error {
  constructor(
    readonly statusCode: number,
    message: string,
  ) {
    super(message);
  }
}

const ALGO_ADDR = /^[A-Z2-7]{58}$/;

export function validateTerms(t: Partial<ContestTerms>): ContestTerms {
  const n = (v: unknown, name: string, min = 0, max = Number.MAX_SAFE_INTEGER) => {
    if (typeof v !== 'number' || !Number.isInteger(v) || v < min || v > max)
      throw new ContestError(400, `${name} must be an integer in [${min}, ${max}]`);
    return v;
  };
  if (typeof t.title !== 'string' || !t.title.trim() || t.title.length > 80)
    throw new ContestError(400, 'title required (max 80 chars)');
  if (!DIVISIONS.includes(t.division as Division)) throw new ContestError(400, 'unknown division');
  const terms: ContestTerms = {
    title: t.title.trim(),
    division: t.division as Division,
    entryAmount: n(t.entryAmount, 'entryAmount', 1),
    minEntrants: n(t.minEntrants ?? RULES.minField, 'minEntrants', RULES.minField, 1000),
    maxEntrants: n(t.maxEntrants ?? 20, 'maxEntrants', RULES.minField, 1000),
    promoterBps: n(t.promoterBps ?? 0, 'promoterBps', 0, 10_000),
    venueBps: n(t.venueBps ?? 0, 'venueBps', 0, 10_000),
    refereeBps: n(t.refereeBps ?? 0, 'refereeBps', 0, 10_000),
    maxDurationMs: n(t.maxDurationMs ?? 3_600_000, 'maxDurationMs', 60_000, 24 * 3_600_000),
  };
  if (terms.maxEntrants < terms.minEntrants) throw new ContestError(400, 'maxEntrants < minEntrants');
  if (terms.promoterBps + terms.venueBps + terms.refereeBps > RULES.maxTotalCutBps)
    throw new ContestError(400, `total cuts may not exceed ${RULES.maxTotalCutBps} bps`);
  return terms;
}

/** In-memory store. Swap for Postgres in Phase 2+; the chain stays the source of truth for funds. */
export class ContestStore {
  private readonly contests = new Map<string, Contest>();

  constructor(
    private readonly pulseSecret: string,
    private readonly now: () => number = Date.now,
  ) {}

  create(input: Partial<ContestTerms>): Contest {
    const terms = validateTerms(input);
    const id = randomUUID();
    const c: Contest = {
      id,
      terms,
      status: 'open',
      createdAt: this.now(),
      entrants: new Map(),
      schedule: pulseSchedule(this.pulseSecret, id, terms.maxDurationMs),
    };
    this.contests.set(id, c);
    return c;
  }

  get(id: string): Contest {
    const c = this.contests.get(id);
    if (!c) throw new ContestError(404, 'contest not found');
    return c;
  }

  list(): Contest[] {
    return [...this.contests.values()];
  }

  /** Off-chain registration. In the full flow this mirrors a confirmed on-chain `join` (TODO: indexer check). */
  join(id: string, address: string): Entrant {
    const c = this.get(id);
    if (c.status !== 'open') throw new ContestError(409, 'contest not open');
    if (!ALGO_ADDR.test(address)) throw new ContestError(400, 'invalid Algorand address');
    if (c.entrants.has(address)) throw new ContestError(409, 'already entered');
    if (c.entrants.size >= c.terms.maxEntrants) throw new ContestError(409, 'field full');
    const e: Entrant = { address, joinedAt: this.now(), pulsesAnswered: [] };
    c.entrants.set(address, e);
    return e;
  }

  start(id: string): Contest {
    const c = this.get(id);
    if (c.status !== 'open') throw new ContestError(409, 'contest not open');
    if (c.entrants.size < c.terms.minEntrants) throw new ContestError(409, 'field too small');
    c.status = 'live';
    c.startedAt = this.now();
    return c;
  }

  elapsed(c: Contest): number {
    if (c.status !== 'live' || c.startedAt === undefined) throw new ContestError(409, 'contest not live');
    return this.now() - c.startedAt;
  }

  answerPulse(id: string, address: string, index: number, nonce: string): boolean {
    const c = this.get(id);
    const e = this.entrant(c, address);
    const p = c.schedule[index];
    if (!p) throw new ContestError(404, 'no such pulse');
    const ok = pulseAnswerOk(p, nonce, this.elapsed(c));
    if (ok && !e.pulsesAnswered.includes(index)) e.pulsesAnswered.push(index);
    return ok;
  }

  submitMotion(
    id: string,
    address: string,
    samples: Sample[],
    clientFlags: TamperFlag[] = [],
  ): MotionVerdict {
    const c = this.get(id);
    const e = this.entrant(c, address);
    const elapsed = this.elapsed(c);
    if (e.verdict) throw new ContestError(409, 'motion log already submitted');
    const verdict = analyzeMotion(samples, clientFlags);
    // every pulse that fired before this sitter's recorded stop must have been answered
    const due = c.schedule.filter(
      (p) => p.at + RULES.pulseResponseWindowMs <= Math.min(elapsed, verdict.stillMs),
    );
    if (due.some((p) => !e.pulsesAnswered.includes(p.index))) verdict.flags.push('MISSED_PULSE');
    e.verdict = verdict;
    return verdict;
  }

  /** Rank: longest still time wins; flagged logs rank below clean ones and go to review. */
  standings(id: string) {
    const c = this.get(id);
    return [...c.entrants.values()]
      .filter((e) => e.verdict)
      .map((e) => ({ address: e.address, stillMs: e.verdict!.stillMs, flags: e.verdict!.flags }))
      .sort((a, b) => Number(a.flags.length > 0) - Number(b.flags.length > 0) || b.stillMs - a.stillMs);
  }

  cancel(id: string): Contest {
    const c = this.get(id);
    if (c.status === 'scored' || c.status === 'canceled') throw new ContestError(409, 'already final');
    c.status = 'canceled';
    return c;
  }

  markScored(id: string): Contest {
    const c = this.get(id);
    c.status = 'scored';
    return c;
  }

  private entrant(c: Contest, address: string): Entrant {
    const e = c.entrants.get(address);
    if (!e) throw new ContestError(404, 'not an entrant');
    return e;
  }
}

export function publicContest(c: Contest) {
  return {
    id: c.id,
    terms: c.terms,
    status: c.status,
    createdAt: c.createdAt,
    startedAt: c.startedAt,
    entrantCount: c.entrants.size,
    pulseCount: c.schedule.length,
  };
}
