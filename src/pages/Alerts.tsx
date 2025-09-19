import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, XCircle, Clock } from "lucide-react";

const alertsData = [
  {
    id: "ALT-001",
    type: "Low Stock",
    title: "Critical Stock Level",
    description: "Gaming Keyboard (SKU-002) has only 6 units left",
    severity: "High",
    timestamp: "2024-01-15 14:30",
    status: "Active"
  },
  {
    id: "ALT-002",
    type: "Temperature",
    title: "Temperature Alert",
    description: "Warehouse Zone A temperature is 28°C (above 25°C threshold)",
    severity: "Medium",
    timestamp: "2024-01-15 13:45",
    status: "Acknowledged"
  },
  {
    id: "ALT-003",
    type: "Security",
    title: "Unauthorized Access",
    description: "Door sensor triggered in Zone B after hours",
    severity: "High",
    timestamp: "2024-01-15 02:15",
    status: "Resolved"
  },
  {
    id: "ALT-004",
    type: "System",
    title: "Backup Complete",
    description: "Daily system backup completed successfully",
    severity: "Low",
    timestamp: "2024-01-15 01:00",
    status: "Resolved"
  }
];

export default function Alerts() {
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "High":
        return <Badge className="bg-destructive text-destructive-foreground">High</Badge>;
      case "Medium":
        return <Badge className="bg-warning text-warning-foreground">Medium</Badge>;
      case "Low":
        return <Badge className="bg-muted text-muted-foreground">Low</Badge>;
      default:
        return <Badge variant="outline">Normal</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Active":
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case "Acknowledged":
        return <Clock className="h-4 w-4 text-warning" />;
      case "Resolved":
        return <CheckCircle className="h-4 w-4 text-success" />;
      default:
        return <XCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <Badge variant="outline" className="border-destructive text-destructive bg-destructive/10">Active</Badge>;
      case "Acknowledged":
        return <Badge variant="outline" className="border-warning text-warning bg-warning/10">Acknowledged</Badge>;
      case "Resolved":
        return <Badge variant="outline" className="border-success text-success bg-success/10">Resolved</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <Layout>
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Alerts & Notifications</h1>
        <p className="text-muted-foreground">Monitor system alerts and warehouse notifications.</p>
      </div>

      {/* Alert Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Alerts</p>
                <p className="text-2xl font-bold text-destructive">3</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Priority</p>
                <p className="text-2xl font-bold text-destructive">2</p>
              </div>
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Acknowledged</p>
                <p className="text-2xl font-bold text-warning">1</p>
              </div>
              <Clock className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Resolved Today</p>
                <p className="text-2xl font-bold text-success">5</p>
              </div>
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alertsData.map((alert) => (
              <div key={alert.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex-shrink-0 mt-1">
                  {getStatusIcon(alert.status)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-foreground">{alert.title}</h4>
                    <div className="flex items-center gap-2">
                      {getSeverityBadge(alert.severity)}
                      {getStatusBadge(alert.status)}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{alert.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>ID: {alert.id}</span>
                      <span>Type: {alert.type}</span>
                      <span>{alert.timestamp}</span>
                    </div>
                    <div className="flex gap-2">
                      {alert.status === "Active" && (
                        <>
                          <Button variant="outline" size="sm">
                            Acknowledge
                          </Button>
                          <Button variant="outline" size="sm">
                            Resolve
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
    </Layout>
  );
}