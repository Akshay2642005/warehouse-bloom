import * as dotenv from 'dotenv';
dotenv.config({});


class Config {
  public NODE_ENV: string | undefined;
  public CLIENT_ORIGIN: string | undefined;
  public REDIS_URL: string | undefined;
  public BCRYPT_ROUNDS: number | undefined;
  public JWT_EXPIRES_IN: string | undefined;
  public JWT_SECRET: string | undefined;
  public DATABASE_URL: string | undefined;
  constructor() {
    this.NODE_ENV = process.env.NODE_ENV;
    this.REDIS_URL = process.env.REDIS_URL;
    this.CLIENT_ORIGIN = process.env.CLIENT_ORIGIN;
    this.BCRYPT_ROUNDS = process.env.BCRYPT_ROUNDS ? parseInt(process.env.BCRYPT_ROUNDS, 10) : undefined;
    this.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;
    this.JWT_SECRET = process.env.JWT_SECRET;
    this.DATABASE_URL = process.env.DATABASE_URL;
  }
}

export const config: Config = new Config();
