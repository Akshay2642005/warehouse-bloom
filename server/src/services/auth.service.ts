import { prisma } from "../utils/prisma";
import { comparePassword } from "../utils/password";

/**
 * Service responsible for user authentication and authorization logic.
 */
export class AuthService {
  /**
   * Creates a user record in the database.
   */
  static async createUser(
    email: string,
    passwordHash: string,
  ): Promise<{ id: string; email: string; role: string }> {
    const user = await prisma.user.create({
      data: {
        email,
        password: passwordHash,
        role: "USER",
        isActive: false,
      },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    return user;
  }

  /**
   * Finds user by email.
   */
  static async findUserByEmail(email: string): Promise<{
    id: string;
    email: string;
    role: string;
    isActive: boolean;
  } | null> {
    return prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
      },
    });
  }

  /**
   * Finds user by email with MFA fields.
   */
  static async findUserByEmailWithMFA(email: string): Promise<{
    id: string;
    email: string;
    role: string;
    name: string | null;
    avatarUrl: string | null;
    twoFactorEnabled: boolean;
    twoFactorSecret: string | null;
  } | null> {
    return prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        avatarUrl: true,
        twoFactorEnabled: true,
        twoFactorSecret: true,
      },
    });
  }

  /**
   * Finds user by ID with complete profile.
   */
  static async findUserById(id: string): Promise<{
    id: string;
    email: string;
    role: string;
    name: string | null;
    avatarUrl: string | null;
    twoFactorEnabled: boolean;
    isActive: boolean;
  } | null> {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        avatarUrl: true,
        twoFactorEnabled: true,
        isActive: true,
      },
    });
  }

  /**
   * Validates user credentials and returns user info if valid.
   */
  static async validateCredentials(
    email: string,
    password: string,
  ): Promise<{
    id: string;
    email: string;
    role: string;
    isActive: boolean;
  } | null> {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
        isActive: true,
      },
    });

    if (!user) return null;

    const isValid = await comparePassword(password, user.password);
    if (!isValid) return null;

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    };
  }
}
