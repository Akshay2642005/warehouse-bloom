import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Settings, User, Bell, Shield, Database, Palette } from "lucide-react";
// import { registerUser, loginUser } from "@/api/auth";
// Example usage:
// const handleRegister = async () => { await registerUser({ email, password }); };
// const handleLogin = async () => { const { user } = await loginUser({ email, password }); };

export default function SettingsPage() {
  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your warehouse management system preferences.</p>
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
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" defaultValue="john.doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="john.doe@company.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Input id="timezone" defaultValue="UTC-5 (Eastern Time)" />
              </div>
              <Button className="bg-primary-blue hover:bg-primary-blue-dark">
                Update Profile
              </Button>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive email alerts for important events</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Low Stock Alerts</Label>
                  <p className="text-sm text-muted-foreground">Get notified when items are running low</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Order Updates</Label>
                  <p className="text-sm text-muted-foreground">Notifications for order status changes</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>System Maintenance</Label>
                  <p className="text-sm text-muted-foreground">Alerts for scheduled maintenance</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Change Password</Label>
                <Button variant="outline" className="w-full">
                  Update Password
                </Button>
              </div>
              <div className="space-y-2">
                <Label>Session Timeout</Label>
                <Input defaultValue="30 minutes" />
              </div>
            </CardContent>
          </Card>

          {/* System Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                System Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Default Currency</Label>
                <Input defaultValue="USD ($)" />
              </div>
              <div className="space-y-2">
                <Label>Date Format</Label>
                <Input defaultValue="MM/DD/YYYY" />
              </div>
              <div className="space-y-2">
                <Label>Low Stock Threshold</Label>
                <Input defaultValue="20" type="number" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-Backup</Label>
                  <p className="text-sm text-muted-foreground">Automatically backup data daily</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Button className="bg-primary-blue hover:bg-primary-blue-dark">
                Save System Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}