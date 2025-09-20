import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Truck, MapPin, Clock, Package } from "lucide-react";

const shipmentsData = [
  {
    id: "SHIP-001",
    orderId: "ORD-001",
    carrier: "FedEx",
    trackingNumber: "1234567890",
    destination: "New York, NY",
    status: "In Transit",
    estimatedDelivery: "2024-01-17",
    shippedDate: "2024-01-15"
  },
  {
    id: "SHIP-002",
    orderId: "ORD-002",
    carrier: "UPS",
    trackingNumber: "0987654321",
    destination: "Los Angeles, CA",
    status: "Delivered",
    estimatedDelivery: "2024-01-16",
    shippedDate: "2024-01-14"
  },
  {
    id: "SHIP-003",
    orderId: "ORD-003",
    carrier: "DHL",
    trackingNumber: "5678901234",
    destination: "Chicago, IL",
    status: "Processing",
    estimatedDelivery: "2024-01-18",
    shippedDate: "-"
  }
];

export default function Shipping() {
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
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Shipping & Logistics</h1>
          <p className="text-muted-foreground">Track shipments and manage delivery logistics.</p>
        </div>
        <Button className="bg-primary-blue hover:bg-primary-blue-dark">
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
                <p className="text-2xl font-bold">23</p>
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
                <p className="text-2xl font-bold text-info">15</p>
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
                <p className="text-2xl font-bold text-success">8</p>
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
                <p className="text-2xl font-bold text-destructive">2</p>
              </div>
              <Clock className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shipments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Shipments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Shipment ID</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Order ID</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Carrier</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Tracking Number</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Destination</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Est. Delivery</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {shipmentsData.map((shipment) => (
                  <tr key={shipment.id} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="py-4 px-4 font-mono text-sm">{shipment.id}</td>
                    <td className="py-4 px-4 font-mono text-sm">{shipment.orderId}</td>
                    <td className="py-4 px-4 font-medium">{shipment.carrier}</td>
                    <td className="py-4 px-4 font-mono text-sm">{shipment.trackingNumber}</td>
                    <td className="py-4 px-4">{shipment.destination}</td>
                    <td className="py-4 px-4">{getStatusBadge(shipment.status)}</td>
                    <td className="py-4 px-4 text-muted-foreground">{shipment.estimatedDelivery}</td>
                    <td className="py-4 px-4">
                      <Button variant="ghost" size="sm">
                        Track
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
  );
}
