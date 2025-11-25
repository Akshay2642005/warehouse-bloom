import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Truck, AlertTriangle, CheckCircle } from "lucide-react";

const activities = [
  {
    id: 1,
    type: "shipment",
    icon: Truck,
    title: "Shipment Delivered",
    description: "Order #12345 delivered to Customer ABC",
    time: "2 hours ago",
    status: "success"
  },
  {
    id: 2,
    type: "inventory",
    icon: Package,
    title: "Low Stock Alert",
    description: "Product SKU-001 is running low (5 units left)",
    time: "3 hours ago",
    status: "warning"
  },
  {
    id: 3,
    type: "order",
    icon: CheckCircle,
    title: "Order Processed",
    description: "Order #12346 has been processed and ready for shipping",
    time: "5 hours ago",
    status: "success"
  },
  {
    id: 4,
    type: "alert",
    icon: AlertTriangle,
    title: "Temperature Alert",
    description: "Warehouse Zone A temperature above threshold",
    time: "6 hours ago",
    status: "error"
  }
];

export function RecentActivity() {
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
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
            <div className={`rounded-full p-2 ${activity.status === 'success' ? 'bg-success/10' :
              activity.status === 'warning' ? 'bg-warning/10' :
                activity.status === 'error' ? 'bg-destructive/10' : 'bg-primary-blue/10'}`}>
              <activity.icon className={`h-4 w-4 ${getIconColor(activity.status)}`} />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">{activity.title}</p>
                {getStatusBadge(activity.status)}
              </div>
              <p className="text-sm text-muted-foreground">{activity.description}</p>
              <p className="text-xs text-muted-foreground">{activity.time}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}