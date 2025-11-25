import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Organization } from '@/types';

interface OrganizationStore {
  activeOrgId: string | null;
  organizations: Organization[];
  setActiveOrg: (orgId: string) => void;
  setOrganizations: (orgs: Organization[]) => void;
  clearOrganizations: () => void;
}

export const useOrganizationStore = create<OrganizationStore>()(
  persist(
    (set) => ({
      activeOrgId: null,
      organizations: [],
      setActiveOrg: (orgId) => set({ activeOrgId: orgId }),
      setOrganizations: (orgs) => set({ organizations: orgs }),
      clearOrganizations: () => set({ activeOrgId: null, organizations: [] }),
    }),
    {
      name: 'organization-store',
    }
  )
);
