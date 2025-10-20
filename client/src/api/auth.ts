import { axiosInstance } from "./axiosInstance";
import type { User, ApiResponse, LoginFormData, RegisterFormData } from "@/types";

export type { User, ApiResponse };

/**
 * Registers a new user with the backend.
 */
export async function registerUser(data: RegisterFormData): Promise<{ user: User; payment?: { checkoutId: string; checkoutUrl: string; amount: number } }> {
  const response = await axiosInstance.post<ApiResponse<{ user: User; payment?: { checkoutId: string; checkoutUrl: string; amount: number } }>>(
    "/auth/register",
    data,
  );
  return response.data.data!;
}

/**
 * Logs in a user and returns user + token.
 */
export async function loginUser(
  data: LoginFormData,
): Promise<{ user: User; token: string }> {
  const response = await axiosInstance.post<
    ApiResponse<{ user: User; token: string }>
  >("/auth/login", data);
  return response.data.data!;
}

/**
 * Verify MFA token during login
 */
export async function verifyMFALogin(email: string, token: string): Promise<{ user: User; token: string }> {
  const response = await axiosInstance.post<ApiResponse<{ user: User; token: string }>>("/auth/verify-mfa", { email, token });
  return response.data.data!;
}

/**
 * Logs out the current user.
 */
export async function logoutUser(): Promise<void> {
  await axiosInstance.post("/auth/logout");
  localStorage.removeItem("user");
}

/**
 * Gets the current authenticated user from backend.
 * Returns user data if authenticated, null otherwise.
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const response =
      await axiosInstance.get<ApiResponse<{ user: User }>>("/auth/me");
    return response.data.data?.user || null;
  } catch (error: unknown) {
    if (error.response?.status !== 401) {
      console.error("getCurrentUser error:", error);
    }
    return null;
  }
}
