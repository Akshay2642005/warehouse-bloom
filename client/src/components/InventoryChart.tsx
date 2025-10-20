import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useQuery } from '@tanstack/react-query';
import { fetchInventoryCategoryChart } from '@/api/dashboard';
import { Skeleton } from '@/components/ui/skeleton';

export function InventoryChart() {
  const { data = [], isLoading, isError } = useQuery({ queryKey: ['inventory-category-chart'], queryFn: fetchInventoryCategoryChart, staleTime: 60_000 });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Inventory by Category</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-64 w-full" />
          </div>
        )}
        {isError && !isLoading && (
          <p className="text-sm text-destructive">Failed to load chart data.</p>
        )}
        {!isLoading && !isError && data.length === 0 && (
          <p className="text-sm text-muted-foreground">No inventory data available.</p>
        )}
        {!isLoading && !isError && data.length > 0 && (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="inStock" stackId="a" fill="hsl(var(--primary-blue))" name="In Stock" />
              <Bar dataKey="lowStock" stackId="a" fill="hsl(var(--warning))" name="Low Stock" />
              <Bar dataKey="outOfStock" stackId="a" fill="hsl(var(--destructive))" name="Out of Stock" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}