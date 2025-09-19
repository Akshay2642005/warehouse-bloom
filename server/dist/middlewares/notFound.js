"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = notFoundHandler;
/**
 * 404 Not Found handler.
 */
function notFoundHandler(_req, res, _next) {
    res.status(404).json({ message: 'Route not found' });
}
