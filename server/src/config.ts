export type Network = 'localnet' | 'testnet';

export interface Config {
  port: number;
  host: string;
  network: Network;
  contestAppId: number;
  signerSeed?: Buffer;
  pulseSecret: string;
}

/** Load config from the environment only. Keys are never read from files in the repo. */
export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const network = (env.ALGORAND_NETWORK ?? 'testnet').toLowerCase();
  if (network !== 'localnet' && network !== 'testnet') {
    throw new Error(
      `ALGORAND_NETWORK must be localnet or testnet (got "${network}"). MainNet is not supported.`,
    );
  }
  let signerSeed: Buffer | undefined;
  if (env.RESULT_SIGNER_SEED_B64) {
    signerSeed = Buffer.from(env.RESULT_SIGNER_SEED_B64, 'base64');
    if (signerSeed.length !== 32) throw new Error('RESULT_SIGNER_SEED_B64 must decode to 32 bytes');
  }
  const pulseSecret = env.PULSE_SECRET ?? '';
  if (pulseSecret && pulseSecret.length < 32) throw new Error('PULSE_SECRET must be at least 32 characters');
  return {
    port: Number(env.PORT ?? 8787),
    host: env.HOST ?? '127.0.0.1',
    network,
    contestAppId: Number(env.CONTEST_APP_ID ?? 0),
    signerSeed,
    pulseSecret: pulseSecret || cryptoRandom(),
  };
}

function cryptoRandom(): string {
  // dev fallback: a fresh random secret per process (pulses are not reproducible across restarts)
  return globalThis.crypto.randomUUID() + globalThis.crypto.randomUUID();
}
