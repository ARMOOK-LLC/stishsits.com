import { randomBytes } from 'node:crypto';
import algosdk from 'algosdk';
import { describe, expect, it } from 'vitest';
import { ResultSigner, canonicalJson, sha256, verifyDigest } from '../src/signer.js';

describe('result signer', () => {
  it('canonical JSON sorts keys and drops undefined', () => {
    expect(canonicalJson({ b: 1, a: [2, { d: 3, c: undefined }] })).toBe('{"a":[2,{"d":3}],"b":1}');
  });
  it('signs digests verifiable by node and by algosdk.verifyBytes (MX prefix)', () => {
    const s = new ResultSigner(randomBytes(32));
    const digest = sha256('result');
    const sig = s.signDigest(digest);
    expect(verifyDigest(s.publicKey, digest, sig)).toBe(true);
    expect(verifyDigest(s.publicKey, sha256('other'), sig)).toBe(false);
    const addr = algosdk.encodeAddress(new Uint8Array(s.publicKey));
    expect(algosdk.verifyBytes(new Uint8Array(digest), new Uint8Array(sig), addr)).toBe(true);
  });
});
