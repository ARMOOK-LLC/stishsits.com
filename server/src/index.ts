import { buildApp, BANNER } from './app.js';
import { loadConfig } from './config.js';

const config = loadConfig();
const app = buildApp(config, { logger: true });
app.log.warn(BANNER);
if (!config.signerSeed) app.log.warn('RESULT_SIGNER_SEED_B64 not set: result signing disabled');
await app.listen({ port: config.port, host: config.host });
