import dotenv from 'dotenv';
dotenv.config();

export const config = {
  // Server
  PORT: parseInt(process.env.PORT || '4000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:8000',

  // Database
  DATABASE_URL: process.env.DATABASE_URL!,

  // Redis
  REDIS_URL: process.env.REDIS_URL,

  // Better Auth
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET!,
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || 'http://localhost:4000',

  // Polar Payments
  POLAR_ACCESS_TOKEN: process.env.POLAR_ACCESS_TOKEN,
  POLAR_WEBHOOK_SECRET: process.env.POLAR_WEBHOOK_SECRET,
  POLAR_FREE_PRODUCT_ID: process.env.POLAR_FREE_PRODUCT_ID,
  POLAR_PRO_PRODUCT_ID: process.env.POLAR_PRO_PRODUCT_ID,
  POLAR_ENTERPRISE_PRODUCT_ID: process.env.POLAR_ENTERPRISE_PRODUCT_ID,
  POLAR_ENVIRONMENT: process.env.POLAR_ENVIRONMENT || 'sandbox',

  // Email
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASSWORD: process.env.SMTP_PASSWORD,
  SMTP_FROM: process.env.SMTP_FROM,
} as const;

// Validate required env vars
const requiredEnvVars = ['DATABASE_URL', 'BETTER_AUTH_SECRET'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}
