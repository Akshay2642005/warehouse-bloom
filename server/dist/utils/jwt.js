"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signToken = signToken;
exports.verifyToken = verifyToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
/**
 * Signs a JWT with the provided payload and returns the token string.
 */
function signToken(payload) {
    const secret = process.env.JWT_SECRET ?? 'dev_secret';
    const envExpires = process.env.JWT_EXPIRES_IN;
    const expiresIn = envExpires
        ? Number.isNaN(Number(envExpires))
            ? envExpires // e.g. '1d', '2h'
            : Number(envExpires)
        : '1d';
    return jsonwebtoken_1.default.sign(payload, secret, { expiresIn });
}
/**
 * Verifies a JWT and returns its payload.
 */
function verifyToken(token) {
    const secret = process.env.JWT_SECRET ?? 'dev_secret';
    return jsonwebtoken_1.default.verify(token, secret);
}
