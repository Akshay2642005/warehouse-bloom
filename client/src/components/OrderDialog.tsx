import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { createOrderApi, updateOrderStatusApi, OrderDTO } from '@/api/orders';
import { fetchItems } from '@/api/items';
import { toast } from "sonner";

interface OrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order?: OrderDTO | null;
  onSuccess: () => void;
}

export function OrderDialog({ open, onOpenChange, order, onSuccess }: OrderDialogProps) {
  const [items, setItems] = useState([{ itemId: '', quantity: 1 }]);
  const [status, setStatus] = useState<OrderDTO['status']>('PENDING');
  
  const queryClient = useQueryClient();
  
  const { data: availableItems } = useQuery({
    queryKey: ['items'],
    queryFn: () => fetchItems({ pageSize: 100 })
  });

  const createMutation = useMutation({
    mutationFn: createOrderApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order created successfully');
      onSuccess();
    },
    onError: () => toast.error('Failed to create order')
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderDTO['status'] }) => 
      updateOrderStatusApi(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order updated successfully');
      onSuccess();
    },
    onError: () => toast.error('Failed to update order')
  });

  useEffect(() => {
    if (order) {
      setStatus(order.status);
    } else {
      setItems([{ itemId: '', quantity: 1 }]);
      setStatus('PENDING');
    }
  }, [order]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (order) {
      updateMutation.mutate({ id: order.id, status });
    } else {
      const validItems = items.filter(item => item.itemId && item.quantity > 0);
      if (validItems.length === 0) {
        toast.error('Please add at least one item');
        return;
      }
      createMutation.mutate(validItems);
    }
  };

  const addItem = () => {
    setItems([...items, { itemId: '', quantity: 1 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: 'itemId' | 'quantity', value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{order ? 'Edit Order' : 'Create New Order'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {order ? (
            <div className="space-y-4">
              <div>
                <Label>Order Number</Label>
                <Input value={order.orderNumber} disabled />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={status} onValueChange={(value) => setStatus(value as OrderDTO['status'])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="PROCESSING">Processing</SelectItem>
                    <SelectItem value="SHIPPED">Shipped</SelectItem>
                    <SelectItem value="DELIVERED">Delivered</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Order Items</Label>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  Add Item
                </Button>
              </div>
              
              {items.map((item, index) => (
                <div key={index} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Label>Item</Label>
                    <Select value={item.itemId} onValueChange={(value) => updateItem(index, 'itemId', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select item" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableItems?.items.map((availableItem) => (
                          <SelectItem key={availableItem.id} value={availableItem.id}>
                            {availableItem.name} ({availableItem.sku})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-24">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                    />
                  </div>
                  {items.length > 1 && (
                    <Button type="button" variant="outline" size="sm" onClick={() => removeItem(index)}>
                      Remove
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {order ? 'Update Order' : 'Create Order'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}