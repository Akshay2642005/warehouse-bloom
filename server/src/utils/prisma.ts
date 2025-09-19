import { PrismaClient } from '@prisma/client';

/**
 * Prisma client singleton to interact with the database.
 */
export const prisma = new PrismaClient({}); 