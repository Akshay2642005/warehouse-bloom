"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUser = registerUser;
exports.loginUser = loginUser;
exports.getCurrentUser = getCurrentUser;
const auth_service_1 = require("../services/auth.service");
const auth_schema_1 = require("../validation/auth.schema");
const password_1 = require("../utils/password");
const jwt_1 = require("../utils/jwt");
const apiResponse_1 = require("../utils/apiResponse");
/**
 * Registers a new user.
 */
async function registerUser(req, res) {
    const { email, password } = auth_schema_1.registerSchema.parse(req.body);
    const existingUser = await auth_service_1.AuthService.findUserByEmail(email);
    if (existingUser) {
        res.status(400).json((0, apiResponse_1.createResponse)({ success: false, message: 'User already exists' }));
        return;
    }
    const passwordHash = await (0, password_1.hashPassword)(password);
    const user = await auth_service_1.AuthService.createUser(email, passwordHash);
    res.status(201).json((0, apiResponse_1.createResponse)({
        data: { user: { id: user.id, email: user.email, role: user.role } },
        message: 'User registered successfully'
    }));
}
/**
 * Logs in an existing user and returns a JWT.
 */
async function loginUser(req, res) {
    const { email, password } = auth_schema_1.loginSchema.parse(req.body);
    const user = await auth_service_1.AuthService.validateCredentials(email, password);
    if (!user) {
        res.status(401).json((0, apiResponse_1.createResponse)({ success: false, message: 'Invalid credentials' }));
        return;
    }
    const token = (0, jwt_1.signToken)({ id: user.id, email: user.email, role: user.role });
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
    res.status(200).json((0, apiResponse_1.createResponse)({
        data: { user: { id: user.id, email: user.email, role: user.role }, token },
        message: 'Login successful'
    }));
}
/**
 * Returns the currently logged-in user based on the JWT cookie.
 */
async function getCurrentUser(req, res) {
    const user = req.user; // set by authenticate middleware
    if (!user) {
        res.status(401).json((0, apiResponse_1.createResponse)({ success: false, message: 'Not authenticated' }));
        return;
    }
    res.status(200).json((0, apiResponse_1.createResponse)({ data: { user }, message: 'User retrieved successfully' }));
}
