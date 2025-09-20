import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Server, Database, Zap, Users, Package } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { fetchSystemStatus, fetchSystemMetrics } from '@/api/status';

export default function SystemStatus() {
  const { data: status, isLoading: statusLoading, refetch: refetchStatus } = useQuery({
    queryKey: ['system-status'],
    queryFn: fetchSystemStatus,
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const { data: metrics, isLoading: metricsLoading, refetch: refetchMetrics } = useQuery({
    queryKey: ['system-metrics'],
    queryFn: fetchSystemMetrics,
    refetchInterval: 60000 // Refresh every minute
  });

  const handleRefresh = () => {
    refetchStatus();
    refetchMetrics();
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Status</h1>
          <p className="text-muted-foreground">Monitor system health and performance</p>
        </div>
        <Button onClick={handleRefresh} disabled={statusLoading || metricsLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${(statusLoading || metricsLoading) ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* System Health */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Badge variant={status?.status === 'healthy' ? 'default' : 'destructive'}>
                {statusLoading ? 'Loading...' : status?.status || 'Unknown'}
              </Badge>
              {status && (
                <span className="text-xs text-muted-foreground">
                  {status.responseTime}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {status ? `Uptime: ${formatUptime(status.uptime)}` : 'Checking...'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Badge variant={status?.services.database.status === 'connected' ? 'default' : 'destructive'}>
                {statusLoading ? 'Loading...' : status?.services.database.status || 'Unknown'}
              </Badge>
              {status && (
                <span className="text-xs text-muted-foreground">
                  {status.services.database.latency}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Redis Cache</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Badge variant={status?.services.redis.status === 'connected' ? 'default' : 'destructive'}>
                {statusLoading ? 'Loading...' : status?.services.redis.status || 'Unknown'}
              </Badge>
              {status && (
                <span className="text-xs text-muted-foreground">
                  {status.services.redis.latency}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Environment</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statusLoading ? 'Loading...' : status?.environment || 'Unknown'}
            </div>
            <p className="text-xs text-muted-foreground">
              {status ? `v${status.version}` : 'Version unknown'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* System Metrics */}
      {metrics && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                User Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Total Users:</span>
                <span className="font-medium">{metrics.database.users.total}</span>
              </div>
              {Object.entries(metrics.database.users.byRole).map(([role, count]) => (
                <div key={role} className="flex justify-between">
                  <span className="capitalize">{role}s:</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Inventory Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Total Items:</span>
                <span className="font-medium">{metrics.database.items.total}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Quantity:</span>
                <span className="font-medium">{metrics.database.items.totalQuantity.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Value:</span>
                <span className="font-medium">{formatCurrency(metrics.database.items.totalValue)}</span>
              </div>
              <div className="flex justify-between">
                <span>Low Stock Items:</span>
                <span className="font-medium text-orange-600">{metrics.database.items.lowStockItems}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* System Information */}
      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-sm font-medium">Node.js Version</p>
                <p className="text-sm text-muted-foreground">{metrics.system.nodeVersion}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Platform</p>
                <p className="text-sm text-muted-foreground">{metrics.system.platform} ({metrics.system.arch})</p>
              </div>
              <div>
                <p className="text-sm font-medium">Memory Usage</p>
                <p className="text-sm text-muted-foreground">{metrics.system.memory.used} / {metrics.system.memory.total}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Uptime</p>
                <p className="text-sm text-muted-foreground">{formatUptime(metrics.system.uptime)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
