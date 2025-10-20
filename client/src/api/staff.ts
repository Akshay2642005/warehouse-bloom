import { axiosInstance } from './axiosInstance';

export interface StaffUserSummary {
  id: string;
  email: string;
  role: string;
  name?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
  twoFactorEnabled: boolean;
  active?: boolean;
}

export interface Invitation {
  id: string;
  email: string;
  role: string;
  token: string;
  accepted: boolean;
  expiresAt: string;
  createdAt: string;
}

export async function inviteStaff(email: string, role: string) {
  const res = await axiosInstance.post('/invitations', { email, role });
  return res.data.data.invitation as Invitation;
}

export async function listInvitations(): Promise<Invitation[]> {
  const res = await axiosInstance.get('/invitations');
  return res.data.data.invitations;
}

export async function acceptInvitation(token: string) {
  const res = await axiosInstance.post('/invitations/accept', { token });
  return res.data.data as { email: string; role: string };
}

export async function updateStaffRole(userId: string, role: string) {
  const res = await axiosInstance.put(`/user/${userId}`, { role });
  return res.data.data.user as StaffUserSummary;
}

export async function deactivateStaff(userId: string) {
  // Soft deactivate not implemented; placeholder for future active flag
  return { userId };
}

export async function deleteStaff(userId: string) {
  await axiosInstance.delete(`/user/${userId}`);
  return { userId };
}