import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Package, Truck } from "lucide-react";
import { fetchOrders } from '@/api/orders';
import { OrderTable } from '@/components/OrderTable';
import { useState } from 'react';
import { OrderDialog } from '@/components/OrderDialog';

export default function Orders() {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const { data } = useQuery({
    queryKey: ['orders-stats'],
    queryFn: () => fetchOrders({ page: 1, pageSize: 1000 }),
    staleTime: 0,
    refetchOnWindowFocus: true
  });

  const orders = data?.data?.orders || data?.orders || [];
  const total = data?.data?.total || data?.total || orders.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Order Management</h1>
          <p className="text-muted-foreground">Track and manage customer orders and fulfillment.</p>
        </div>
        <Button onClick={() => { setSelectedOrder(null); setShowDialog(true); }} className="w-full sm:w-auto">
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
                <p className="text-2xl font-bold">{total}</p>
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
                <p className="text-2xl font-bold text-info">{orders.filter((o: any) => o.status === 'PROCESSING').length}</p>
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
                <p className="text-2xl font-bold text-warning">{orders.filter((o: any) => o.status === 'SHIPPED').length}</p>
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
                <p className="text-2xl font-bold text-success">{orders.filter((o: any) => o.status === 'DELIVERED').length}</p>
              </div>
              <Package className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <OrderTable />

      {/* Order Dialog */}
      <OrderDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        order={selectedOrder}
        onSuccess={() => {
          setShowDialog(false);
          setSelectedOrder(null);
        }}
      />
    </div>
  );
}