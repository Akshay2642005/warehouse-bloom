import { axiosInstance } from './axiosInstance';

export interface User {
  id: string;
  email: string;
  role: string;
  name?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
  twoFactorEnabled: boolean;
}

export async function fetchUsers(): Promise<User[]> {
  const response = await axiosInstance.get('/users');
  return response.data.data.users;
}

export async function updateUserPassword(data: { currentPassword: string; newPassword: string }) {
  const response = await axiosInstance.put('/user/password', data);
  return response.data;
}

export async function updateUserProfile(data: { name?: string; email?: string }) {
  const response = await axiosInstance.put('/user/profile', data);
  return response.data;
}

export async function setupTwoFactor() {
  const response = await axiosInstance.post('/user/2fa/setup');
  return response.data.data;
}

export async function verifyTwoFactor(token: string) {
  const response = await axiosInstance.post('/user/2fa/verify', { token });
  return response.data;
}

export async function disableTwoFactor(userId: string) {
  const response = await axiosInstance.delete(`/user/2fa/disable`);
  return response.data;
}