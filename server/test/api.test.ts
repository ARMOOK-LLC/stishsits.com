import { describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';
import { verifyDigest } from '../src/signer.js';
import { fakeAddr, stillLog, testConfig } from './helpers.js';

function rig(signing = true) {
  let clock = 1_800_000_000_000;
  const app = buildApp(testConfig(signing), { now: () => clock });
  return { app, advance: (ms: number) => (clock += ms) };
}

const terms = { title: 'Beginner test sit', division: 'beginner', entryAmount: 100_000, promoterBps: 1000 };

describe('API', () => {
  it('health and readiness', async () => {
    const { app } = rig(false);
    expect((await app.inject('/healthz')).json()).toEqual({ ok: true });
    const r = await app.inject('/readyz');
    expect(r.json()).toMatchObject({ network: 'localnet', resultSigning: 'disabled' });
    expect(r.headers['x-stishsits-notice']).toMatch(/testnet only/);
  });

  it('validates contest terms', async () => {
    const { app } = rig();
    const bad = await app.inject({
      method: 'POST',
      url: '/v1/contests',
      payload: { ...terms, venueBps: 2500 },
    });
    expect(bad.statusCode).toBe(400);
    expect(bad.json().error).toMatch(/cuts/);
  });

  it('runs a contest end to end: join, start, pulse, motion, signed result', async () => {
    const { app, advance } = rig();
    const c = (await app.inject({ method: 'POST', url: '/v1/contests', payload: terms })).json();
    const a = fakeAddr(1);
    const b = fakeAddr(2);
    for (const addr of [a, b]) {
      expect(
        (await app.inject({ method: 'POST', url: `/v1/contests/${c.id}/join`, payload: { address: addr } }))
          .statusCode,
      ).toBe(201);
    }
    expect(
      (await app.inject({ method: 'POST', url: `/v1/contests/${c.id}/join`, payload: { address: a } }))
        .statusCode,
    ).toBe(409);
    expect((await app.inject({ method: 'POST', url: `/v1/contests/${c.id}/start` })).json().status).toBe(
      'live',
    );

    // no pulse at t=0; advance to the first pulse and answer it for sitter a only
    expect((await app.inject(`/v1/contests/${c.id}/pulse`)).json().pulse).toBeNull();
    let pulse = null;
    let pulseSeenAt = 0;
    for (let i = 0; i < 200 && !pulse; i++) {
      advance(1000);
      const r = (await app.inject(`/v1/contests/${c.id}/pulse`)).json();
      pulse = r.pulse;
      pulseSeenAt = r.elapsedMs;
    }
    expect(pulse).not.toBeNull();
    const ans = await app.inject({
      method: 'POST',
      url: `/v1/contests/${c.id}/pulse`,
      payload: { address: a, index: pulse.index, nonce: pulse.nonce },
    });
    expect(ans.json()).toEqual({ ok: true });
    advance(120_000);

    // logs end after the first pulse window but before the next pulse can fire (min gap 40 s)
    const dur = pulseSeenAt + 5_000;
    const ma = await app.inject({
      method: 'POST',
      url: `/v1/contests/${c.id}/motion`,
      payload: { address: a, samples: stillLog(dur) },
    });
    expect(ma.statusCode).toBe(202);
    expect(ma.json().verdict).toMatchObject({ moved: false, flags: [] });
    const mb = await app.inject({
      method: 'POST',
      url: `/v1/contests/${c.id}/motion`,
      payload: { address: b, samples: stillLog(dur) },
    });
    expect(mb.json().verdict.flags).toContain('MISSED_PULSE');

    const res = (await app.inject({ method: 'POST', url: `/v1/contests/${c.id}/result` })).json();
    expect(res.result.winner).toBe(a);
    expect(res.result.needsReview).toBe(false);
    const ok = verifyDigest(
      Buffer.from(res.signerPublicKey, 'base64'),
      Buffer.from(res.resultSha256, 'hex'),
      Buffer.from(res.signature, 'base64'),
    );
    expect(ok).toBe(true);
    expect((await app.inject({ method: 'POST', url: `/v1/contests/${c.id}/result` })).statusCode).toBe(409);
  });

  it('refuses to sign when no key is configured', async () => {
    const { app } = rig(false);
    const c = (await app.inject({ method: 'POST', url: '/v1/contests', payload: terms })).json();
    expect((await app.inject({ method: 'POST', url: `/v1/contests/${c.id}/result` })).statusCode).toBe(503);
  });

  it('rejects malformed motion logs and non-entrants', async () => {
    const { app } = rig();
    const c = (await app.inject({ method: 'POST', url: '/v1/contests', payload: terms })).json();
    for (const n of [1, 2])
      await app.inject({
        method: 'POST',
        url: `/v1/contests/${c.id}/join`,
        payload: { address: fakeAddr(n) },
      });
    await app.inject({ method: 'POST', url: `/v1/contests/${c.id}/start` });
    const bad = await app.inject({
      method: 'POST',
      url: `/v1/contests/${c.id}/motion`,
      payload: { address: fakeAddr(1), samples: [{ t: 0 }] },
    });
    expect(bad.statusCode).toBe(400);
    const stranger = await app.inject({
      method: 'POST',
      url: `/v1/contests/${c.id}/motion`,
      payload: { address: fakeAddr(9), samples: [] },
    });
    expect(stranger.statusCode).toBe(404);
  });
});
