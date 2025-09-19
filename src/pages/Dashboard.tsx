import { Package, TrendingUp, AlertTriangle, Truck } from "lucide-react";
import { StatsCard } from "@/components/StatsCard";
import { RecentActivity } from "@/components/RecentActivity";
import { InventoryChart } from "@/components/InventoryChart";
import { ProductTable } from "@/components/ProductTable";

export default function Dashboard() {
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
          value="1,247"
          change="+12% from last month"
          changeType="increase"
          icon={Package}
          iconColor="blue"
        />
        <StatsCard
          title="Low Stock Items"
          value="23"
          change="+5 from yesterday"
          changeType="decrease"
          icon={AlertTriangle}
          iconColor="orange"
        />
        <StatsCard
          title="Orders Pending"
          value="156"
          change="-8% from last week"
          changeType="decrease"
          icon={Truck}
          iconColor="green"
        />
        <StatsCard
          title="Monthly Revenue"
          value="$48,290"
          change="+18% from last month"
          changeType="increase"
          icon={TrendingUp}
          iconColor="blue"
        />
      </div>

      {/* Charts and Tables */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <InventoryChart />
        </div>
        <div>
          <RecentActivity />
        </div>
      </div>

      {/* Product Table */}
      <ProductTable />
    </div>
  );
}