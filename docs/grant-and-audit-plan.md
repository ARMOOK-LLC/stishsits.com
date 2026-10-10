# Grant and audit plan (draft)

> Experimental, testnet only, not for real-money use, pending legal review. This is a planning document for conversations with the Algorand Foundation and auditors. Nothing has been applied for, offered or agreed. It contains no request amounts; any amount will come from written quotes and will be set out in a specific application.

## 1. Summary

Stish Sits is building skill-contest tooling on Algorand: an escrow contract that holds entries under posted rules, a referee/result-signing service, and a phone app for the sit-still contest. Before anything is used with real value, the code needs an independent audit, a public testnet period and attorney clearance.

The ask to the Algorand Foundation is in three phases. Each later phase is requested only if the earlier one meets its measurable results.

| Phase | What we would ask for | Requested when |
|---|---|---|
| A. Security and testing | Grant or ecosystem support toward an independent audit and testing; audit-firm referrals | Testing milestones T1 and T2 below are complete |
| B. First Hochatown event | Marketing support and/or a small amount of ALGO to cover new players' wallet minimum balances and network fees during onboarding | Phase A audit findings resolved and attorney clearance in hand |
| C. College expansion (later, milestone-based follow-up) | A separate follow-up request, only if the pilot meets its targets | Phase B results published and reviewed |

## 2. Programs we have verified (October 2026)

Program names and links below were checked on 2026-10-10. Rules change; each will be re-checked before any application.

- **xGov** (community-governed grants): <https://xgov.app/>, proposal spec <https://docs.xgov.algorand.co/specs/proposal>, process [ARC-34](https://dev.algorand.co/arc-standards/arc-0034/), announcement [Algorand xGov update: Now accepting retroactive proposals](https://algorand.co/blog/algorand-xgov-update-now-accepting-retroactive-proposals). What matters for us:
  - Currently **retroactive** only (funding for work already delivered). The proactive, milestone-based type is listed as "not available yet" in the proposal spec.
  - Aimed at **open-source** work; the proposal form asks for an open-source license. This repository's license is still TBD, so a license decision comes first.
  - Proposers complete KYC and pay non-refundable account and proposal fees. Proposals are discussed on the Algorand forum before voting.
  - ARC-34 states that applications promoting gambling are not permitted. Stish Sits is designed as a skill contest, but eligibility must be confirmed with the Foundation and counsel **before** applying.
  - A past xGov proposal requested funding solely for a security audit ([xGov-204](https://forum.algorand.co/t/xgov-204-everyone-launchpad-security-audit/11870)), so audit-focused proposals have precedent.
- **Algorand Startup Challenges**: the 2025 edition has concluded ([winners announcement](https://algorand.co/blog/announcing-the-2025-algorand-startup-challenges-winners)); the Foundation announces future editions. We would watch for the next one.
- **Direct conversation with the Algorand Foundation** about ecosystem support, marketing support for a first event, and audit-firm referrals. No program name is assumed here; we would ask what fits.

This plan is about grants, in-kind support and referrals only. We are not seeking investment.

## 3. Audit scope

| Area | In scope |
|---|---|
| Escrow contract (`contracts/`) | Every ABI method: `create`, `opt_in_asset`, `join`, `lock`, `settle`, `challenge`, `payout`, `cancel`, `refund`, `entrant_status`. Authorization (organizer, referee, entrant, anyone), state machine and deadlines, group-transaction validation (asset, amount, sender, clawback, close-to, rekey), box storage and minimum-balance accounting, fee-split math and rounding, inner-transaction fees, refund completeness, absence of any update/delete path, review of the generated TEAL against the Python source |
| Result-signing service (`server/`) | Key loading (env/KMS only), canonical JSON and hashing, `MX`-prefixed ed25519 signing, replay and domain separation, refusal to run off testnet, what the signer can and cannot authorize on chain |
| Anti-cheat (`server/` and `app/`) | Pulse-schedule unpredictability, answer windows, motion-log scoring and tamper flags, log hashing, server re-scoring, the gaps listed in [`threat-model.md`](threat-model.md) |
| App transaction building (`app/`) | Construction of the join group, chain/network checks, what the user is shown before signing, WalletConnect session handling (once built), never handling recovery phrases |
| Out of scope for the first audit | Contracts not yet written (factory, registry, staking/slashing, multi-place payouts); these get their own review |

## 4. Testing milestones before any MainNet use

Each milestone must be met, and its results published in this repository, before the next starts.

| # | Milestone | Done when |
|---|---|---|
| T1 | Unit and property tests | Contract, server and app tests pass in CI; property tests cover payout math (cuts + purse = gross, rounding to the winner) and the contract state machine |
| T2 | LocalNet and TestNet end-to-end | Scripted full lifecycles (join, lock, settle, challenge, payout, cancel, refund) pass on LocalNet and TestNet, including failure paths |
| T3 | Public TestNet beta | Open TestNet trials with test assets only; motion logs and results published; issues triaged in public |
| T4 | Bug bounty | Scope, rules and safe-harbor terms published (reward structure set with counsel); reports handled via [SECURITY.md](../SECURITY.md) |
| T5 | Independent audit | Report received, findings fixed or accepted with reasons, report published |
| T6 | Attorney clearance | Written advice on contest law, the token's role, money transmission and launch states; MainNet use only where counsel says it is allowed |

No MainNet deployment is planned before T1 to T6 are complete.

## 5. Phased asks and measurable results

### Phase A: security and testing

- **Ask:** grant or ecosystem support toward the independent audit (T5) and testing work (T2 to T4); referrals to audit firms familiar with Algorand Python and the AVM.
- **Measured by:** T1 to T5 complete and public; TestNet contests run end to end; TestNet beta participants; audit findings by severity and how each was resolved.

### Phase B: first Hochatown event

- **Ask:** marketing support for a first local event, and/or a small amount of ALGO used only to cover new players' wallet minimum balances and network fees so first-time users can set up a wallet. None of it would go to purses or prizes.
- **Preconditions:** Phase A complete, attorney clearance (T6), event rules posted.
- **Measured by:** the pilot metrics in section 6, plus share of contests settled with no unresolved dispute, onboarding time per player, and a public post-event report.

### Phase C: college expansion (later follow-up)

- **Ask:** a separate, milestone-based follow-up request, made only if Phase B meets targets agreed in advance.
- **Preconditions:** written campus approval, age rules confirmed per school, counsel sign-off.
- **Measured by:** the pilot metrics in section 6 per campus, plus campuses participating and student organizers and referees trained.

## 6. Pilot metrics

| Metric | Source |
|---|---|
| New wallets created and opted in during onboarding | Public on-chain data (opt-in transactions), event check-in counts |
| Wallets that received onboarding ALGO, or seed SITS if counsel has cleared any such distribution | Public on-chain data (transfers from the published onboarding account) |
| Wallets that played again or joined other contests | Public on-chain data (repeat `join` calls across contest apps) |
| Repeat play at 30, 60 and 90 days | Public on-chain data, cohort by first-contest date |
| Contests run and entries per contest | Public on-chain data (contest apps created, `join` and `payout`/`refund` calls) |
| Waitlist sign-ups | stishsits.com waitlist (counts only) |
| Site and search interest | Site analytics and search-console data (aggregate visits, referrers, search queries) |

**Not a success measure.** Market prices are not used as a success measure. The plan does not track or report the price of SITS or ALGO as a pilot metric.

**Privacy.** Reports are aggregate only (counts and cohorts). We will not link a wallet address to a person without that person's consent, and individual event or waitlist records are not published. Analytics are configured to report aggregates, in line with the site privacy policy (draft, pending attorney review).

## 7. Deliverables

- Open repository with CI, tests and the audited contract source and TEAL
- Published audit report and a findings-resolution log
- Bug bounty policy
- TestNet beta report (contests run, participants, issues found and fixed)
- Wallet onboarding guide for first-time players
- Hochatown post-event report with the section 6 metrics
- If Phase C proceeds: a campus playbook (organizer and referee training, conflict rules, age checks)

## 8. Rough timeline

Rough, not committed; legal review and auditor availability set the pace.

| Window (from the start of Phase A) | Work |
|---|---|
| Months 0 to 2 | T1 and T2; license decision; confirm program eligibility with the Foundation and counsel |
| Months 2 to 4 | T3 public TestNet beta; T4 bug bounty published; audit firm engaged |
| Months 4 to 6 | T5 audit and fixes; T6 attorney clearance |
| After T1 to T6 | Phase B Hochatown event, then the 30/60/90-day metrics report |
| Later | Phase C follow-up request, only if Phase B targets were met |

## 9. What this plan does not do

It does not promise any outcome, prize level or value for any asset, and it does not commit the Foundation or any auditor to anything. SITS (ASA 127494380) is referenced in this repository for information only.
