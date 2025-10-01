import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Truck, MapPin, Clock, Package } from "lucide-react";
import { ShipmentTable } from '@/components/ShipmentTable';
import { ShipmentDialog } from '@/components/ShipmentDialog';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/api/axiosInstance';



export default function Shipping() {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['shipment-stats'],
    queryFn: async () => {
      const res = await axiosInstance.get('/shipments/stats');
      return res.data.data;
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Shipping & Logistics</h1>
          <p className="text-muted-foreground">Track shipments and manage delivery logistics.</p>
        </div>
        <Button className="bg-primary-blue hover:bg-primary-blue-dark" onClick={() => { setSelectedShipment(null); setShowDialog(true); }}>
          <Truck className="h-4 w-4 mr-2" />
          Create Shipment
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Shipments</p>
                <p className="text-2xl font-bold">{statsLoading ? '—' : stats?.processing ?? 0}</p>
              </div>
              <Truck className="h-8 w-8 text-primary-blue" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Transit</p>
                <p className="text-2xl font-bold text-info">{statsLoading ? '—' : stats?.inTransit ?? 0}</p>
              </div>
              <Package className="h-8 w-8 text-info" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Delivered Today</p>
                <p className="text-2xl font-bold text-success">{statsLoading ? '—' : stats?.delivered ?? 0}</p>
              </div>
              <MapPin className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Delayed</p>
                <p className="text-2xl font-bold text-destructive">{statsLoading ? '—' : stats?.delayed ?? 0}</p>
              </div>
              <Clock className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shipments Table */}
      <ShipmentTable />
      
      {/* Shipment Dialog */}
      <ShipmentDialog 
        open={showDialog} 
        onOpenChange={setShowDialog}
        shipment={selectedShipment}
        onSuccess={() => {
          setShowDialog(false);
          setSelectedShipment(null);
        }}
      />
    </div>
  );
}
