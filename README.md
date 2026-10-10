# Stish Sits

**Transparent, skill-based contests settled on Algorand.** To sit still requires skill.

> **Status: pre-development, pending legal review.** There is no live product, no deployed contract and no contest taking entries. Nothing in this repository is an offer to sell, or a solicitation to buy, SITS or any other asset, and nothing here is legal, tax, financial or investment advice.

## The idea

Local skill contests (cornhole, fishing, golf, lawnmower races, car shows) run on trust: a cash box and a spreadsheet. Stish Sits puts the money side on chain:

- **Posted terms.** Entry, purse, venue cut, promoter cut, referee fee and payout table are published in the contest application before anyone enters, and lock when entry opens.
- **Escrowed entries.** Entries sit in the contest application, not with a person.
- **Defined result authority.** The phone app for Stish Sits races; a staked human referee for other sports, with a bonded challenge window.
- **Atomic settlement.** One transaction group pays winners, venue, promoter and referee, or nobody.
- **Automatic refunds.** A short field or a canceled contest returns every entry.

The flagship contest, also called **Stish Sits**, is a phone-flat sit-still contest: the app measures motion and sends random prompts; the last sitter still in, still answering, wins. The first planned real-purse event is a small cornhole tournament in Hochatown, Oklahoma, only after attorney sign-off.

STISHSITS is a palindrome. It reads the same both ways.

## SITS

SITS is Algorand Standard Asset [`127494380`](https://allo.info/asset/127494380) ("Stish Sits", unit SITS, 500,000,000 supply, 4 decimals). In the platform it is intended only as an entry chip and as a slashable performance stake for referees. It is not an investment and we make no claim about its value.

Disclosures: the creator account holds about 98.8% of supply, and the manager, reserve, freeze and clawback roles are all set to the creator account. SITS was previously used as social-site rewards, sold directly for a period, and traded on Tinyman, including around the January 2022 Tinyman v1 exploit (a Tinyman contract flaw, not a SITS flaw). Full history: [docs/white-paper.md, section 12](docs/white-paper.md#12-history-of-sits).

## Repository layout

| Path | Contents |
|---|---|
| [`docs/white-paper.md`](docs/white-paper.md) | White paper, draft v0.3 (also as [PDF](docs/StishSits-White-Paper.pdf)) |
| [`ROADMAP.md`](ROADMAP.md) | Gated phases 0 to 9 |
| [`contracts/`](contracts/) | Placeholder. No contract code yet |
| [`LICENSE`](LICENSE) | Placeholder, all rights reserved pending a licensing decision |

## Eligibility

Any future contest: 18+ only (21+ where state law requires), skill contests only, void and not available where prohibited.

## Contact

Stish Sits is a project of ARMOOK LLC (entity structure pending attorney review). Website: https://stishsits.com. Not affiliated with or endorsed by Algorand Foundation.
