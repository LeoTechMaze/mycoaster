const { z } = require('zod');

const schema = z.object({
  NODE_ENV: z.string().default('production'),
  PORT: z.coerce.number().default(3000),

  POSTGRES_HOST: z.string().default('localhost'),
  POSTGRES_PORT: z.coerce.number().default(5432),
  POSTGRES_USER: z.string().default('coaster'),
  POSTGRES_PASSWORD: z.string(),
  POSTGRES_DB: z.string().default('coaster_tracker'),

  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional(),

  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),

  // Optional until Firebase credentials are provisioned
  FIREBASE_SERVICE_ACCOUNT_PATH: z.string().optional(),
});

const result = schema.safeParse(process.env);

if (!result.success) {
  const issues = result.error.issues
    .map((i) => `  ${i.path.join('.')}: ${i.message}`)
    .join('\n');
  console.error('[Config] Invalid environment variables:\n' + issues);
  process.exit(1);
}

module.exports = result.data;
