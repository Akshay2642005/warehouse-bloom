import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { TrendingUp, Package, DollarSign, ShoppingCart } from 'lucide-react';
import { axiosInstance } from '@/api/axiosInstance';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  isLoading?: boolean;
}

function MetricCard({ title, value, icon, description, isLoading }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {isLoading ? 'Loading...' : value}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

export function AnalyticsDashboard() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics-summary'],
    queryFn: async () => {
      const response = await axiosInstance.get('/analytics/summary');
      return response.data.data;
    }
  });

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Comprehensive insights into your warehouse operations
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Revenue"
          value={analytics ? formatCurrency(analytics.totalRevenueCents) : '$0.00'}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          description="Total payment amount received"
          isLoading={isLoading}
        />
        <MetricCard
          title="Total Orders"
          value={analytics?.totalOrders || 0}
          icon={<ShoppingCart className="h-4 w-4 text-muted-foreground" />}
          description="Orders processed this period"
          isLoading={isLoading}
        />
        <MetricCard
          title="Active Items"
          value={analytics?.inventory?.totalItems || 0}
          icon={<Package className="h-4 w-4 text-muted-foreground" />}
          description="Items currently in inventory"
          isLoading={isLoading}
        />
        <MetricCard
          title="Growth Rate"
          value="+12.5%"
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
          description="Compared to last month"
          isLoading={isLoading}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Sales</CardTitle>
            <CardDescription>Revenue trend over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {analytics?.monthlySales?.length > 0 ? (
                <div className="space-y-2">
                  {analytics.monthlySales.map((month: any) => (
                    <div key={month.month} className="flex justify-between items-center p-2 border rounded">
                      <span className="font-medium">{month.month}</span>
                      <div className="text-right">
                        <div className="font-bold">{formatCurrency(month.revenueCents)}</div>
                        <div className="text-sm text-muted-foreground">{month.orders} orders</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No sales data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Popular Products</CardTitle>
            <CardDescription>Best selling items</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {analytics?.popularProducts?.length > 0 ? (
                <div className="space-y-2">
                  {analytics.popularProducts.map((product: any) => (
                    <div key={product.id} className="flex justify-between items-center p-2 border rounded">
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground">{product.sku}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{product.quantitySold} sold</div>
                        <div className="text-sm text-muted-foreground">{product.percent.toFixed(1)}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No product data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}