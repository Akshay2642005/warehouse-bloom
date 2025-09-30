import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Edit, Eye, Loader2 } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { fetchOrders } from '@/api/orders';
import { useState } from 'react';
import { OrderDialog } from './OrderDialog';

export function OrderTable() {
  const [page, setPage] = useState(1);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['orders', page],
    queryFn: () => fetchOrders({ page, pageSize: 50 }),
    staleTime: 0,
    refetchOnWindowFocus: true
  });

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
      case "CANCELLED":
        return <Badge variant="outline" className="border-muted text-muted bg-muted/10">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-destructive">Error loading orders</p>
        </CardContent>
      </Card>
    );
  }

  const orders = data?.data?.orders || data?.orders || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Order Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Order #</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Items</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Total</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b hover:bg-muted/50 transition-colors">
                  <td className="py-4 px-4 font-mono text-sm">{order.orderNumber}</td>
                  <td className="py-4 px-4">{order.items?.reduce((sum, i) => sum + i.quantity, 0) || 0}</td>
                  <td className="py-4 px-4 font-medium">${(order.totalCents / 100).toFixed(2)}</td>
                  <td className="py-4 px-4">{getStatusBadge(order.status)}</td>
                  <td className="py-4 px-4 text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="py-4 px-4">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => { setSelectedOrder(order); setShowDialog(true); }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {data && (data.data?.totalPages || data.totalPages) > 1 && (
          <div className="flex justify-center mt-4 gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              Previous
            </Button>
            <span className="flex items-center px-3 text-sm">
              Page {page} of {data.data?.totalPages || data.totalPages}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              disabled={page === (data.data?.totalPages || data.totalPages)}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
        
        {orders.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No orders found.</p>
          </div>
        )}
      </CardContent>
      
      <OrderDialog 
        open={showDialog} 
        onOpenChange={setShowDialog}
        order={selectedOrder}
        onSuccess={() => {
          setShowDialog(false);
          setSelectedOrder(null);
        }}
      />
    </Card>
  );
}