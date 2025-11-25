import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Settings, User, Bell, Shield, Database, Save, RefreshCw, AlertTriangle, Globe, Clock } from "lucide-react";
import { SessionManager } from '@/components/SessionManager';
import { axiosInstance } from '@/api/axiosInstance';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@/contexts/UserContext';

interface SystemSettings {
  currency: string;
  dateFormat: string;
  lowStockThreshold: string;
  maintenance: string;
  timezone: string;
  language: string;
  companyName: string;
  companyAddress: string;
}

interface UserPreferences {
  emailNotifications: string;
  lowStockAlerts: string;
  orderUpdates: string;
  theme: string;
  itemsPerPage: string;
}

export default function SettingsPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    lowStockThreshold: '10',
    maintenance: '0',
    timezone: 'UTC',
    language: 'en',
    companyName: 'Warehouse Bloom',
    companyAddress: ''
  });

  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    emailNotifications: '1',
    lowStockAlerts: '1',
    orderUpdates: '1',
    theme: 'light',
    itemsPerPage: '10'
  });

  // Fetch system settings
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const response = await axiosInstance.get('/settings');
      return response.data.data || {};
    }
  });

  useEffect(() => {
    if (settings) {
      setSystemSettings(prev => ({ ...prev, ...settings }));
    }
  }, [settings]);

  // Fetch user preferences
  const { data: preferences } = useQuery({
    queryKey: ['preferences'],
    queryFn: async () => {
      const response = await axiosInstance.get('/settings/preferences');
      return response.data.data || {};
    }
  });

  useEffect(() => {
    if (preferences) {
      setUserPreferences(prev => ({ ...prev, ...preferences }));
    }
  }, [preferences]);

  const saveSystemMutation = useMutation({
    mutationFn: async (settings: SystemSettings) => {
      const settingsArray = Object.entries(settings).map(([key, value]) => ({ key, value }));
      await axiosInstance.put('/settings', settingsArray);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast({ title: 'Success', description: 'System settings saved successfully' });
    },
    onError: () => toast({ title: 'Error', description: 'Failed to save settings', variant: 'destructive' })
  });

  const savePreferencesMutation = useMutation({
    mutationFn: async (prefs: UserPreferences) => {
      await axiosInstance.put('/settings/preferences', prefs);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preferences'] });
      toast({ title: 'Success', description: 'Preferences saved successfully' });
    },
    onError: () => toast({ title: 'Error', description: 'Failed to save preferences', variant: 'destructive' })
  });

  const clearCacheMutation = useMutation({
    mutationFn: async () => {
      await axiosInstance.post('/settings/clear-cache');
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast({ title: 'Success', description: 'Cache cleared successfully' });
    },
    onError: () => toast({ title: 'Error', description: 'Failed to clear cache', variant: 'destructive' })
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your warehouse management system configuration and preferences.</p>
        </div>
        {systemSettings.maintenance === '1' && (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Maintenance Mode
          </Badge>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* User Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              User Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive email alerts for important events</p>
              </div>
              <Switch
                checked={userPreferences.emailNotifications === '1'}
                onCheckedChange={(checked) =>
                  setUserPreferences(prev => ({ ...prev, emailNotifications: checked ? '1' : '0' }))
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>Low Stock Alerts</Label>
                <p className="text-sm text-muted-foreground">Get notified when items are running low</p>
              </div>
              <Switch
                checked={userPreferences.lowStockAlerts === '1'}
                onCheckedChange={(checked) =>
                  setUserPreferences(prev => ({ ...prev, lowStockAlerts: checked ? '1' : '0' }))
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>Order Updates</Label>
                <p className="text-sm text-muted-foreground">Notifications for order status changes</p>
              </div>
              <Switch
                checked={userPreferences.orderUpdates === '1'}
                onCheckedChange={(checked) =>
                  setUserPreferences(prev => ({ ...prev, orderUpdates: checked ? '1' : '0' }))
                }
              />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Items Per Page</Label>
              <Select
                value={userPreferences.itemsPerPage}
                onValueChange={(value) => setUserPreferences(prev => ({ ...prev, itemsPerPage: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 items</SelectItem>
                  <SelectItem value="10">10 items</SelectItem>
                  <SelectItem value="25">25 items</SelectItem>
                  <SelectItem value="50">50 items</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={() => savePreferencesMutation.mutate(userPreferences)}
              disabled={savePreferencesMutation.isPending}
              className="w-full"
            >
              <Save className="h-4 w-4 mr-2" />
              {savePreferencesMutation.isPending ? 'Saving...' : 'Save Preferences'}
            </Button>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security & Access
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Current User</Label>
              <div className="flex items-center gap-2">
                <Badge variant={user?.role === 'admin' ? 'destructive' : 'default'}>
                  {user?.role?.toUpperCase()}
                </Badge>
                <span className="text-sm text-muted-foreground">{user?.email}</span>
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Two-Factor Authentication</Label>
              <div className="flex items-center gap-2">
                <Badge variant={user?.twoFactorEnabled ? 'default' : 'outline'}>
                  {user?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                </Badge>
                <Button variant="outline" size="sm" asChild>
                  <a href="/profile">Manage 2FA</a>
                </Button>
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Session Management</Label>
              <SessionManager />
            </div>
          </CardContent>
        </Card>

        {/* System Configuration */}
        {user?.role === 'admin' && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                System Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <Input
                    value={systemSettings.companyName}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, companyName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Default Currency</Label>
                  <Select
                    value={systemSettings.currency}
                    onValueChange={(value) => setSystemSettings(prev => ({ ...prev, currency: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="JPY">JPY (¥)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Date Format</Label>
                  <Select
                    value={systemSettings.dateFormat}
                    onValueChange={(value) => setSystemSettings(prev => ({ ...prev, dateFormat: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Select
                    value={systemSettings.timezone}
                    onValueChange={(value) => setSystemSettings(prev => ({ ...prev, timezone: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Company Address</Label>
                <Textarea
                  value={systemSettings.companyAddress}
                  onChange={(e) => setSystemSettings(prev => ({ ...prev, companyAddress: e.target.value }))}
                  placeholder="Enter company address..."
                  rows={3}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Low Stock Threshold</Label>
                  <Input
                    type="number"
                    value={systemSettings.lowStockThreshold}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, lowStockThreshold: e.target.value }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">Show maintenance banner to users</p>
                  </div>
                  <Switch
                    checked={systemSettings.maintenance === '1'}
                    onCheckedChange={(checked) =>
                      setSystemSettings(prev => ({ ...prev, maintenance: checked ? '1' : '0' }))
                    }
                  />
                </div>
              </div>

              <Separator />

              <div className="flex gap-3">
                <Button
                  onClick={() => saveSystemMutation.mutate(systemSettings)}
                  disabled={saveSystemMutation.isPending}
                  className="flex-1"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saveSystemMutation.isPending ? 'Saving...' : 'Save System Settings'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => clearCacheMutation.mutate()}
                  disabled={clearCacheMutation.isPending}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Clear Cache
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
