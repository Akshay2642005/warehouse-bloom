import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { useQueryClient } from '@tanstack/react-query';
import { getCurrentUser } from "../api/auth";
import { authClient } from "@/lib/auth";
import { useOrganizationStore } from "@/stores/organization.store";
import type { User } from "@/types";

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { setActiveOrg } = useOrganizationStore();

  useEffect(() => {
    // Try to get user from localStorage first
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch {
        localStorage.removeItem('user');
      }
    }

    // Then verify with server and get latest data
    getCurrentUser()
      .then(async (userData) => {
        if (userData) {
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));

          // Also fetch and set active organization from better-auth session
          try {
            const { data: sessionData } = await authClient.getSession();
            if (sessionData?.session?.activeOrganizationId) {
              setActiveOrg(sessionData.session.activeOrganizationId);
            }
          } catch (error) {
            console.error('Failed to load active organization:', error);
          }
        } else {
          setUser(null);
          localStorage.removeItem('user');
        }
      })
      .catch(() => {
        setUser(null);
        localStorage.removeItem('user');
      })
      .finally(() => setLoading(false));
  }, [setActiveOrg]);

  const queryClient = useQueryClient();

  const updateUser = (userData: User | null) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
    } else {
      localStorage.removeItem('user');
      // Clear all cached data on logout
      queryClient.clear();
    }
  };

  const refreshUser = async () => {
    try {
      const userData = await getCurrentUser();
      if (userData) {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        setUser(null);
        localStorage.removeItem('user');
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  };

  const value: UserContextType = { user, setUser: updateUser, loading, refreshUser };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
