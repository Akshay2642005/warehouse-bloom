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
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
} 