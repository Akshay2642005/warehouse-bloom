"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const logger_1 = require("../utils/logger");
/**
 * Express error handling middleware.
 * Formats errors into consistent JSON responses.
 * @param err - Error object
 * @param _req - Express Request
 * @param res - Express Response
 * @param _next - Next function
 */
function errorHandler(err, _req, res, _next) {
    logger_1.logger.error('Unhandled error', { err });
    const status = 500;
    res.status(status).json({ message: 'Internal Server Error' });
}
