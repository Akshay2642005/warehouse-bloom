import { axiosInstance } from './axiosInstance';
import type { ApiResponse, User, UserProfile, UserStats, UpdateUserData, UpdatePasswordData, TwoFactorSetup } from '@/types';

export type { UserProfile, UserStats, UpdateUserData, UpdatePasswordData };

/**
 * Get all users (admin only)
 */
export async function fetchUsers(): Promise<UserProfile[]> {
  const response = await axiosInstance.get<ApiResponse<{ users: UserProfile[] }>>('/users');
  return response.data.data!.users;
}

/**
 * Get user by ID
 */
export async function fetchUserById(id: string): Promise<UserProfile> {
  const response = await axiosInstance.get<ApiResponse<{ user: UserProfile }>>(`/users/${id}`);
  return response.data.data!.user;
}

/**
 * Update user profile
 */
export async function updateUserProfile(id: string, data: UpdateUserData): Promise<User> {
  const response = await axiosInstance.put<ApiResponse<{ user: User }>>(`/users/${id}`, data);
  return response.data.data!.user;
}

/**
 * Update user password
 */
export async function updateUserPassword(id: string, data: UpdatePasswordData): Promise<void> {
  await axiosInstance.put(`/users/${id}/password`, data);
}

/**
 * Setup two-factor authentication
 */
export async function setupTwoFactor(id: string): Promise<TwoFactorSetup> {
  const response = await axiosInstance.post<ApiResponse<TwoFactorSetup>>(`/users/${id}/2fa/setup`);
  return response.data.data!;
}

/**
 * Verify two-factor authentication
 */
export async function verifyTwoFactor(id: string, token: string): Promise<void> {
  await axiosInstance.post(`/users/${id}/2fa/verify`, { token });
}

/**
 * Disable two-factor authentication
 */
export async function disableTwoFactor(id: string): Promise<void> {
  await axiosInstance.delete(`/users/${id}/2fa`);
}

/**
 * Delete user (admin only)
 */
export async function deleteUser(id: string): Promise<void> {
  await axiosInstance.delete(`/users/${id}`);
}

/**
 * Get user statistics (admin only)
 */
export async function fetchUserStats(): Promise<UserStats> {
  const response = await axiosInstance.get<ApiResponse<UserStats>>('/users/stats');
  return response.data.data!;
}
