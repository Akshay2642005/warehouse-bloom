import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Eye, Package, Truck } from "lucide-react";
import { fetchOrders } from '@/api/orders';
import { OrderTable } from '@/components/OrderTable';

export default function Orders() {
  const { data, isLoading } = useQuery({
    queryKey: ['orders', { page: 1, pageSize: 10 }],
    queryFn: () => fetchOrders({ page: 1, pageSize: 10 })
  });
  const orders = data?.orders || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PROCESSING":
        return <Badge variant="outline" className="border-info text-info bg-info/10">Processing</Badge>;
      case "SHIPPED":
        return <Badge variant="outline" className="border-warning text-warning bg-warning/10">Shipped</Badge>;
      case "DELIVERED":
        return <Badge variant="outline" className="border-success text-success bg-success/10">Delivered</Badge>;
      case "PENDING":
        return <Badge variant="outline" className="border-destructive text-destructive bg-destructive/10">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Order Management</h1>
          <p className="text-muted-foreground">Track and manage customer orders and fulfillment.</p>
        </div>
        <Button className="bg-primary-blue hover:bg-primary-blue-dark w-full sm:w-auto">
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
                <p className="text-2xl font-bold">{data?.total ?? 0}</p>
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
                <p className="text-2xl font-bold text-info">{orders.filter(o => o.status === 'PROCESSING').length}</p>
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
                <p className="text-2xl font-bold text-warning">{orders.filter(o => o.status === 'SHIPPED').length}</p>
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
                <p className="text-2xl font-bold text-success">{orders.filter(o => o.status === 'DELIVERED').length}</p>
              </div>
              <Package className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <OrderTable />
    </div>
  );
}
