"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const requireAuth_1 = require("../middlewares/requireAuth");
exports.authRouter = (0, express_1.Router)();
/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 */
exports.authRouter.post('/register', auth_controller_1.registerUser);
/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Login a user and return JWT
 *     tags: [Auth]
 */
exports.authRouter.post('/login', auth_controller_1.loginUser);
/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     summary: Logout user (clear cookie)
 *     tags: [Auth]
 */
exports.authRouter.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ success: true, message: 'Logged out successfully' });
});
/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     summary: Get current logged-in user
 *     tags: [Auth]
 */
exports.authRouter.get('/me', requireAuth_1.authenticate, auth_controller_1.getCurrentUser);
