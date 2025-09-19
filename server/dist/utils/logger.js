"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
/**
 * Simple structured logger for the backend.
 */
exports.logger = {
    info(message, meta) {
        console.log(JSON.stringify({ level: 'info', message, meta, timestamp: new Date().toISOString() }));
    },
    error(message, meta) {
        console.error(JSON.stringify({ level: 'error', message, meta, timestamp: new Date().toISOString() }));
    },
    warn(message, meta) {
        console.warn(JSON.stringify({ level: 'warn', message, meta, timestamp: new Date().toISOString() }));
    },
    debug(message, meta) {
        if (process.env.NODE_ENV !== 'production') {
            console.debug(JSON.stringify({ level: 'debug', message, meta, timestamp: new Date().toISOString() }));
        }
    }
};
