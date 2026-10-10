# Stish Sits

**Transparent, skill-based contests settled on Algorand.** To sit still requires skill.

> ⚠️ **Experimental, testnet only, not for real-money use, pending legal review.**
>
> This repository is MVP scaffolding published for public review. The contracts are unaudited and must not be deployed to MainNet. There is no live product and no contest taking entries. Nothing in this repository is an offer to sell, or a solicitation to buy, SITS or any other asset, and nothing here is legal, tax, financial or investment advice.

## The idea

Local skill contests (cornhole, fishing, golf, lawnmower races, car shows) run on trust: a cash box and a spreadsheet. Stish Sits puts the money side on chain:

- **Posted terms.** Entry, purse, venue cut, promoter cut, referee fee and payout table are published in the contest application before anyone enters, and lock when entry opens.
- **Escrowed entries.** Entries sit in the contest application, not with a person.
- **Defined result authority.** The phone app for Stish Sits races; a staked human referee for other sports, with a bonded challenge window.
- **Atomic settlement.** One transaction group pays winners, venue, promoter and referee, or nobody.
- **Automatic refunds.** A short field or a canceled contest refunds every entry.

The flagship contest, also called **Stish Sits**, is a phone-flat sit-still contest: the app measures motion and sends random prompts; the last sitter still in, still answering, wins. The first planned real-purse event is a small cornhole tournament in Hochatown, Oklahoma, only after attorney sign-off.

STISHSITS is a palindrome. It reads the same both ways.

## SITS

For information only: SITS is Algorand Standard Asset [`127494380`](https://allo.info/asset/127494380) ("Stish Sits", unit SITS, 500,000,000 supply, 4 decimals). In the platform it is intended only as an entry chip and as a slashable performance stake for referees. It is not an investment and we make no claim about its value.

Disclosures: the creator account holds about 98.8% of supply, and the manager, reserve, freeze and clawback roles are all set to the creator account. SITS was previously used as social-site rewards, sold directly for a period, and traded on Tinyman, including around the January 2022 Tinyman v1 exploit (a Tinyman contract flaw, not a SITS flaw). Full history: [docs/white-paper.md, section 12](docs/white-paper.md#12-history-of-sits).

## Repository layout

| Path | Contents |
|---|---|
| [`docs/white-paper.md`](docs/white-paper.md) | White paper, draft v0.3.1 (also as [PDF](docs/StishSits-White-Paper.pdf)) |
| [`ROADMAP.md`](ROADMAP.md) | Gated phases 0 to 8 (plus a future-research note) |
| [`contracts/`](contracts/) | Contest escrow in Algorand Python (Puya): create, join, lock, settle, challenge, payout, cancel, refund; offline unit tests |
| [`server/`](server/) | Node.js/TypeScript (Fastify) contest API, pulse timing, motion-log scoring, result signing, health checks |
| [`app/`](app/) | React Native/Expo app: wallet placeholder, join, sit-still timer with accelerometer/gyroscope and tamper flags, results |
| [`docs/`](docs/) | [Architecture](docs/architecture.md), [threat model](docs/threat-model.md), [contest rules spec](docs/contest-rules.md), [engineering roadmap](docs/roadmap.md), [grant and audit plan](docs/grant-and-audit-plan.md) |
| [`.github/workflows/ci.yml`](.github/workflows/ci.yml) | Lint, typecheck, tests, TEAL compile check, secret scan |
| [`CONTRIBUTING.md`](CONTRIBUTING.md), [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md), [`SECURITY.md`](SECURITY.md) | How to help, how to behave, how to report a vulnerability |
| [`LICENSE`](LICENSE) | All rights reserved, license TBD |

## Quick start (local / testnet only)

```bash
cd contracts && python3 -m venv .venv && . .venv/bin/activate && pip install -r requirements.txt && pytest -q
cd server && npm ci && npm test && cp .env.example .env && npm run dev
cd app && npm ci && npm test && npx expo start
```

The server refuses to start on any network other than `localnet` or `testnet`. No keys are stored in this repository; see `server/.env.example`.

## What is stubbed

Pera WalletConnect (placeholder), on-chain confirmation of joins, persistence and auth on the server, WebSocket pulses, the pre-sit checklist, pulse types, sudden death and tie-breaks, forfeit, multi-place payouts, referee staking and slashing, device attestation, LocalNet/TestNet end-to-end tests, and an independent audit. Details in each folder's README and in [docs/roadmap.md](docs/roadmap.md).

## Eligibility

Any future contest: 18+ only (21+ where state law requires), skill contests only, void and not available where prohibited.

## Contact

Email info@stishsits.com (security reports: see [SECURITY.md](SECURITY.md)). Stish Sits is a project of ARMOOK LLC (entity structure pending attorney review). Website: https://stishsits.com. Not affiliated with or endorsed by Algorand Foundation.
