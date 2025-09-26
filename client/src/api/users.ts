import { axiosInstance } from './axiosInstance';
import { ApiResponse, User } from './auth';

export interface UserWithStats extends User {
  createdAt: string;
  updatedAt: string;
  name?: string;
  avatarUrl?: string;
  twoFactorEnabled?: boolean;
  _count: {
    items: number;
  };
}

export interface UserStats {
  totalUsers: number;
  adminCount: number;
  userCount: number;
  recentUsers: number;
}

export interface UpdateUserData {
  email?: string;
  role?: 'admin' | 'user';
  name?: string;
  avatarUrl?: string;
  twoFactorEnabled?: boolean;
}

export interface UpdatePasswordData {
  currentPassword: string;
  newPassword: string;
}

/**
 * Get all users (admin only)
 */
export async function fetchUsers(): Promise<UserWithStats[]> {
  const response = await axiosInstance.get<ApiResponse<{ users: UserWithStats[] }>>('/users');
  return response.data.data!.users;
}

/**
 * Get user by ID
 */
export async function fetchUserById(id: string): Promise<UserWithStats> {
  const response = await axiosInstance.get<ApiResponse<{ user: UserWithStats }>>(`/users/${id}`);
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
 * Toggle two-factor authentication
 */
export async function toggleTwoFactor(id: string, enabled: boolean): Promise<void> {
  await axiosInstance.put(`/users/${id}/twofactor`, { enabled });
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
