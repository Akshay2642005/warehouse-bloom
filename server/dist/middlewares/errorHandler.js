"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const logger_1 = require("../utils/logger");
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const apiResponse_1 = require("../utils/apiResponse");
/**
 * Express error handling middleware.
 * Formats errors into consistent JSON responses.
 */
function errorHandler(err, _req, res, _next) {
    logger_1.logger.error('Unhandled error', { err });
    // Zod validation errors
    if (err instanceof zod_1.ZodError) {
        const errors = err.errors.reduce((acc, error) => {
            acc[error.path.join('.')] = error.message;
            return acc;
        }, {});
        res.status(400).json((0, apiResponse_1.createResponse)({
            success: false,
            message: 'Validation failed',
            errors
        }));
        return;
    }
    // Prisma errors
    if (err instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
            res.status(400).json((0, apiResponse_1.createResponse)({
                success: false,
                message: 'Unique constraint violation'
            }));
            return;
        }
        if (err.code === 'P2025') {
            res.status(404).json((0, apiResponse_1.createResponse)({
                success: false,
                message: 'Record not found'
            }));
            return;
        }
    }
    // Custom application errors
    if (err instanceof Error) {
        res.status(400).json((0, apiResponse_1.createResponse)({
            success: false,
            message: err.message
        }));
        return;
    }
    // Default error
    res.status(500).json((0, apiResponse_1.createResponse)({
        success: false,
        message: 'Internal Server Error'
    }));
}
