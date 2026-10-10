# Engineering roadmap (MVP scaffolding)

See [`../ROADMAP.md`](../ROADMAP.md) for the gated product phases. This file tracks code.

| Area | Done in this scaffold | Next |
|---|---|---|
| contracts | Single-winner escrow: create, opt-in, join, lock, settle, challenge, payout, cancel, refund; 17 offline unit tests | LocalNet/TestNet e2e; forfeit; 1st/2nd/3rd payouts; referee stake + slashing; typed client; review and audit |
| server | Contest API, pulse schedule, motion scoring, result signer, health checks; 19 tests | Persistence, wallet-signed auth, WebSocket, indexer checks, referee tx submission, KMS |
| app | Banner, wallet placeholder, contest list/join, sit timer with sensors and tamper flags, results; 4 logic tests | Pera WalletConnect, checklist (rules 5–6), pulse types, keep-awake, SQLite buffering, attestation, EAS builds |
| ops | CI (lint, typecheck, tests, TEAL compile check, secret scan) | Deploy server to the Phase 0 host (testnet only) |
