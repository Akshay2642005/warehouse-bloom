"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createResponse = createResponse;
/**
 * Creates a standard API response object.
 */
function createResponse(payload) {
    return { success: true, ...payload };
}
