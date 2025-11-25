import { authClient } from "@/lib/auth";
import type { User, ApiResponse, LoginFormData, RegisterFormData } from "@/types";

export type { User, ApiResponse };

/**
 * Registers a new user using better-auth client SDK
 */
export async function registerUser(data: RegisterFormData): Promise<User> {
  const response = await authClient.signUp.email({
    email: data.email,
    password: data.password,
    name: data.email.split('@')[0], // Use email username as default name
  });

  if (response.error) {
    throw new Error(response.error.message || "Registration failed");
  }

  // Map better-auth user to our User type
  const betterAuthUser = response.data!.user;
  return {
    id: betterAuthUser.id,
    email: betterAuthUser.email,
    name: betterAuthUser.name,
    role: 'user', // Default role for new users
    emailVerified: betterAuthUser.emailVerified,
    createdAt: betterAuthUser.createdAt.toISOString(),
    updatedAt: betterAuthUser.updatedAt.toISOString(),
  } as User;
}

/**
 * Logs in a user using better-auth client SDK
 */
export async function loginUser(
  data: LoginFormData,
): Promise<{ user: User }> {
  const response = await authClient.signIn.email({
    email: data.email,
    password: data.password,
  });

  if (response.error) {
    throw new Error(response.error.message || "Login failed");
  }

  // Map better-auth user to our User type
  const betterAuthUser = response.data!.user;
  return {
    user: {
      id: betterAuthUser.id,
      email: betterAuthUser.email,
      name: betterAuthUser.name,
      role: 'user', // You may need to extend the better-auth user model to include role
      emailVerified: betterAuthUser.emailVerified,
      createdAt: betterAuthUser.createdAt.toISOString(),
      updatedAt: betterAuthUser.updatedAt.toISOString(),
    } as User,
  };
}

/**
 * Logs out the current user using better-auth client SDK
 */
export async function logoutUser(): Promise<void> {
  await authClient.signOut();
}

/**
 * Gets the current authenticated user from better-auth session
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data } = await authClient.getSession();
    if (!data?.user) return null;

    const betterAuthUser = data.user;
    return {
      id: betterAuthUser.id,
      email: betterAuthUser.email,
      name: betterAuthUser.name,
      role: 'user', // You may need to extend the better-auth user model to include role
      emailVerified: betterAuthUser.emailVerified,
      createdAt: betterAuthUser.createdAt.toISOString(),
      updatedAt: betterAuthUser.updatedAt.toISOString(),
    } as User;
  } catch (error) {
    console.error("getCurrentUser error:", error);
    return null;
  }
}
