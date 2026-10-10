# app/

> **Experimental, testnet only, not for real-money use, pending legal review.** The same banner is rendered on every screen (`src/components/Banner.tsx`).

React Native + Expo SDK 54 + TypeScript skeleton.

| Screen   | What it does                                                                                                                                                                                                                                                                                               |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Home     | **Pera WalletConnect placeholder** (`src/lib/wallet.ts` throws "not wired up yet"); dev-only address entry for local testing                                                                                                                                                                               |
| Contests | Lists contests from the server; **Join** registers the address (TODO: build and sign the escrow join group with Pera first)                                                                                                                                                                                |
| Sit      | **Sit-still timer**: accelerometer + gyroscope at ~50 Hz via `expo-sensors`, gravity removed with a low-pass filter, sustained-move detection, polled server pulses with an "I'm here" tap, **tamper flags** (app backgrounded, sample gaps, low sample rate, sensors unavailable), uploads the motion log |
| Results  | Server verdict (still time, flags, log hash)                                                                                                                                                                                                                                                               |

Pure logic lives in `src/lib/stillness.ts` and is unit-tested with Vitest. The server re-scores every log; the on-device result is only live feedback.

## Run

```bash
npm ci
npm run lint && npm run typecheck && npm test
cp .env.example .env   # point EXPO_PUBLIC_API_URL at your local server
npx expo start
```

## Stubbed / TODO

Pera WalletConnect and transaction signing; Set checklist (rules 5 and 6, Android ringer/DND native module); pulse types (letter, punchline, don't-move); sudden death; keep-awake and forfeit on background; WebSocket; SQLite log buffering; Play Integrity / App Attest; EAS builds.
