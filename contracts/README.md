# contracts/ (placeholder)

There is **no contract code in this repository yet**, and nothing is deployed to Algorand MainNet or TestNet.

Planned (see [white paper section 8](../docs/white-paper.md#8-on-chain-architecture-on-algorand) and [ROADMAP.md](../ROADMAP.md), Phase 3):

- **Contest application**: one per contest; posted terms in global state, per-entrant records in box storage; methods `create`, `opt_in_asset`, `stake`, `enter`, `forfeit`, `post_result`, `challenge`, `settle`, `cancel`.
- **Contest factory** (later): creates contests from reviewed templates.
- **Registry** (later): per-account history for division gates and reputation.

Planned tooling: Algorand Python (Puya) with AlgoKit, ARC-4 / ARC-56, AlgoKit LocalNet, then TestNet with a test asset that mirrors SITS (4 decimals).

Rules that will apply before any MainNet use:

- Entries can leave the application only through `settle` or `cancel`.
- Terms are immutable once entry opens.
- The referee address is rejected at `enter`.
- Explicit checks on asset ID, amount, receiver, group size and transaction types; no unchecked rekey or close-to fields.
- Independent code review before any pilot; professional audit before Phase 6.
- Real-purse use only after written legal guidance.
