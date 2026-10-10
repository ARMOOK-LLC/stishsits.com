# Anti-cheat and security threat model (draft)

> Experimental, testnet only, not for real-money use, pending legal review.

Scope: the Stish Sits sit-still contest MVP. Assets at risk: escrowed entries, result integrity, sitter privacy, the referee signing key.

## Actors

| Actor | Can | Wants |
|---|---|---|
| Sitter | Control their phone, OS, network | Longer recorded still time than they actually sat |
| Colluding sitters / multi-accounting | Many wallets, many phones | Farm a field |
| Organizer / promoter | Create contests, cancel | Extra cut, redirect funds |
| Referee/oracle operator (server) | Post the winner | Pick a winner |
| Outside attacker | Network, public API | Steal funds, DoS, steal referee key |

## Threats and mitigations

| # | Threat | Mitigation (status) |
|---|---|---|
| T1 | **Phone on a table / still surface** while the sitter walks around | Pulses require a human tap inside 4 s at unpredictable times (**built**); flatline detection flags bit-identical sensor runs (**built**); "lap mode" expecting micro-motion (**needs real-sit data**) |
| T2 | **Replayed or synthetic sensor feed** (emulator, hooked sensor API) | Flatline / impossible-value / non-monotonic-time flags (**built**); Play Integrity / App Attest (**TODO**); server-side re-scoring of the raw log (**built**) |
| T3 | **Leaving the app** to get help or to stop sensors | AppState background → `APP_BACKGROUNDED` flag (**built**); keep-awake and forfeit policy (**TODO**) |
| T4 | **Predicting pulse times** | HMAC(server secret, contest id, index) schedule; client only sees a pulse when live (**built**); secret from env (**built**); sudden-death 15 s cadence (**TODO**) |
| T5 | **Answering a pulse for someone else** / sharing nonces | Nonce same for all sitters in a race (fairness) but answers are tied to an address; **wallet-signed sessions TODO**, so today any client can answer for any address. Not safe for anything beyond testnet. |
| T6 | **Tampered log after the fact** | `logSha256` returned at upload; result digest pinned on chain via `settle` (**built**) |
| T7 | **Multi-accounting** | One entry per address on chain (**built**); one entry per verified person (**TODO, depends on legal review**) |
| T8 | **Organizer changes terms or takes funds** | Terms fixed at create, no update/delete method; cuts capped at 30%; funds leave only via payout/refund (**built, needs audit**) |
| T9 | **Referee posts a false winner** | Winner must be a paid-in entrant; challenge window pauses payout (**built**); referee stake + slashing and bonded challenges (**TODO, Phase 6**) |
| T10 | **Referee disappears** | Anyone can cancel after the settle deadline; refunds are pull-based and open to anyone to trigger (**built**) |
| T11 | **Referee signing key theft** | Key only from env, never in repo; signing disabled when absent; production via KMS/HSM (**TODO**); secret scanning in CI (**built**) |
| T12 | **Malicious join groups** (clawback transfers, close-to, rekey, wrong asset or amount, someone else paying) | Explicit checks in `join` (**built, unit tested**) |
| T13 | **Inner-transaction fee drain** | Inner txns use fee 0 (caller pays via fee pooling) (**built**) |
| T14 | **API abuse / DoS** | Body size limit (**built**); auth and rate limits (**TODO**) |
| T15 | **Deploying to MainNet by mistake** | Server refuses non-testnet networks; app labeled testnet; README banners (**built**) |

## Known gaps (do not run real-value contests)

No wallet auth, no device attestation, no persistence, no audit, single referee key, sudden death and tie-break not implemented, iOS cannot verify silent/airplane mode (see white paper section 10.3).
