import { describe, expect, it } from 'vitest';
import { loadConfig } from '../src/config.js';

describe('config', () => {
  it('refuses mainnet', () => {
    expect(() => loadConfig({ ALGORAND_NETWORK: 'mainnet' })).toThrow(/MainNet is not supported/);
  });
  it('runs with signing disabled when no seed is set', () => {
    expect(loadConfig({}).signerSeed).toBeUndefined();
  });
  it('rejects a malformed seed', () => {
    expect(() => loadConfig({ RESULT_SIGNER_SEED_B64: 'c2hvcnQ=' })).toThrow(/32 bytes/);
  });
});
