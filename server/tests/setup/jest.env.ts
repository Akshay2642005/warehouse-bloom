process.env.NODE_ENV = 'test';
process.env.SKIP_REDIS = process.env.SKIP_REDIS || '1';
if (process.env.DATABASE_URL_TEST) {
  process.env.DATABASE_URL = process.env.DATABASE_URL_TEST;
}