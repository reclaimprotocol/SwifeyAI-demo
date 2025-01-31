import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const configSchema = z.object({
  database: z.object({
    url: z.string().url()
  }),
  server: z.object({
    port: z.number().int().positive(),
    apiKey: z.string().min(1)
  }),
  reclaim: z.object({
    appId: z.string(),
    appSecret: z.string()
  }),
  webhook: z.object({
    url: z.string().url()
  })
});

export const config = configSchema.parse({
  database: {
    url: process.env.DATABASE_URL
  },
  server: {
    port: Number(process.env.PORT) || 3000,
    apiKey: process.env.API_KEY || 'your-api-key'
  },
  reclaim: {
    appId: process.env.RECLAIM_APP_ID || '',
    appSecret: process.env.RECLAIM_APP_SECRET || ''
  },
  webhook: {
    url: process.env.WEBHOOK_URL || 'http://localhost:3000/webhook'
  }
}); 