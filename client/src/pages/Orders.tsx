import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Eye, Package, Truck } from "lucide-react";

const ordersData = [
  {
    id: "ORD-001",
    customer: "Tech Solutions Inc.",
    items: 5,
    total: "$1,250.00",
    status: "Processing",
    priority: "High",
    orderDate: "2024-01-15",
    dueDate: "2024-01-17"
  },
  {
    id: "ORD-002",
    customer: "Digital Marketing Co.",
    items: 3,
    total: "$850.00",
    status: "Shipped",
    priority: "Medium",
    orderDate: "2024-01-14",
    dueDate: "2024-01-16"
  },
  {
    id: "ORD-003",
    customer: "StartupXYZ",
    items: 12,
    total: "$3,200.00",
    status: "Pending",
    priority: "High",
    orderDate: "2024-01-15",
    dueDate: "2024-01-18"
  },
  {
    id: "ORD-004",
    customer: "Local Business LLC",
    items: 2,
    total: "$480.00",
    status: "Delivered",
    priority: "Low",
    orderDate: "2024-01-12",
    dueDate: "2024-01-15"
  }
];

export default function Orders() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Processing":
        return <Badge variant="outline" className="border-info text-info bg-info/10">Processing</Badge>;
      case "Shipped":
        return <Badge variant="outline" className="border-warning text-warning bg-warning/10">Shipped</Badge>;
      case "Delivered":
        return <Badge variant="outline" className="border-success text-success bg-success/10">Delivered</Badge>;
      case "Pending":
        return <Badge variant="outline" className="border-destructive text-destructive bg-destructive/10">Pending</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
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

  return (
    <Layout>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Order Management</h1>
          <p className="text-muted-foreground">Track and manage customer orders and fulfillment.</p>
        </div>
        <Button className="bg-primary-blue hover:bg-primary-blue-dark">
          <ShoppingCart className="h-4 w-4 mr-2" />
          New Order
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">156</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-primary-blue" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Processing</p>
                <p className="text-2xl font-bold text-info">23</p>
              </div>
              <Package className="h-8 w-8 text-info" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Shipped</p>
                <p className="text-2xl font-bold text-warning">45</p>
              </div>
              <Truck className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Delivered</p>
                <p className="text-2xl font-bold text-success">88</p>
              </div>
              <Package className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Order ID</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Customer</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Items</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Total</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Priority</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Due Date</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {ordersData.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="py-4 px-4 font-mono text-sm">{order.id}</td>
                    <td className="py-4 px-4 font-medium">{order.customer}</td>
                    <td className="py-4 px-4">{order.items}</td>
                    <td className="py-4 px-4 font-medium">{order.total}</td>
                    <td className="py-4 px-4">{getStatusBadge(order.status)}</td>
                    <td className="py-4 px-4">{getPriorityBadge(order.priority)}</td>
                    <td className="py-4 px-4 text-muted-foreground">{order.dueDate}</td>
                    <td className="py-4 px-4">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
    </Layout>
  );
}