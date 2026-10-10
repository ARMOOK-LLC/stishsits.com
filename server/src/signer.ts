import { createHash, createPrivateKey, createPublicKey, sign, verify, type KeyObject } from 'node:crypto';

/** Canonical JSON: sorted keys, no whitespace. Both sides must hash exactly these bytes. */
export function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v !== undefined)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
    return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${canonicalJson(v)}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

export const sha256 = (b: string | Buffer) => createHash('sha256').update(b).digest();

// PKCS8 / SPKI DER prefixes for raw ed25519 keys
const PKCS8_PREFIX = Buffer.from('302e020100300506032b657004220420', 'hex');
const SPKI_PREFIX = Buffer.from('302a300506032b6570032100', 'hex');

/**
 * Signs result digests as the referee/oracle.
 * Uses Algorand's "MX" domain prefix (same as algosdk signBytes), so a signature verifies with
 * algosdk.verifyBytes against the referee's Algorand address. The seed comes from env (dev) or a KMS (prod).
 */
export class ResultSigner {
  private readonly key: KeyObject;
  readonly publicKey: Buffer;

  constructor(seed: Buffer) {
    if (seed.length !== 32) throw new Error('ed25519 seed must be 32 bytes');
    this.key = createPrivateKey({ key: Buffer.concat([PKCS8_PREFIX, seed]), format: 'der', type: 'pkcs8' });
    const spki = createPublicKey(this.key).export({ format: 'der', type: 'spki' });
    this.publicKey = Buffer.from(spki.subarray(SPKI_PREFIX.length));
  }

  signDigest(digest: Buffer): Buffer {
    return sign(null, Buffer.concat([Buffer.from('MX'), digest]), this.key);
  }
}

export function verifyDigest(publicKey: Buffer, digest: Buffer, signature: Buffer): boolean {
  const key = createPublicKey({ key: Buffer.concat([SPKI_PREFIX, publicKey]), format: 'der', type: 'spki' });
  return verify(null, Buffer.concat([Buffer.from('MX'), digest]), key, signature);
}
