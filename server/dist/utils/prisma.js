"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
/**
 * Prisma client singleton to interact with the database.
 */
exports.prisma = new client_1.PrismaClient({});
