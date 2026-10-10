# Security

> Experimental, testnet only, not for real-money use, pending legal review. Nothing in this repository is deployed to MainNet, and the contracts have not been audited.

## Reporting a vulnerability

Please email **info@stishsits.com** with "SECURITY" in the subject. Include the component (contracts, server, app), steps to reproduce and impact. Please do not open a public issue for security problems.

We will acknowledge reports as soon as we can and keep you updated. There is no bug bounty at this time.

## Scope

- `contracts/` contest escrow logic (fund safety, authorization, refunds)
- `server/` result signing, pulse timing, motion-log scoring, API
- `app/` sensor handling and tamper detection
- Secrets accidentally committed to this repository

## Never

We will never ask for your wallet recovery phrase. If someone claiming to represent Stish Sits asks for it, report it to info@stishsits.com.
