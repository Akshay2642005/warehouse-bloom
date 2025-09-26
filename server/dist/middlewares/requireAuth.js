"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
exports.authenticate = authenticate;
const jwt_1 = require("../utils/jwt");
const apiResponse_1 = require("../utils/apiResponse");
/**
 * Requires a valid authentication token to access the route.
 * Verifies JWT and attaches user payload to req.user.
 */
function requireAuth(req, res, next) {
    try {
        // Extract token from Authorization header or cookie
        const authHeader = req.headers.authorization;
        const token = authHeader?.startsWith('Bearer ')
            ? authHeader.substring(7)
            : req.cookies?.token;
        if (!token) {
            res.status(401).json((0, apiResponse_1.createResponse)({
                success: false,
                message: 'Access token required'
            }));
            return;
        }
        // Verify JWT
        const payload = (0, jwt_1.verifyToken)(token);
        // Attach payload to req.user
        req.user = payload;
        next();
    }
    catch (error) {
        res.status(401).json((0, apiResponse_1.createResponse)({
            success: false,
            message: 'Invalid or expired token'
        }));
    }
}
/**
 * Middleware to authenticate user via JWT in HTTP-only cookie.
 * Sets req.user = { email, role } if token is valid.
 */
function authenticate(req, res, next) {
    try {
        const token = req.cookies?.token;
        if (!token) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }
        // Verify JWT
        const payload = (0, jwt_1.verifyToken)(token); // returns { email, role }
        req.user = payload;
        next();
    }
    catch (err) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
}
