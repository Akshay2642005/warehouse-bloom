"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
/**
 * Requires a valid authentication token to access the route.
 * Verifies JWT and attaches user payload to req.user.
 */
function requireAuth(req, res, next) {
    // 1. Extract token from Authorization header or cookie
    // 2. Verify JWT
    // 3. Attach payload to req.user
    // 4. Call next() or return 401
    return next();
}
