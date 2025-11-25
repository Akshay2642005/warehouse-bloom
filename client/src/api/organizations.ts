import apiClient from '@/lib/axios';
import { Organization, Member, Invitation } from '@/types';

export const fetchUserOrganizations = async (): Promise<Organization[]> => {
  const { data } = await apiClient.get('/organizations');
  return data.data;
};

export const fetchOrganization = async (id: string): Promise<Organization> => {
  const { data } = await apiClient.get(`/organizations/${id}`);
  return data.data;
};

export const createOrganization = async (data: Partial<Organization>): Promise<Organization> => {
  const { data: response } = await apiClient.post('/organizations', data);
  return response.data;
};

export const fetchOrganizationMembers = async (orgId: string): Promise<Member[]> => {
  const { data } = await apiClient.get(`/organizations/${orgId}/members`);
  return data.data;
};

export const inviteMember = async (orgId: string, email: string, role: string): Promise<Invitation> => {
  const { data } = await apiClient.post(`/organizations/${orgId}/invitations`, { email, role });
  return data.data;
};
