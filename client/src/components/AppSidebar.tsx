import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Package,
  BarChart3,
  ShoppingCart,
  Users,
  Settings,
  Truck,
  AlertTriangle,
  TrendingUp,
  Warehouse,
  Activity
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@/contexts/UserContext";

const navigationItems = [
  { title: "Dashboard", url: "/dashboard", icon: BarChart3 },
  { title: "Inventory", url: "/inventory", icon: Package },
  { title: "Orders", url: "/orders", icon: ShoppingCart },
  { title: "Shipping", url: "/shipping", icon: Truck },
  { title: "Analytics", url: "/analytics", icon: TrendingUp },
  { title: "Alerts", url: "/alerts", icon: AlertTriangle },
  { title: "Staff", url: "/staff", icon: Users },
  { title: "System Status", url: "/status", icon: Activity },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";
  const navigate = useNavigate();
  const { user } = useUser();

  const isActive = (path: string) => currentPath === path;
  const getNavClasses = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "bg-primary-blue text-white font-medium hover:bg-primary-blue-dark"
      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground";

  const initials = user?.name && user.name.trim() ? user.name.trim().slice(0, 2).toUpperCase() : (user?.email || 'U').slice(0, 2).toUpperCase();
  const displayName = user?.name || user?.email || 'User';

  return (
    <Sidebar
      className={collapsed ? "w-16" : "w-64"}
      collapsible="icon"
    >
      <SidebarContent className="bg-card border-r">
        {/* Logo Section */}
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-blue text-white">
              <Warehouse className="h-6 w-6" />
            </div>
            {!collapsed && (
              <div>
                <h2 className="text-lg font-semibold text-foreground">WarehouseHub</h2>
                <p className="text-xs text-muted-foreground">Inventory Management</p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
            Main Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="px-3">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${getNavClasses({ isActive })}`
                      }
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && <span className="font-medium">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User Profile Section */}
        {!collapsed && (
          <div className="mt-auto p-6 border-t" key={`${user?.id}-${user?.name}-${user?.email}`}>
            <button className="w-full" onClick={() => navigate('/profile')}>
              <div className="flex items-center gap-3 text-left">
                <Avatar className="h-10 w-10">
                  {user?.avatarUrl && <AvatarImage src={user.avatarUrl} alt={displayName} />}
                  <AvatarFallback className="bg-primary-blue text-white font-medium">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
              </div>
            </button>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}