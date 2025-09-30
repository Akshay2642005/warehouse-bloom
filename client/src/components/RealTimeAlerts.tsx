import { useEffect, useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bell, X, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { axiosInstance } from '@/api/axiosInstance';
import { useToast } from '@/hooks/use-toast';

interface Alert {
  id: string;
  type: string;
  message: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  acknowledged: boolean;
  createdAt: string;
  item?: {
    name: string;
    sku: string;
  };
}

export function RealTimeAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showAlerts, setShowAlerts] = useState(false);
  const { toast } = useToast();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: alertsData, refetch } = useQuery({
    queryKey: ['realtime-alerts'],
    queryFn: async () => {
      const response = await axiosInstance.get('/alerts?acknowledged=false');
      return response.data.data?.alerts || [];
    },
    refetchInterval: 30000,
    staleTime: 0,
  });

  useEffect(() => {
    if (alertsData) {
      setAlerts(alertsData);
    }
  }, [alertsData]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowAlerts(false);
      }
    };

    if (showAlerts) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAlerts]);

  const acknowledgeAlert = async (alertId: string) => {
    try {
      await axiosInstance.patch(`/alerts/${alertId}/acknowledge`);
      // Optimistically update local state
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
      // Refetch to ensure consistency
      await refetch();
      toast({
        title: 'Success',
        description: 'Alert dismissed'
      });
    } catch (error) {
      console.error('Acknowledge alert error:', error);
      // Revert optimistic update on error
      await refetch();
      toast({
        title: 'Error',
        description: 'Failed to acknowledge alert',
        variant: 'destructive'
      });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-500';
      case 'HIGH': return 'bg-orange-500';
      case 'MEDIUM': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
      case 'HIGH':
        return <AlertTriangle className="h-4 w-4" />;
      case 'MEDIUM':
        return <Info className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  const unacknowledgedCount = alerts.filter(alert => !alert.acknowledged).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowAlerts(!showAlerts)}
        className="relative"
      >
        <Bell className="h-4 w-4" />
        {unacknowledgedCount > 0 && (
          <Badge 
            className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            variant="destructive"
          >
            {unacknowledgedCount > 9 ? '9+' : unacknowledgedCount}
          </Badge>
        )}
      </Button>

      {showAlerts && (
        <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto z-50">
          <Card>
            <CardContent className="p-0">
              <div className="p-3 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Alerts</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAlerts(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {alerts.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No new alerts
                  </div>
                ) : (
                  alerts.slice(0, 10).map((alert) => (
                    <div key={alert.id} className="p-3 border-b last:border-b-0 hover:bg-muted/50">
                      <div className="flex items-start gap-3">
                        <div className={`p-1 rounded-full text-white ${getSeverityColor(alert.severity)}`}>
                          {getSeverityIcon(alert.severity)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{alert.message}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(alert.createdAt).toLocaleString()}
                          </p>
                          {alert.item && (
                            <p className="text-xs text-muted-foreground">
                              SKU: {alert.item.sku}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            acknowledgeAlert(alert.id);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}