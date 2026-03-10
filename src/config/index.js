'use strict';

const { z } = require('zod');

/**
 * Zod schema for environment variable validation.
 * Validates all required and optional environment variables at startup.
 * Fails fast with descriptive error messages if required variables are missing.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string({ required_error: 'DATABASE_URL is required' }),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  JWT_ACCESS_SECRET: z.string({ required_error: 'JWT_ACCESS_SECRET is required' }),
  JWT_REFRESH_SECRET: z.string({ required_error: 'JWT_REFRESH_SECRET is required' }),
  JWT_ACCESS_EXPIRATION: z.string().default('15m'),
  JWT_REFRESH_EXPIRATION: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('*'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
});

const _parsed = envSchema.safeParse(process.env);

if (!_parsed.success) {
  const errorMessages = _parsed.error.errors
    .map((err) => `  - ${err.path.join('.')}: ${err.message}`)
    .join('\n');
  // eslint-disable-next-line no-console
  console.error(`\n[Config] Environment variable validation failed:\n${errorMessages}\n`);
  process.exit(1);
}

const config = {
  env: _parsed.data.NODE_ENV,
  port: _parsed.data.PORT,
  database: {
    url: _parsed.data.DATABASE_URL,
  },
  redis: {
    url: _parsed.data.REDIS_URL,
  },
  jwt: {
    accessSecret: _parsed.data.JWT_ACCESS_SECRET,
    refreshSecret: _parsed.data.JWT_REFRESH_SECRET,
    accessExpiration: _parsed.data.JWT_ACCESS_EXPIRATION,
    refreshExpiration: _parsed.data.JWT_REFRESH_EXPIRATION,
  },
  cors: {
    origin: _parsed.data.CORS_ORIGIN,
  },
  rateLimit: {
    windowMs: _parsed.data.RATE_LIMIT_WINDOW_MS,
    max: _parsed.data.RATE_LIMIT_MAX,
  },
};

module.exports = config;
