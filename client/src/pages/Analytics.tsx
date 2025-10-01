import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from "recharts";
import { useQuery } from '@tanstack/react-query';
import { fetchAnalyticsSummary } from '@/api/analytics';
import { useState } from 'react';

function formatCurrency(cents: number) {
  return (cents / 100).toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

export default function Analytics() {
  const [range, setRange] = useState<{ from?: string; to?: string }>({});
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['analytics-summary', range],
    queryFn: () => fetchAnalyticsSummary(range),
    staleTime: 60_000
  });

  const salesData = data?.monthlySales.map(m => ({ month: m.month.slice(5), sales: m.revenueCents / 100, orders: m.orders })) || [];
  const inventoryTurnover = data?.monthlyTurnover || [];
  const popularProducts = data?.popularProducts || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics & Reports</h1>
          <p className="text-muted-foreground">Analyze warehouse performance and business metrics.</p>
        </div>
        <div className="flex gap-2 items-center">
          {/* Simple date range inputs (can enhance later) */}
          <input
            type="date"
            className="border rounded px-2 py-1 bg-background"
            value={range.from || ''}
            onChange={e => setRange(r => ({ ...r, from: e.target.value || undefined }))}
          />
            <span className="text-muted-foreground">to</span>
          <input
            type="date"
            className="border rounded px-2 py-1 bg-background"
            value={range.to || ''}
            onChange={e => setRange(r => ({ ...r, to: e.target.value || undefined }))}
          />
          <button
            onClick={() => refetch()}
            className="px-3 py-1 rounded bg-primary text-primary-foreground text-sm disabled:opacity-50"
            disabled={isLoading}
          >Apply</button>
        </div>
      </div>

      {isError && (
        <div className="text-sm text-destructive">Failed to load analytics summary.</div>
      )}

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
              <p className="text-3xl font-bold text-primary-blue">{isLoading ? '…' : formatCurrency(data?.totalRevenueCents || 0)}</p>
              <p className="text-sm text-muted-foreground">All time{range.from || range.to ? ' (filtered)' : ''}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">Avg. Order Value</p>
              <p className="text-3xl font-bold text-warning">{isLoading ? '…' : formatCurrency(data?.averageOrderValueCents || 0)}</p>
              <p className="text-sm text-muted-foreground">Revenue / Orders</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">Inventory Turnover</p>
              <p className="text-3xl font-bold text-success">{isLoading ? '…' : (data?.inventoryTurnover?.toFixed(2) || '0')}</p>
              <p className="text-sm text-muted-foreground">Approximate</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">Low Stock Items</p>
              <p className="text-3xl font-bold text-info">{isLoading ? '…' : data?.inventory.lowStockCount}</p>
              <p className="text-sm text-muted-foreground">Qty ≤ 10</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Sales Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary-blue))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary-blue))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="hsl(var(--primary-blue))"
                  fill="url(#salesGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Popular Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Products (Units Sold)</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading && <div className="text-sm text-muted-foreground">Loading…</div>}
            {!isLoading && popularProducts.length === 0 && <div className="text-sm text-muted-foreground">No sales data yet.</div>}
            <ul className="space-y-2">
              {popularProducts.map(p => (
                <li key={p.id} className="flex justify-between text-sm">
                  <span className="truncate max-w-[60%]" title={p.name}>{p.name}</span>
                  <span className="text-muted-foreground">{p.quantitySold} ({p.percent}%)</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Inventory Turnover */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory Turnover Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={inventoryTurnover}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="turnover"
                  stroke="hsl(var(--success))"
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--success))", strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Order Volume */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Order Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="hsl(var(--warning))"
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--warning))", strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
