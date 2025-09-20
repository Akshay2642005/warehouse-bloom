// src/App.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { UserProvider, useUser } from "./contexts/UserContext";

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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false
    }
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
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected routes */}
      <Route path="/dashboard" element={user ? <Layout><Dashboard /></Layout> : <Navigate to="/login" replace />} />
      <Route path="/inventory" element={user ? <Layout><Inventory /></Layout> : <Navigate to="/login" replace />} />
      <Route path="/orders" element={user ? <Layout><Orders /></Layout> : <Navigate to="/login" replace />} />
      <Route path="/shipping" element={user ? <Layout><Shipping /></Layout> : <Navigate to="/login" replace />} />
      <Route path="/analytics" element={user ? <Layout><Analytics /></Layout> : <Navigate to="/login" replace />} />
      <Route path="/alerts" element={user ? <Layout><Alerts /></Layout> : <Navigate to="/login" replace />} />
      <Route path="/staff" element={user ? <Layout><Staff /></Layout> : <Navigate to="/login" replace />} />
      <Route path="/settings" element={user ? <Layout><SettingsPage /></Layout> : <Navigate to="/login" replace />} />
      <Route path="/status" element={user ? <Layout><SystemStatus /></Layout> : <Navigate to="/login" replace />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <UserProvider>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </UserProvider>
);

export default App;

