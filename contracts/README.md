# contracts/

> **Experimental, testnet only, not for real-money use, pending legal review.** Not reviewed or audited. Do not deploy to MainNet.

`smart_contracts/contest_escrow/contract.py` is the Phase 3 contest escrow written in **Algorand Python (Puya)**, as the build plan recommends. One application per contest.

| Method | Who | What it does |
|---|---|---|
| `create(...)` | organizer | Posts every term: entry asset + amount, referee, promoter/venue/referee cuts in basis points (total capped at 30%), min/max field (min 2), join deadline, settle deadline, challenge window. No update method exists, so terms are fixed. |
| `opt_in_asset(pay)` | organizer | Funds the app's minimum balance; app opts into the entry asset. |
| `join(axfer, pay)` | entrant | Grouped entry-asset transfer to the app (exact amount, no clawback, no close-to, no rekey) plus a payment covering the entrant's box. Rejects the referee, late entries, duplicates and a full field. |
| `lock()` | referee or organizer | Closes entry; needs the minimum field. |
| `settle(winner, result_hash)` | **referee account only** | Posts the winner and the SHA-256 of the result/motion log; starts the challenge window. Authorization = the transaction must be signed by the referee account (in production the server's referee signer, key in a KMS/HSM). |
| `challenge()` | an entrant | Inside the window, flags the result; payout pauses for off-chain review (v1, disclosed as centralized). |
| `payout()` | anyone, after the window | Pays promoter, venue and referee cuts and the purse to the winner as inner transactions in one app call (all or nothing). Rounding remainder goes to the winner. |
| `cancel()` | organizer/referee any time before payout; anyone on a short field after the join deadline or after the settle deadline (timeout) | Moves to CANCELED. |
| `refund(entrant)` | anyone | After cancel, returns that entrant's entry (pull-based, once per entrant). |

## Run

```bash
python3 -m venv .venv && . .venv/bin/activate
pip install -r requirements.txt
ruff check . && ruff format --check .
puyapy smart_contracts/contest_escrow/contract.py --out-dir artifacts --output-arc56 --no-output-arc32
pytest -q
```

Tests are offline (algorand-python-testing emulator). **Not yet done:** LocalNet/TestNet end-to-end tests, opcode-budget/fee checks on a real node, typed client generation, independent review and audit, division gates, multi-place payouts (1st/2nd/3rd), referee stake and slashing, bonded challenges, contest factory.

The SITS ASA (127494380) is referenced in docs for information only. Tests use a fake asset. Nothing here should be pointed at MainNet.
