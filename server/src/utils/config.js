"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
var dotenv = require("dotenv");
dotenv.config({});
var Config = /** @class */ (function () {
    function Config() {
        this.NODE_ENV = process.env.NODE_ENV;
        this.REDIS_URL = process.env.REDIS_URL;
        this.CLIENT_ORIGIN = process.env.CLIENT_ORIGIN;
        this.BCRYPT_ROUNDS = process.env.BCRYPT_ROUNDS ? parseInt(process.env.BCRYPT_ROUNDS, 10) : undefined;
        this.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;
        this.JWT_SECRET = process.env.JWT_SECRET;
        this.DATABASE_URL = process.env.DATABASE_URL;
    }
    return Config;
}());
exports.config = new Config();
