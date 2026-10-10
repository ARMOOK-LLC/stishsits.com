/**
 * Pera Wallet (WalletConnect) PLACEHOLDER.
 *
 * TODO(Phase 1): integrate @perawallet/connect (or @txnlab/use-wallet) for React Native:
 *   - connect() -> session with the user's TESTNET address
 *   - signTransactions([axfer entry, pay box MBR, appl join]) for the escrow `join` group
 *   - reject any session whose chain is not TestNet
 * Nothing here holds keys. The app never sees a mnemonic.
 */
export interface WalletSession {
  address: string;
  network: 'testnet';
  placeholder: true;
}

export async function connectWallet(): Promise<WalletSession> {
  throw new Error(
    'Pera WalletConnect is not wired up yet (placeholder). Use a dev address for testnet trials.',
  );
}

/** Dev-only: a syntactically valid but meaningless address for UI testing against a local server. */
export function devSession(address: string): WalletSession {
  if (!/^[A-Z2-7]{58}$/.test(address)) throw new Error('Not an Algorand address');
  return { address, network: 'testnet', placeholder: true };
}
