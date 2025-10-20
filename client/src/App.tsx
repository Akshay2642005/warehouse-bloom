import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { UserProvider, useUser } from "./contexts/UserContext";
import { ErrorBoundary } from "./components/ErrorBoundary";

// Pages & Layout
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Orders from "./pages/Orders";
import Shipping from "./pages/Shipping";
import Analytics from "./pages/Analytics";
import Alerts from "./pages/Alerts";
import Staff from "./pages/Staff";
import SettingsPage from "./pages/Settings";
import SystemStatus from "./pages/SystemStatus";
import NotFound from "./pages/NotFound";
import { Layout } from "./components/Layout";
import Profile from "./pages/Profile";
import Billing from "./pages/Billing";
import PaymentSuccess from "./pages/PaymentSuccess";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Global error handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  // In production, send to error tracking service
  if (import.meta.env.PROD) {
    // Example: Sentry.captureException(event.reason);
  }
});

function AppRoutes() {
  const { user, loading } = useUser();

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/success" element={<PaymentSuccess />} />

      {/* Protected routes */}
      <Route path="/dashboard" element={user ? <Layout><Dashboard /></Layout> : <Navigate to="/login" replace />} />
      <Route path="/inventory" element={user ? <Layout><Inventory /></Layout> : <Navigate to="/login" replace />} />
      <Route path="/orders" element={user ? <Layout><Orders /></Layout> : <Navigate to="/login" replace />} />
      <Route path="/shipping" element={user ? <Layout><Shipping /></Layout> : <Navigate to="/login" replace />} />
      <Route path="/analytics" element={<Layout><Analytics /></Layout>} />
      <Route path="/billing" element={user ? <Layout><Billing /></Layout> : <Navigate to="/login" replace />} />
      <Route path="/alerts" element={user ? <Layout><Alerts /></Layout> : <Navigate to="/login" replace />} />
      <Route path="/staff" element={user ? <Layout><Staff /></Layout> : <Navigate to="/login" replace />} />
      <Route path="/settings" element={user ? <Layout><SettingsPage /></Layout> : <Navigate to="/login" replace />} />
      <Route path="/profile" element={user ? <Layout><Profile /></Layout> : <Navigate to="/login" replace />} />
      <Route path="/status" element={user ? <Layout><SystemStatus /></Layout> : <Navigate to="/login" replace />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <TooltipProvider>
            <Toaster />
            <Sonner 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'hsl(var(--background))',
                  color: 'hsl(var(--foreground))',
                  border: '1px solid hsl(var(--border))',
                },
              }}
            />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </TooltipProvider>
        </ThemeProvider>
      </UserProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;

