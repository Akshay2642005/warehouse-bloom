import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useMutation } from '@tanstack/react-query';
import { logoutUser } from '@/api/auth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const logoutMutation = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      toast({ title: "Success", description: "Logged out successfully" });
      navigate('/');
    },
    onError: () => {
      // Clear local storage even if API call fails
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      navigate('/');
    }
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 flex items-center justify-between border-b bg-card px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
              <div>
                <h2 className="text-lg font-semibold text-foreground">Warehouse Management</h2>
              </div>
            </div>
            <div className="flex items-center gap-4">
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

          {/* Main Content */}
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}