import { randomBytes } from 'node:crypto';
import { loadConfig } from '../src/config.js';

/** Fresh random key per test run. No key material is ever stored in the repo. */
export const testConfig = (signing = true) =>
  loadConfig({
    ALGORAND_NETWORK: 'localnet',
    PULSE_SECRET: randomBytes(32).toString('hex'),
    RESULT_SIGNER_SEED_B64: signing ? randomBytes(32).toString('base64') : '',
  });

const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
export const fakeAddr = (seed: number) =>
  Array.from({ length: 58 }, (_, i) => B32[(seed * 7 + i * 13) % 32]).join('');

/** Still sitter with sensor noise; optional sustained move starting at moveAtMs. */
export function stillLog(durationMs: number, hz = 50, moveAtMs?: number) {
  const out = [];
  let x = 1;
  const rnd = () => ((x = (x * 1103515245 + 12345) % 2 ** 31) / 2 ** 31 - 0.5) * 0.01;
  for (let t = 0; t <= durationMs; t += 1000 / hz) {
    const moving = moveAtMs !== undefined && t >= moveAtMs;
    out.push({
      t: Math.round(t),
      a: [rnd() + (moving ? 0.3 : 0), rnd(), rnd()] as [number, number, number],
      g: [rnd(), rnd(), rnd()] as [number, number, number],
    });
  }
  return out;
}
