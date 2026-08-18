import "server-only";

import { z } from "zod";

const environmentSchema = z.object({
  DATABASE_URL: z.string().min(1),
  AUTH_SECRET: z.string().min(16),
  APP_URL: z.string().url(),
  MEDIA_ROOT: z.string().min(1),
  MEDIA_MAX_BYTES: z.coerce.number().int().positive(),
  PAYMENT_PROVIDER: z.literal("mock"),
  PAYMENT_CALLBACK_SECRET: z.string().min(1),
  DEFAULT_CURRENCY: z.string().length(3),
  SEED_ADMIN_EMAIL: z.string().email(),
  SEED_ADMIN_PASSWORD: z.string().min(12),
});

export type AppEnvironment = z.infer<typeof environmentSchema>;

export function getEnvironment(): AppEnvironment {
  return environmentSchema.parse({
    DATABASE_URL: process.env.DATABASE_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
    APP_URL: process.env.APP_URL,
    MEDIA_ROOT: process.env.MEDIA_ROOT,
    MEDIA_MAX_BYTES: process.env.MEDIA_MAX_BYTES,
    PAYMENT_PROVIDER: process.env.PAYMENT_PROVIDER,
    PAYMENT_CALLBACK_SECRET: process.env.PAYMENT_CALLBACK_SECRET,
    DEFAULT_CURRENCY: process.env.DEFAULT_CURRENCY,
    SEED_ADMIN_EMAIL: process.env.SEED_ADMIN_EMAIL,
    SEED_ADMIN_PASSWORD: process.env.SEED_ADMIN_PASSWORD,
  });
}
