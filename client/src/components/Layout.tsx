import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { RealTimeAlerts } from "@/components/RealTimeAlerts";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useMutation } from '@tanstack/react-query';
import { logoutUser } from '@/api/auth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/UserContext'; // your context hook
import { useOrganizationStore } from '@/stores/organization.store';
import { fetchUserOrganizations } from '@/api/organizations';
import { useEffect } from "react";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, setUser } = useUser(); // access user context
  const { activeOrgId, setActiveOrg, setOrganizations } = useOrganizationStore();

  useEffect(() => {
    const loadOrgs = async () => {
      try {
        const orgs = await fetchUserOrganizations();
        setOrganizations(orgs);
        if (!activeOrgId && orgs.length > 0) {
          setActiveOrg(orgs[0].id);
        }
      } catch (error) {
        console.error("Failed to load organizations", error);
      }
    };
    if (user) {
      loadOrgs();
    }
  }, [user, activeOrgId, setActiveOrg, setOrganizations]);

  const logoutMutation = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      // Clear local storage and context
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      setUser(null);
      useOrganizationStore.getState().clearOrganizations();

      toast({ title: "Success", description: "Logged out successfully" });
      navigate('/', { replace: true });
    },
    onError: () => {
      // Ensure logout even if API call fails
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      setUser(null);
      navigate('/', { replace: true });
    }
  });

  const handleLogout = () => logoutMutation.mutate();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar key={`sidebar-${user?.id}-${user?.name}-${user?.email}`} />
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 flex items-center justify-between border-b bg-card px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
              <h2 className="text-lg font-semibold text-foreground">Warehouse Management</h2>
            </div>
            <div className="flex items-center gap-4">
              <RealTimeAlerts />
              <ThemeToggle />
              <div className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
              >
                <LogOut className="h-4 w-4 mr-2" />
                {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
              </Button>
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

