import axios from 'axios';
import { useOrganizationStore } from '../stores/organization.store';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add organization ID header
apiClient.interceptors.request.use((config) => {
  const orgId = useOrganizationStore.getState().activeOrgId;
  if (orgId) {
    config.headers['X-Organization-Id'] = orgId;
  }
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login or clear session
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
