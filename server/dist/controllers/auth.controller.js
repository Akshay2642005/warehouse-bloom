"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUser = registerUser;
exports.loginUser = loginUser;
/**
 * Registers a new user.
 * @param req - Express Request object
 * @param res - Express Response object
 * @returns 201 Created with user data (without password)
 */
async function registerUser(req, res) {
    // 1. Validate input with zod
    // 2. Hash password
    // 3. Create user in DB using Prisma
    // 4. Return user response (without password)
    res.status(201).json({ message: 'registerUser stub' });
}
/**
 * Logs in an existing user and returns a JWT.
 * @param req - Express Request object
 * @param res - Express Response object
 * @returns 200 OK with token and user info
 */
async function loginUser(req, res) {
    // 1. Validate input with zod
    // 2. Verify credentials with AuthService
    // 3. Sign JWT and set cookie/return token
    res.status(200).json({ message: 'loginUser stub' });
}
