"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
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
