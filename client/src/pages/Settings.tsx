import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Settings, User, Bell, Shield, Database } from "lucide-react";
import { axiosInstance } from '@/api/axiosInstance';

export default function SettingsPage() {
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [lowStock, setLowStock] = useState(true);
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [maintenance, setMaintenance] = useState(false);
  const [currency, setCurrency] = useState('USD ($)');
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');
  const [lowStockThreshold, setLowStockThreshold] = useState(20);

  const saveSystemSettings = async () => {
    await axiosInstance.put('/settings', [
      { key: 'currency', value: currency },
      { key: 'dateFormat', value: dateFormat },
      { key: 'lowStockThreshold', value: String(lowStockThreshold) },
      { key: 'maintenance', value: maintenance ? '1' : '0' },
    ]);
  };

  const savePreferences = async () => {
    await axiosInstance.put('/settings/preferences', {
      emailNotifs: emailNotifs ? '1' : '0',
      lowStock: lowStock ? '1' : '0',
      orderUpdates: orderUpdates ? '1' : '0'
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your warehouse management system preferences.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><User className="h-5 w-5" />User Preferences</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between"><div><Label>Email Notifications</Label><p className="text-sm text-muted-foreground">Receive email alerts for important events</p></div><Switch checked={emailNotifs} onCheckedChange={setEmailNotifs} /></div>
            <Separator />
            <div className="flex items-center justify-between"><div><Label>Low Stock Alerts</Label><p className="text-sm text-muted-foreground">Get notified when items are running low</p></div><Switch checked={lowStock} onCheckedChange={setLowStock} /></div>
            <Separator />
            <div className="flex items-center justify-between"><div><Label>Order Updates</Label><p className="text-sm text-muted-foreground">Notifications for order status changes</p></div><Switch checked={orderUpdates} onCheckedChange={setOrderUpdates} /></div>
            <Button onClick={savePreferences}>Save Preferences</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Security</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>Change Password</Label><Button variant="outline" className="w-full">Update Password</Button></div>
            <div className="space-y-2"><Label>Session Timeout</Label><Input defaultValue="30 minutes" /></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Database className="h-5 w-5" />System Configuration</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>Default Currency</Label><Input value={currency} onChange={(e) => setCurrency(e.target.value)} /></div>
            <div className="space-y-2"><Label>Date Format</Label><Input value={dateFormat} onChange={(e) => setDateFormat(e.target.value)} /></div>
            <div className="space-y-2"><Label>Low Stock Threshold</Label><Input type="number" value={lowStockThreshold} onChange={(e) => setLowStockThreshold(Number(e.target.value))} /></div>
            <div className="flex items-center justify-between"><div><Label>Maintenance Mode</Label><p className="text-sm text-muted-foreground">Show maintenance banner</p></div><Switch checked={maintenance} onCheckedChange={setMaintenance} /></div>
            <Button className="bg-primary-blue hover:bg-primary-blue-dark" onClick={saveSystemSettings}>Save System Settings</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
