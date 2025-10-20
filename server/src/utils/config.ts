import * as dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const configSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),
  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
  
  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  
  // Redis
  REDIS_URL: z.string().optional(),
  
  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),
  
  // Security
  BCRYPT_ROUNDS: z.coerce.number().default(12),
  SESSION_TIMEOUT_HOURS: z.coerce.number().default(24),
  MAX_LOGIN_ATTEMPTS: z.coerce.number().default(5),
  LOCKOUT_DURATION_MINUTES: z.coerce.number().default(15),
  
  // Email
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),
  
  // Polar Payments
  POLAR_ACCESS_TOKEN: z.string().optional(),
  POLAR_PRODUCT_ID: z.string().optional(),
  POLAR_WEBHOOK_SECRET: z.string().optional(),
  POLAR_SUCCESS_URL: z.string().optional(),
  POLAR_ENVIRONMENT: z.enum(['sandbox', 'production']).default('sandbox'),
  
  // File Upload
  MAX_FILE_SIZE_MB: z.coerce.number().default(10),
  UPLOAD_PATH: z.string().default('./uploads'),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
  
  // Monitoring
  ENABLE_METRICS: z.coerce.boolean().default(true),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

class Config {
  private static instance: Config;
  private _config: z.infer<typeof configSchema>;

  private constructor() {
    try {
      this._config = configSchema.parse(process.env);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Configuration validation failed:');
        error.errors.forEach(err => {
          console.error(`  ${err.path.join('.')}: ${err.message}`);
        });
        process.exit(1);
      }
      throw error;
    }
  }

  public static getInstance(): Config {
    if (!Config.instance) {
      Config.instance = new Config();
    }
    return Config.instance;
  }

  get NODE_ENV() { return this._config.NODE_ENV; }
  get PORT() { return this._config.PORT; }
  get CLIENT_ORIGIN() { return this._config.CLIENT_ORIGIN; }
  get DATABASE_URL() { return this._config.DATABASE_URL; }
  get REDIS_URL() { return this._config.REDIS_URL; }
  get JWT_SECRET() { return this._config.JWT_SECRET; }
  get JWT_EXPIRES_IN() { return this._config.JWT_EXPIRES_IN; }
  get JWT_REFRESH_EXPIRES_IN() { return this._config.JWT_REFRESH_EXPIRES_IN; }
  get BCRYPT_ROUNDS() { return this._config.BCRYPT_ROUNDS; }
  get SESSION_TIMEOUT_HOURS() { return this._config.SESSION_TIMEOUT_HOURS; }
  get MAX_LOGIN_ATTEMPTS() { return this._config.MAX_LOGIN_ATTEMPTS; }
  get LOCKOUT_DURATION_MINUTES() { return this._config.LOCKOUT_DURATION_MINUTES; }
  get SMTP_HOST() { return this._config.SMTP_HOST; }
  get SMTP_PORT() { return this._config.SMTP_PORT; }
  get SMTP_USER() { return this._config.SMTP_USER; }
  get SMTP_PASS() { return this._config.SMTP_PASS; }
  get SMTP_FROM() { return this._config.SMTP_FROM; }
  get POLAR_ACCESS_TOKEN() { return this._config.POLAR_ACCESS_TOKEN; }
  get POLAR_PRODUCT_ID() { return this._config.POLAR_PRODUCT_ID; }
  get POLAR_WEBHOOK_SECRET() { return this._config.POLAR_WEBHOOK_SECRET; }
  get POLAR_SUCCESS_URL() { return this._config.POLAR_SUCCESS_URL; }
  get POLAR_ENVIRONMENT() { return this._config.POLAR_ENVIRONMENT; }
  get MAX_FILE_SIZE_MB() { return this._config.MAX_FILE_SIZE_MB; }
  get UPLOAD_PATH() { return this._config.UPLOAD_PATH; }
  get RATE_LIMIT_WINDOW_MS() { return this._config.RATE_LIMIT_WINDOW_MS; }
  get RATE_LIMIT_MAX_REQUESTS() { return this._config.RATE_LIMIT_MAX_REQUESTS; }
  get ENABLE_METRICS() { return this._config.ENABLE_METRICS; }
  get LOG_LEVEL() { return this._config.LOG_LEVEL; }

  get isDevelopment() { return this.NODE_ENV === 'development'; }
  get isProduction() { return this.NODE_ENV === 'production'; }
  get isTest() { return this.NODE_ENV === 'test'; }
}

export const config = Config.getInstance();