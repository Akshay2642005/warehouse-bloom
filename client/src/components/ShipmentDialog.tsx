import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { createShipmentApi, updateShipmentStatusApi, Shipment } from '@/api/shipments';
import { fetchOrders } from '@/api/orders';
import { toast } from "sonner";

interface ShipmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shipment?: Shipment | null;
  onSuccess: () => void;
}

export function ShipmentDialog({ open, onOpenChange, shipment, onSuccess }: ShipmentDialogProps) {
  const [orderId, setOrderId] = useState('');
  const [carrier, setCarrier] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [destination, setDestination] = useState('');
  const [estimatedDelivery, setEstimatedDelivery] = useState('');
  const [status, setStatus] = useState('Processing');
  
  const queryClient = useQueryClient();
  
  const { data: orders } = useQuery({
    queryKey: ['orders'],
    queryFn: () => fetchOrders({ pageSize: 100 })
  });

  const createMutation = useMutation({
    mutationFn: createShipmentApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
      toast.success('Shipment created successfully');
      onSuccess();
    },
    onError: () => toast.error('Failed to create shipment')
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      updateShipmentStatusApi(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
      toast.success('Shipment updated successfully');
      onSuccess();
    },
    onError: () => toast.error('Failed to update shipment')
  });

  useEffect(() => {
    if (shipment) {
      setOrderId(shipment.orderId);
      setCarrier(shipment.carrier);
      setTrackingNumber(shipment.trackingNumber);
      setDestination(shipment.destination);
      setEstimatedDelivery(shipment.estimatedDelivery ? shipment.estimatedDelivery.split('T')[0] : '');
      setStatus(shipment.status);
    } else {
      setOrderId('');
      setCarrier('');
      setTrackingNumber('');
      setDestination('');
      setEstimatedDelivery('');
      setStatus('Processing');
    }
  }, [shipment]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (shipment) {
      updateMutation.mutate({ id: shipment.id, status });
    } else {
      if (!orderId || !carrier || !trackingNumber || !destination) {
        toast.error('Please fill in all required fields');
        return;
      }
      
      createMutation.mutate({
        orderId,
        carrier,
        trackingNumber,
        destination,
        estimatedDelivery: estimatedDelivery || undefined
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{shipment ? 'Edit Shipment' : 'Create New Shipment'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {!shipment && (
            <div>
              <Label>Order</Label>
              <Select value={orderId} onValueChange={setOrderId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select order" />
                </SelectTrigger>
                <SelectContent>
                  {orders?.orders.map((order) => (
                    <SelectItem key={order.id} value={order.id}>
                      {order.orderNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {shipment ? (
            <div>
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Processing">Processing</SelectItem>
                  <SelectItem value="In Transit">In Transit</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                  <SelectItem value="Delayed">Delayed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : (
            <>
              <div>
                <Label>Carrier</Label>
                <Input
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  placeholder="e.g., FedEx, UPS, DHL"
                />
              </div>
              
              <div>
                <Label>Tracking Number</Label>
                <Input
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number"
                />
              </div>
              
              <div>
                <Label>Destination</Label>
                <Input
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g., New York, NY"
                />
              </div>
              
              <div>
                <Label>Estimated Delivery (Optional)</Label>
                <Input
                  type="date"
                  value={estimatedDelivery}
                  onChange={(e) => setEstimatedDelivery(e.target.value)}
                />
              </div>
            </>
          )}
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {shipment ? 'Update Shipment' : 'Create Shipment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}