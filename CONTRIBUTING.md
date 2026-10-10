# Contributing

Thanks for looking. This repository is published for **public review** of an experimental, testnet-only design. It is **not for real-money use** and is **pending legal review**.

## Before you start

- The license is not chosen yet (see [LICENSE](LICENSE)). Until it is, we can read and discuss contributions, but we may not be able to merge them. Opening an issue first is the best way to help.
- Reviews of the contract logic (`contracts/`) and the threat model (`docs/threat-model.md`) are the most valuable contributions right now.

## Ground rules

- Testnet and LocalNet only. Never add MainNet app ids, funded addresses, or code paths that target MainNet.
- Never commit keys, mnemonics or `.env` files. Use `.env.example`. CI runs a secret scan on every push.
- No price, return, investment or earnings language in code, docs or UI copy.
- Keep the "Experimental, testnet only, not for real-money use, pending legal review" banners in place.

## Dev setup

```bash
# contracts (Python 3.12+)
cd contracts && python3 -m venv .venv && . .venv/bin/activate && pip install -r requirements.txt && pytest -q
# server (Node 20+)
cd server && npm ci && npm run lint && npm run typecheck && npm test
# app (Node 20+, Expo SDK 54)
cd app && npm ci && npm run lint && npm run typecheck && npm test && npx expo start
```

If you change `contract.py`, recompile so the committed TEAL matches (CI checks):
`puyapy smart_contracts/contest_escrow/contract.py --out-dir artifacts --output-arc56 --no-output-arc32`

## Pull requests

Small and focused, with tests. Fill in the PR checklist. Be kind; see [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
