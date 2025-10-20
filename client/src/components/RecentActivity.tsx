import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Truck, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { fetchDashboardActivities } from '@/api/dashboard';
import { Skeleton } from '@/components/ui/skeleton';

const iconMap: Record<string, any> = {
  order: CheckCircle,
  shipment: Truck,
  inventory: Package,
  alert: AlertTriangle,
  default: Info
};

function timeAgo(dateStr: string) {
  const date = new Date(dateStr);
  const diff = Date.now() - date.getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  return `${day}d ago`;
}

export function RecentActivity() {
  const { data = [], isLoading, isError, refetch, isFetching } = useQuery({ queryKey: ['dashboard-activities'], queryFn: fetchDashboardActivities, refetchInterval: 60_000 });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge variant="outline" className="border-success text-success">Success</Badge>;
      case "warning":
        return <Badge variant="outline" className="border-warning text-warning">Warning</Badge>;
      case "error":
        return <Badge variant="outline" className="border-destructive text-destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Info</Badge>;
    }
  };

  const getIconColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-success";
      case "warning":
        return "text-warning";
      case "error":
        return "text-destructive";
      default:
        return "text-primary-blue";
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center justify-between">
          <span>Recent Activity</span>
          <button onClick={() => refetch()} disabled={isFetching} className="text-xs underline text-muted-foreground hover:text-foreground disabled:opacity-50">Refresh</button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 flex-1 overflow-y-auto max-h-[400px]">
        {isLoading && (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
          </div>
        )}
        {isError && !isLoading && <p className="text-sm text-destructive">Failed to load activities.</p>}
        {!isLoading && !isError && data.length === 0 && <p className="text-sm text-muted-foreground">No recent activity.</p>}
        {!isLoading && !isError && data.map((activity) => {
          const Icon = iconMap[activity.type] || iconMap.default;
          return (
            <div key={activity.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div className={`rounded-full p-2 ${activity.status === 'success' ? 'bg-success/10' : 
                activity.status === 'warning' ? 'bg-warning/10' : 
                activity.status === 'error' ? 'bg-destructive/10' : 'bg-primary-blue/10'}`}>
                <Icon className={`h-4 w-4 ${getIconColor(activity.status)}`} />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">{activity.title}</p>
                  {getStatusBadge(activity.status)}
                </div>
                <p className="text-sm text-muted-foreground">{activity.description}</p>
                <p className="text-xs text-muted-foreground">{timeAgo(activity.createdAt)}</p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}