// Load environment variables first, before any other imports
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from project root (two levels up from src/mastra/)
dotenv.config({ path: resolve(__dirname, '../../.env') });

import { Mastra } from '@mastra/core';
import { Observability } from '@mastra/observability';
import { BraintrustExporter } from '@mastra/braintrust';
import { fraudAgent } from './agents/fraud-agent';

// Configure Mastra with the fraud detection agent and observability
export const mastra = new Mastra({
  agents: {
    fraudDetective: fraudAgent,
  },
  observability: process.env.BRAINTRUST_API_KEY ? new Observability({
    configs: {
      braintrust: {
        serviceName: 'fraud-detector',
        exporters: [
          new BraintrustExporter({
            apiKey: process.env.BRAINTRUST_API_KEY,
            projectName: 'btd-fraud-detector',
          }),
        ],
      },
    },
  }) : undefined,
});

export { fraudAgent };
