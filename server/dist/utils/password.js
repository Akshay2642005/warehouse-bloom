"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.comparePassword = comparePassword;
const bcrypt_1 = __importDefault(require("bcrypt"));
const config_1 = require("./config");
/**
 * Hashes a plaintext password using bcrypt.
 */
async function hashPassword(plain) {
    // In real usage, configure salt rounds via env
    const rounds = config_1.config.BCRYPT_ROUNDS || 5;
    return bcrypt_1.default.hash(plain, rounds);
}
/**
 * Compares a plaintext password with a bcrypt hash.
 */
async function comparePassword(plain, hash) {
    return bcrypt_1.default.compare(plain, hash);
}
