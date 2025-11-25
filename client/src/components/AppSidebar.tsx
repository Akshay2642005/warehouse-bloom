import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Package,
  BarChart3,
  ShoppingCart,
  Users,
  Truck,
  AlertTriangle,
  TrendingUp,
  Warehouse,
  Activity,
  ChevronsUpDown,
  LogOut,
  CreditCard,
  User,
  Building,
  Settings
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
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@/contexts/UserContext";
import { useOrganizationStore } from "@/stores/organization.store";

const navigationItems = [
  { title: "Dashboard", url: "/dashboard", icon: BarChart3 },
  { title: "Inventory", url: "/inventory", icon: Package },
  { title: "Orders", url: "/orders", icon: ShoppingCart },
  { title: "Shipping", url: "/shipping", icon: Truck },
  { title: "Analytics", url: "/analytics", icon: TrendingUp },
  { title: "Alerts", url: "/alerts", icon: AlertTriangle },
  { title: "Staff", url: "/staff", icon: Users },
  { title: "System Status", url: "/status", icon: Activity },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";
  const navigate = useNavigate();
  const { user } = useUser();
  const { activeOrgId, organizations } = useOrganizationStore();

  const activeOrg = organizations.find(o => o.id === activeOrgId);

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
      <SidebarContent className="bg-card border-r flex flex-col h-full">
        {/* Logo Section */}
        <div className={`border-b flex items-center ${collapsed ? 'p-3 justify-center' : 'p-6'}`}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-blue text-white flex-shrink-0">
              <Warehouse className="h-6 w-6" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-foreground truncate">WarehouseHub</h2>
                <p className="text-xs text-muted-foreground truncate">Inventory Management</p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup className="flex-1">
          {!collapsed && (
            <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
              Main Navigation
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className={collapsed ? "px-2 items-center" : "px-3"}>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title} className={collapsed ? 'justify-center' : ''}>
                    <NavLink
                      to={item.url}
                      end
                      className={({ isActive }) =>
                        `flex items-center gap-3 py-2.5 rounded-lg transition-colors ${getNavClasses({ isActive })} ${collapsed ? 'justify-center px-2' : 'px-3'}`
                      }
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && <span className="font-medium truncate">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User Profile Section */}
        <div className={`border-t mt-auto ${collapsed ? 'p-2' : 'p-4'}`}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={`flex items-center gap-3 w-full rounded-lg hover:bg-sidebar-accent transition-colors group ${collapsed ? 'justify-center p-2' : 'p-2 text-left'}`}>
                <Avatar className="h-9 w-9 flex-shrink-0">
                  <AvatarImage src={user?.image} alt={displayName} />
                  <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground font-medium">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                {!collapsed && (
                  <>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-sidebar-foreground group-hover:text-sidebar-accent-foreground transition-colors truncate">{displayName}</p>
                      <p className="text-xs text-sidebar-foreground/60 truncate">{activeOrg?.name || 'Select Org'}</p>
                    </div>
                    <ChevronsUpDown className="h-4 w-4 text-sidebar-foreground/50 group-hover:text-sidebar-foreground transition-colors flex-shrink-0" />
                  </>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" side="right">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/organization')}>
                  <Building className="mr-2 h-4 w-4" />
                  <span>Organization Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/billing')}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  <span>Billing</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => {
                // Add logout logic here if needed, or redirect
                window.location.href = '/login';
              }}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}