# Contest rules spec (draft, v0.1.0)

> Experimental, testnet only, not for real-money use, pending legal review. The 17 rules in the white paper (section 4.2) are the source text; this file maps them to code. Machine-readable constants: `server/src/rules.ts` (`GET /v1/rules`).

| Rule | Summary | Where enforced | Status |
|---|---|---|---|
| 2 | Race needs at least 2 paid sitters; otherwise entries return | `create` (min field ≥ 2), `lock`, `cancel` short-field path, `refund` | Built |
| 3 | Posted entry per division (Beginner 10, Intermediate 50, Open 100 SITS; Invite posted) | `create` fixes `entry_amount`; `join` checks exact amount | Built (division amounts not hard-coded) |
| 4 | Division gates | — | TODO (Phase 5 registry) |
| 5 | Silent before arming; Android checks ringer | app checklist | TODO |
| 6 | First-minute buzz = one restart; later buzz = forfeit | app | TODO |
| 7 | Phone stays flat; pick-up = forfeit | motion scoring | Built (as sustained-motion stop) |
| 8 | Same motion line for everyone | `RULES` thresholds are per-server constants | Built |
| 9 | Random pulses ~40–120 s; posted answer window; miss = forfeit | `server/src/pulse.ts`; window 4 s; `MISSED_PULSE` flag | Built (letter/punchline pulse types TODO; today a tap) |
| 10 | Last sitter in wins purse minus posted cut | standings by still time; `payout` | Built (single winner) |
| 11 | Sudden death, 15 s pulses, tie-break on prior clean answer speed | — | TODO |
| 12 | No coin flip, no random draw | No randomness in winner selection | Built |
| 13 | Posted promoter cut, default 10%; organizers do not pick the winner | `create` (bps, fixed), referee-only `settle` | Built |
| 14 | Forfeited entries stay in the purse | purse = all entries minus posted cuts | Built |
| 15 | No rollover; canceled race returns every entry | `cancel` + `refund` | Built |
| 16 | Winners may re-enter or leave | — | n/a |
| 17 | No claims about SITS value | Docs and UI copy | Policy |

## Scoring

- Still time = time from the first sample to the start of the first sustained movement (≥ 300 ms above 0.06 g linear accel or 0.12 rad/s rotation), else log length.
- Clean logs rank above flagged logs. A flagged top result is held for human review before `settle`.
- Ties on still time: not yet resolved (rule 11 TODO).

## Payout math

`gross = entry × entrants`; each cut = `gross × bps / 10000` (floor); `purse = gross − cuts`. Rounding remainder goes to the winner. Total cuts ≤ 3000 bps.
