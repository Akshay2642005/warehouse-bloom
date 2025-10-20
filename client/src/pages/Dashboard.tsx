import { Package, TrendingUp, AlertTriangle, DollarSign, CreditCard } from "lucide-react";
import { StatsCard } from "@/components/StatsCard";
import { RecentActivity } from "@/components/RecentActivity";
import { InventoryChart } from "@/components/InventoryChart";
import { ProductTable } from "@/components/ProductTable";
import { useQuery } from '@tanstack/react-query';
import { fetchDashboardStats } from '@/api/dashboard';

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats
  });

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening in your warehouse.</p>
        </div>
        <a href="/billing" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
          <CreditCard className="w-4 h-4" />
          Manage Billing
        </a>
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
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 h-full">
          <InventoryChart />
        </div>
        <div className="h-full">
          <RecentActivity />
        </div>
      </div>

      {/* Product Table */}
      <ProductTable />
    </div>
  );
}