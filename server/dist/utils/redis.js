"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectRedis = connectRedis;
exports.getRedis = getRedis;
const redis_1 = require("redis");
const logger_1 = require("./logger");
const config_1 = require("./config");
let client = null;
/**
 * Connects to Redis using REDIS_URL.
 */
async function connectRedis() {
    if (client)
        return client;
    const url = config_1.config.REDIS_URL;
    client = (0, redis_1.createClient)({ url });
    client.on('error', (err) => logger_1.logger.error('Redis Client Error', { err }));
    await client.connect();
    logger_1.logger.info('Connected to Redis');
    return client;
}
/**
 * Returns the Redis client instance if connected.
 */
function getRedis() {
    if (!client)
        throw new Error('Redis client not initialized');
    return client;
}
