# Architecture (MVP: Stish Sits sit-still contest)

> Experimental, testnet only, not for real-money use, pending legal review.

```
 ┌──────────────┐  WalletConnect (TODO)  ┌──────────────┐
 │  app/ (Expo) │ ─────────────────────► │  Pera Wallet │──┐ signs join group
 │  sensors,    │                        └──────────────┘  │
 │  timer,      │  HTTPS (WebSocket TODO)                   ▼
 │  pulses      │ ◄────────────────────► ┌──────────────┐  ┌──────────────────────┐
 └──────────────┘   pulses, motion log   │ server/      │  │ Algorand TestNet     │
                                         │ contest API, │  │ contracts/           │
                                         │ pulse sched, │──► ContestEscrow app    │
                                         │ motion score,│  │ (one app per contest)│
                                         │ result signer│  └──────────────────────┘
                                         └──────────────┘   referee account calls
                                                            lock / settle
```

## Components

| Component | Responsibility | Trust |
|---|---|---|
| `contracts/` ContestEscrow | Holds entries; enforces posted terms, entry rules, deadlines, challenge window, payout split, refunds. | Trustless for funds movement; trusts the referee for *who won*. |
| `server/` | Contest registry, pulse schedule, motion-log ingestion and scoring, result signing as referee/oracle. | Trusted (centralized, disclosed). Its key can only post a result for entrants; it cannot redirect funds. |
| `app/` | Arms, times, shows pulses, records accel + gyro, raises tamper flags, uploads the log. | Untrusted client. The server re-scores every log. |

## Contest lifecycle

1. **Create.** Organizer deploys a ContestEscrow app with fixed terms (entry, cuts in basis points capped at 30% total, min/max field, deadlines, challenge window, referee address). No update method exists.
2. **Opt in.** Organizer funds the app's minimum balance; the app opts into the entry asset.
3. **Join.** Sitter signs an atomic group: entry-asset transfer to the app + small ALGO payment for their box + `join` app call. The server registers the sitter after the group confirms (indexer check TODO).
4. **Lock / start.** Entry closes; at least 2 sitters (rule 2) or the contest can be canceled and refunded.
5. **Sit.** Server pulses at unpredictable times (HMAC-derived, 40 to 120 s). Phone streams/uploads samples.
6. **Score.** Server re-scores each log (`server/src/motion.ts`), checks pulse answers, ranks clean logs above flagged ones.
7. **Sign.** Server produces a canonical JSON result, SHA-256 digest and an ed25519 signature (`MX` prefix, Algorand-verifiable). Flagged top results are held for human review.
8. **Settle.** Referee account calls `settle(winner, resultSha256)`. The hash pins the result document on chain.
9. **Challenge window.** Any entrant can `challenge()`; payout pauses for disclosed manual review.
10. **Payout.** After the window, anyone can call `payout()`: cuts and purse go out as inner transactions in one call (all or nothing). Rounding remainder goes to the winner, never a fee recipient.
11. **Cancel / refund.** Short field after the join deadline, referee no-show past the settle deadline, or organizer/referee cancel before payout → `refund(entrant)` per sitter.

## Method mapping to the build plan

The build plan names (`enter`, `post_result`, `settle`) map to this repo's `join`, `settle`, `payout`. `stake`, `forfeit` and 1st/2nd/3rd payouts are not implemented yet (see contracts/README.md).

## Data

- Motion logs: `{t, a[3], g[3]}` at ~50 Hz. Hash (`logSha256`) returned on upload so a sitter can later check the log was not altered.
- No personal data beyond a wallet address in this skeleton. Storage is in memory.
