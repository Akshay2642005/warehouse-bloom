import { Package, TrendingUp, AlertTriangle, DollarSign } from "lucide-react";
import { StatsCard } from "@/components/StatsCard";
import { RecentActivity } from "@/components/RecentActivity";
import { InventoryChart } from "@/components/InventoryChart";
import { ProductTable } from "@/components/ProductTable";
import { useQuery } from '@tanstack/react-query';
import { fetchDashboardStats } from '@/api/dashboard';
import { useOrganizationStore } from '@/stores/organization.store';

export default function Dashboard() {
  const { activeOrgId } = useOrganizationStore();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats', activeOrgId],
    queryFn: async () => {
      if (!activeOrgId) return null;
      return fetchDashboardStats();
    },
    enabled: !!activeOrgId
  });

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening in your warehouse.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Products"
          value={isLoading ? "Loading..." : stats?.totalItems.toString() || "0"}
          change="Real-time data"
          changeType="increase"
          icon={Package}
          iconColor="blue"
        />
        <StatsCard
          title="Low Stock Items"
          value={isLoading ? "Loading..." : stats?.lowStockCount.toString() || "0"}
          change="Needs attention"
          changeType={stats?.lowStockCount && stats.lowStockCount > 0 ? "decrease" : "increase"}
          icon={AlertTriangle}
          iconColor="orange"
        />
        <StatsCard
          title="Total Inventory Value"
          value={isLoading ? "Loading..." : formatCurrency(stats?.totalValue || 0)}
          change="Current valuation"
          changeType="increase"
          icon={DollarSign}
          iconColor="green"
        />
        <StatsCard
          title="Active Items"
          value={isLoading ? "Loading..." : ((stats?.totalItems || 0) - (stats?.lowStockCount || 0)).toString()}
          change="In good stock"
          changeType="increase"
          icon={TrendingUp}
          iconColor="blue"
        />
      </div>

      {/* Charts and Tables */}
      <div className="grid gap-6 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <InventoryChart />
        </div>
        <div className="lg:col-span-3">
          <RecentActivity />
        </div>
      </div>

      {/* Product Table */}
      <ProductTable />
    </div>
  );
}