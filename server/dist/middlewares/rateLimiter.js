"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRateLimiter = createRateLimiter;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
/**
 * Creates a rate limiter middleware instance with sensible defaults.
 */
function createRateLimiter(options) {
    return (0, express_rate_limit_1.default)({
        windowMs: options?.windowMs ?? (15 * 60 * 1000),
        max: options?.max ?? 100,
        standardHeaders: true,
        legacyHeaders: false
    });
}
