import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Truck, Edit, Eye, Loader2 } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { fetchShipments } from '@/api/shipments';
import { useState } from 'react';
import { ShipmentDialog } from './ShipmentDialog';

export function ShipmentTable() {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['shipments'],
    queryFn: fetchShipments
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Processing":
        return <Badge variant="outline" className="border-warning text-warning bg-warning/10">Processing</Badge>;
      case "In Transit":
        return <Badge variant="outline" className="border-info text-info bg-info/10">In Transit</Badge>;
      case "Delivered":
        return <Badge variant="outline" className="border-success text-success bg-success/10">Delivered</Badge>;
      case "Delayed":
        return <Badge variant="outline" className="border-destructive text-destructive bg-destructive/10">Delayed</Badge>;
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
          <p className="text-destructive">Error loading shipments</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Shipment Management</CardTitle>
        <Button size="sm" onClick={() => setShowDialog(true)}>
          <Truck className="h-4 w-4 mr-2" />
          Create Shipment
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Shipment ID</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Order #</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Carrier</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Tracking</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Destination</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Est. Delivery</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.shipments.map((shipment) => (
                <tr key={shipment.id} className="border-b hover:bg-muted/50 transition-colors">
                  <td className="py-4 px-4 font-mono text-sm">{shipment.id.slice(-8)}</td>
                  <td className="py-4 px-4 font-mono text-sm">{shipment.order?.orderNumber || shipment.orderId}</td>
                  <td className="py-4 px-4 font-medium">{shipment.carrier}</td>
                  <td className="py-4 px-4 font-mono text-sm">{shipment.trackingNumber}</td>
                  <td className="py-4 px-4">{shipment.destination}</td>
                  <td className="py-4 px-4">{getStatusBadge(shipment.status)}</td>
                  <td className="py-4 px-4 text-muted-foreground">
                    {shipment.estimatedDelivery ? new Date(shipment.estimatedDelivery).toLocaleDateString() : '-'}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedShipment(shipment)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => { setSelectedShipment(shipment); setShowDialog(true); }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
      
      <ShipmentDialog 
        open={showDialog} 
        onOpenChange={setShowDialog}
        shipment={selectedShipment}
        onSuccess={() => {
          setShowDialog(false);
          setSelectedShipment(null);
        }}
      />
    </Card>
  );
}