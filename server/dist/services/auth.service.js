"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const prisma_1 = require("../utils/prisma");
const password_1 = require("../utils/password");
/**
 * Service responsible for user authentication and authorization logic.
 */
class AuthService {
    /**
     * Creates a user record in the database.
     */
    static async createUser(email, passwordHash) {
        const user = await prisma_1.prisma.user.create({
            data: {
                email,
                password: passwordHash,
                role: 'user'
            },
            select: {
                id: true,
                email: true,
                role: true
            }
        });
        return user;
    }
    /**
     * Finds user by email.
     */
    static async findUserByEmail(email) {
        return prisma_1.prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                role: true
            }
        });
    }
    /**
     * Validates user credentials and returns user info if valid.
     */
    static async validateCredentials(email, password) {
        const user = await prisma_1.prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                password: true,
                role: true
            }
        });
        if (!user)
            return null;
        const isValid = await (0, password_1.comparePassword)(password, user.password);
        if (!isValid)
            return null;
        return {
            id: user.id,
            email: user.email,
            role: user.role
        };
    }
}
exports.AuthService = AuthService;
