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

export async function updateUserPassword(data: { currentPassword: string; newPassword: string; confirmPassword?: string }) {
  const response = await axiosInstance.put('/user/password', data);
  return response.data; // { success, message }
}

export async function updateUserProfile(data: { name?: string; email?: string; avatarUrl?: string; confirmEmail?: string }) {
  const response = await axiosInstance.put('/user/profile', data);
  return response.data; // return full response including data.user
}

export async function setupTwoFactor() {
  const response = await axiosInstance.post('/user/2fa/setup');
  return response.data.data; // includes secret, qrCode, backupCodes (not persisted yet)
}

export async function verifyTwoFactor(token: string) {
  const response = await axiosInstance.post('/user/2fa/verify', { token });
  return response.data;
}

export async function disableTwoFactor(userId: string) {
  const response = await axiosInstance.delete(`/user/2fa/disable`);
  return response.data;
}