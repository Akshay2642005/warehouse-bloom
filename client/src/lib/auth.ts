import { createAuthClient } from "better-auth/react";
import { organizationClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: (import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api") + "/auth",
  plugins: [organizationClient()],
});

// Export auth hooks
export const { useSession } = authClient;

// Export organization hooks from the client
export const useActiveOrganization = authClient.useActiveOrganization;
export const useListOrganizations = authClient.useListOrganizations;

// Export auth actions
export const signIn = authClient.signIn.email;
export const signUp = authClient.signUp.email;
export const signOut = authClient.signOut;

// Organization actions (you'll call these directly from authClient)
export const createOrganization = authClient.organization.create;
export const updateOrganization = authClient.organization.update;
export const setActiveOrganization = authClient.organization.setActive;

