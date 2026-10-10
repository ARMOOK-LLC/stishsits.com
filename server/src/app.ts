import Fastify, { type FastifyInstance } from 'fastify';
import type { Config } from './config.js';
import { ContestError, ContestStore, publicContest } from './contests.js';
import { livePulse } from './pulse.js';
import { RULES } from './rules.js';
import { ResultSigner, canonicalJson, sha256 } from './signer.js';
import type { Sample, TamperFlag } from './motion.js';

export const BANNER = 'Experimental, testnet only, not for real-money use, pending legal review.';
const MAX_SAMPLES = 24 * 3600 * 60; // a full day at 60 Hz

export function buildApp(
  config: Config,
  opts: { now?: () => number; logger?: boolean } = {},
): FastifyInstance {
  const app = Fastify({ logger: opts.logger ?? false, bodyLimit: 64 * 1024 * 1024 });
  const now = opts.now ?? Date.now;
  const store = new ContestStore(config.pulseSecret, now);
  const signer = config.signerSeed ? new ResultSigner(config.signerSeed) : undefined;

  app.addHook('onSend', async (_req, reply) => {
    reply.header('x-stishsits-notice', BANNER);
  });

  app.setErrorHandler((err, _req, reply) => {
    if (err instanceof ContestError) return reply.code(err.statusCode).send({ error: err.message });
    const code = (err as { statusCode?: number }).statusCode;
    if (code && code < 500) return reply.code(code).send({ error: (err as Error).message });
    app.log.error(err);
    return reply.code(500).send({ error: 'internal error' });
  });

  // ---- health
  app.get('/healthz', async () => ({ ok: true }));
  app.get('/readyz', async () => ({
    ok: true,
    network: config.network,
    contestAppId: config.contestAppId,
    resultSigning: signer ? 'enabled' : 'disabled',
    signerPublicKey: signer?.publicKey.toString('base64'),
    notice: BANNER,
  }));
  app.get('/v1/rules', async () => RULES);

  // ---- contests
  app.get('/v1/contests', async () => store.list().map(publicContest));
  app.post('/v1/contests', async (req, reply) => {
    const c = store.create((req.body ?? {}) as object);
    return reply.code(201).send(publicContest(c));
  });
  app.get<{ Params: { id: string } }>('/v1/contests/:id', async (req) =>
    publicContest(store.get(req.params.id)),
  );
  app.post<{ Params: { id: string }; Body: { address?: string } }>(
    '/v1/contests/:id/join',
    async (req, reply) => {
      const e = store.join(req.params.id, String(req.body?.address ?? ''));
      return reply.code(201).send({ address: e.address, joinedAt: e.joinedAt });
    },
  );
  app.post<{ Params: { id: string } }>('/v1/contests/:id/start', async (req) =>
    publicContest(store.start(req.params.id)),
  );
  app.post<{ Params: { id: string } }>('/v1/contests/:id/cancel', async (req) =>
    publicContest(store.cancel(req.params.id)),
  );

  // ---- pulse timing: clients poll (or, later, receive over WebSocket) and must echo the nonce in time
  app.get<{ Params: { id: string } }>('/v1/contests/:id/pulse', async (req) => {
    const c = store.get(req.params.id);
    const elapsed = store.elapsed(c);
    const p = livePulse(c.schedule, elapsed);
    return {
      elapsedMs: elapsed,
      pulse: p
        ? { index: p.index, nonce: p.nonce, expiresInMs: p.at + RULES.pulseResponseWindowMs - elapsed }
        : null,
    };
  });
  app.post<{ Params: { id: string }; Body: { address?: string; index?: number; nonce?: string } }>(
    '/v1/contests/:id/pulse',
    async (req) => {
      const { address = '', index = -1, nonce = '' } = req.body ?? {};
      return { ok: store.answerPulse(req.params.id, address, Number(index), String(nonce)) };
    },
  );

  // ---- motion-log ingestion
  app.post<{
    Params: { id: string };
    Body: { address?: string; samples?: Sample[]; flags?: TamperFlag[] };
  }>('/v1/contests/:id/motion', async (req, reply) => {
    const { address = '', samples, flags = [] } = req.body ?? {};
    if (!Array.isArray(samples) || samples.length > MAX_SAMPLES)
      throw new ContestError(400, 'samples must be an array');
    if (!samples.every(isSample)) throw new ContestError(400, 'malformed sample');
    const verdict = store.submitMotion(req.params.id, address, samples, flags.filter(isFlag));
    return reply.code(202).send({ verdict, logSha256: sha256(canonicalJson(samples)).toString('hex') });
  });

  // ---- result signing (referee/oracle)
  app.post<{ Params: { id: string } }>('/v1/contests/:id/result', async (req) => {
    if (!signer) throw new ContestError(503, 'result signing disabled (no RESULT_SIGNER_SEED_B64)');
    const c = store.get(req.params.id);
    if (c.status !== 'live') throw new ContestError(409, 'contest not live');
    const standings = store.standings(c.id);
    const winner = standings[0];
    if (!winner) throw new ContestError(409, 'no scored entrants');
    const needsReview = winner.flags.length > 0;
    const result = {
      v: 1,
      network: config.network,
      appId: config.contestAppId,
      contestId: c.id,
      rules: RULES.version,
      winner: winner.address,
      standings,
      needsReview,
      issuedAt: now(),
    };
    const digest = sha256(canonicalJson(result));
    store.markScored(c.id);
    return {
      result,
      resultSha256: digest.toString('hex'),
      signature: signer.signDigest(digest).toString('base64'),
      signerPublicKey: signer.publicKey.toString('base64'),
      note: needsReview
        ? 'Top result carries tamper flags: hold for human review before calling settle() on-chain.'
        : 'Referee submits settle(winner, resultSha256) on-chain; payout opens after the challenge window.',
    };
  });

  return app;
}

const FLAGS: ReadonlySet<string> = new Set([
  'APP_BACKGROUNDED',
  'CLIENT_REPORTED',
  'SAMPLE_GAP',
  'LOW_SAMPLE_RATE',
]);
function isFlag(f: unknown): f is TamperFlag {
  return typeof f === 'string' && FLAGS.has(f);
}
function isSample(s: unknown): s is Sample {
  const v = s as Sample;
  const tri = (x: unknown) => Array.isArray(x) && x.length === 3 && x.every((n) => typeof n === 'number');
  return !!v && typeof v.t === 'number' && tri(v.a) && tri(v.g);
}
