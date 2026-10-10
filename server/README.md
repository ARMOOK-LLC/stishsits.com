# server/

> **Experimental, testnet only, not for real-money use, pending legal review.**

Node.js 20 + TypeScript + Fastify skeleton for the contest API. In-memory storage; the escrow contract stays the source of truth for funds.

| Route                                         | Purpose                                                                                                                                                                                                    |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /healthz`, `GET /readyz`                 | liveness / readiness (network, app id, whether signing is enabled, signer public key)                                                                                                                      |
| `GET /v1/rules`                               | machine-readable rule constants (see `docs/contest-rules.md`)                                                                                                                                              |
| `POST /v1/contests`, `GET /v1/contests[/:id]` | create/list contests; validates terms (min field 2, total cuts ≤ 30%)                                                                                                                                      |
| `POST /v1/contests/:id/join`                  | register an entrant address (TODO: confirm the on-chain `join` via indexer)                                                                                                                                |
| `POST /v1/contests/:id/start`, `/cancel`      | start / cancel                                                                                                                                                                                             |
| `GET/POST /v1/contests/:id/pulse`             | **pulse timing**: unpredictable server-derived challenges (HMAC of a server secret + contest id); the phone must echo the nonce inside a 4 s window                                                        |
| `POST /v1/contests/:id/motion`                | **motion-log ingestion**: accel + gyro samples → still time and tamper flags (flatline, gaps, low rate, time reversal, impossible values, missed pulse, client-reported)                                   |
| `POST /v1/contests/:id/result`                | **result signing**: canonical JSON result → SHA-256 → ed25519 signature with Algorand's `MX` prefix (verifies with `algosdk.verifyBytes`). The referee then calls `settle(winner, resultSha256)` on-chain. |

Every response carries an `x-stishsits-notice` header with the testnet-only banner. The server refuses to start unless `ALGORAND_NETWORK` is `localnet` or `testnet`.

## Keys

The signing key is read **only** from `RESULT_SIGNER_SEED_B64` in the environment (see `.env.example`). Without it, signing is disabled and `/result` returns 503. Tests generate a random key per run. In production the key belongs in a KMS/HSM, never in a file or the repo.

## Run

```bash
npm ci
npm run lint && npm run typecheck && npm test
cp .env.example .env   # fill in your own values locally; .env is git-ignored
npm run dev
```

## Stubbed / TODO

- Persistence (Postgres), auth (wallet-signed session), rate limiting
- WebSocket push for pulses (polling today)
- Indexer/algod checks that `join` and `settle` really happened on-chain; submitting `settle` from a referee signer
- Device attestation (Play Integrity / App Attest), human review queue for flagged results
