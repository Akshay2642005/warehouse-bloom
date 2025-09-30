import { useEffect, useRef } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, XCircle, Clock, Bell } from "lucide-react";
import { fetchAlerts } from '@/api/dashboard';
import { acknowledgeAlert, restockItem } from '@/api/alerts';
import { useToast } from '@/hooks/use-toast';

export default function Alerts() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['alerts'],
    queryFn: fetchAlerts,
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });

  const ackMutation = useMutation({
    mutationFn: acknowledgeAlert,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['alerts'] }); toast({ title: 'Alert dismissed' }); }
  });
  const restockMutation = useMutation({
    mutationFn: ({ itemId, amount }: { itemId: string; amount: number; }) => restockItem(itemId, amount),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['alerts'] }); toast({ title: 'Restocked', description: 'Inventory updated' }); }
  });

  const sseRef = useRef<EventSource | null>(null);
  useEffect(() => {
    const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';
    const url = base.replace(/\/$/, '') + '/events/stream';
    const es = new EventSource(url, { withCredentials: true } as any);
    sseRef.current = es;
    es.onmessage = (evt) => {
      try {
        const event = JSON.parse(evt.data);
        if (event?.type === 'alert') {
          queryClient.invalidateQueries({ queryKey: ['alerts'] });
        }
      } catch { }
    };
    es.onerror = () => { es.close(); };
    return () => es.close();
  }, [queryClient]);

  const getSeverityBadge = (quantity: number) => {
    if (quantity === 0) return <Badge className="bg-destructive text-destructive-foreground">Critical</Badge>;
    if (quantity < 5) return <Badge className="bg-orange-500 text-white">High</Badge>;
    if (quantity < 10) return <Badge className="bg-warning text-warning-foreground">Medium</Badge>;
    return <Badge className="bg-muted text-muted-foreground">Low</Badge>;
  };

  const getStatusIcon = (quantity: number) => {
    if (quantity === 0) return <XCircle className="h-4 w-4 text-destructive" />;
    if (quantity < 10) return <AlertTriangle className="h-4 w-4 text-warning" />;
    return <CheckCircle className="h-4 w-4 text-success" />;
  };

  const validAlerts = alerts.filter(item => item && item.id && item.name);
  const criticalCount = validAlerts.filter(item => (item.quantity || 0) === 0).length;
  const lowStockCount = validAlerts.filter(item => (item.quantity || 0) > 0 && (item.quantity || 0) < 10).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Alerts & Notifications</h1>
          <p className="text-muted-foreground">Monitor system alerts and inventory warnings.</p>
        </div>
        <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ['alerts'] })}>
          <Bell className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Alert Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Alerts</p>
                <p className="text-2xl font-bold text-destructive">{validAlerts.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Out of Stock</p>
                <p className="text-2xl font-bold text-destructive">{criticalCount}</p>
              </div>
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Low Stock</p>
                <p className="text-2xl font-bold text-warning">{lowStockCount}</p>
              </div>
              <Bell className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Needs Attention</p>
                <p className="text-2xl font-bold text-info">{validAlerts.length}</p>
              </div>
              <Clock className="h-8 w-8 text-info" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inventory Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading alerts...</div>
          ) : validAlerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-success" />
              <p>No alerts! All inventory levels are healthy.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {alerts.filter(item => item && item.id && item.name).map((item) => (
                <div key={item.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-shrink-0 mt-1">{getStatusIcon(item.quantity || 0)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">Low Stock Alert</span>
                      {getSeverityBadge(item.quantity || 0)}
                    </div>
                    <p className="text-foreground mb-2">{item.name || 'Unknown Item'} (SKU: {item.sku || 'N/A'}) - {(item.quantity || 0) === 0 ? 'Out of stock' : `Only ${item.quantity || 0} units remaining`}</p>
                    <p className="text-sm text-muted-foreground">Price: ${((item.priceCents || 0) / 100).toFixed(2)}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => restockMutation.mutate({ itemId: item.id, amount: 10 })}>Restock</Button>
                    <Button variant="ghost" size="sm" onClick={() => ackMutation.mutate(item.id)}>Dismiss</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
