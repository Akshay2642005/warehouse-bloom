import { axiosInstance } from './axiosInstance';

export interface RegisterPayload { email: string; password: string }
export interface LoginPayload { email: string; password: string }
export interface User { id: string; email: string; role: string }

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string> | string;
}

/**
 * Registers a new user with the backend.
 */
export async function registerUser(data: RegisterPayload): Promise<User> {
  const response = await axiosInstance.post<ApiResponse<{ user: User }>>('/auth/register', data);
  return response.data.data!.user;
}

/**
 * Logs in a user and returns user + token.
 */
export async function loginUser(data: LoginPayload): Promise<{ user: User; token: string }> {
  const response = await axiosInstance.post<ApiResponse<{ user: User; token: string }>>('/auth/login', data);
  return response.data.data!;
}

/**
 * Logs out the current user.
 */
export async function logoutUser(): Promise<void> {
  await axiosInstance.post('/auth/logout');
  localStorage.removeItem('user');
}

/**
 * Gets the current authenticated user from backend.
 * Returns user data if authenticated, null otherwise.
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await axiosInstance.get<ApiResponse<{ user: User }>>('/auth/me');
    return response.data.data?.user || null;
  } catch (error: any) {
    if (error.response?.status !== 401) {
      console.error('getCurrentUser error:', error);
    }
    return null;
  }
}

