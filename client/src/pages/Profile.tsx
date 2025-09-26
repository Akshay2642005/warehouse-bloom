import { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Mail, Shield, Calendar, Settings, Save, Edit, Image as ImageIcon, KeyRound, User2 } from "lucide-react";
import { updateUserPassword, updateUserProfile, toggleTwoFactor } from '@/api/users';

export default function Profile() {
  const { user } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    email: user?.email || '',
    name: (user as any)?.name || '',
    avatarUrl: (user as any)?.avatarUrl || '',
    twoFactorEnabled: (user as any)?.twoFactorEnabled || false,
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSave = async () => {
    if (!user) return;
    await updateUserProfile(user.id, { email: formData.email, name: formData.name, avatarUrl: formData.avatarUrl });
    setIsEditing(false);
  };

  const handlePasswordChange = async () => {
    if (!user) return;
    if (formData.newPassword !== formData.confirmPassword) return;
    await updateUserPassword(user.id, { currentPassword: formData.currentPassword, newPassword: formData.newPassword });
    setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
  };

  const handleToggle2FA = async () => {
    if (!user) return;
    const next = !formData.twoFactorEnabled;
    await toggleTwoFactor(user.id, next);
    setFormData(prev => ({ ...prev, twoFactorEnabled: next }));
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-destructive text-destructive-foreground">Admin</Badge>;
      case 'user':
        return <Badge className="bg-primary text-primary-foreground">User</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Profile</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences.</p>
        </div>
        <Button onClick={() => setIsEditing(!isEditing)} variant={isEditing ? "outline" : "default"}>
          {isEditing ? (<><Save className="h-4 w-4 mr-2" />Cancel</>) : (<><Edit className="h-4 w-4 mr-2" />Edit Profile</>)}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Overview */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Profile Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-20 w-20 mb-4">
                <AvatarFallback className="text-lg font-semibold">
                  {user ? getInitials(user.email) : 'U'}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-lg font-semibold">{formData.name || user?.email}</h3>
              <div className="mt-2">{user && getRoleBadge(user.role)}</div>
            </div>
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">User ID</p>
                  <p className="text-sm text-muted-foreground">{user?.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{formData.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Two-Factor</p>
                  <p className="text-sm text-muted-foreground">{formData.twoFactorEnabled ? 'Enabled' : 'Disabled'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5" />Account Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} disabled={!isEditing} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="avatarUrl">Avatar URL</Label>
                <Input id="avatarUrl" value={formData.avatarUrl} onChange={(e) => setFormData(prev => ({ ...prev, avatarUrl: e.target.value }))} disabled={!isEditing} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} disabled={!isEditing} />
            </div>

            <Separator />
            <div className="space-y-4">
              <h4 className="text-sm font-semibold flex items-center gap-2"><KeyRound className="h-4 w-4" /> Password</h4>
              {isEditing && (
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input id="currentPassword" type="password" value={formData.currentPassword} onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input id="newPassword" type="password" value={formData.newPassword} onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input id="confirmPassword" type="password" value={formData.confirmPassword} onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))} />
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <Button onClick={handlePasswordChange} variant="outline" className="flex-1"><KeyRound className="h-4 w-4 mr-2" />Update Password</Button>
                <Button onClick={handleToggle2FA} variant="outline" className="flex-1"><Shield className="h-4 w-4 mr-2" />{formData.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}</Button>
              </div>
            </div>

            {isEditing && (
              <>
                <Separator />
                <div className="flex gap-3">
                  <Button onClick={handleSave} className="flex-1"><Save className="h-4 w-4 mr-2" />Save Changes</Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1">Cancel</Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activity Summary (placeholder) */}
      <Card>
        <CardHeader><CardTitle>Activity Summary</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center"><p className="text-2xl font-bold text-primary">12</p><p className="text-sm text-muted-foreground">Items Created</p></div>
            <div className="text-center"><p className="text-2xl font-bold text-success">8</p><p className="text-sm text-muted-foreground">Items Updated</p></div>
            <div className="text-center"><p className="text-2xl font-bold text-warning">3</p><p className="text-sm text-muted-foreground">Alerts Resolved</p></div>
            <div className="text-center"><p className="text-2xl font-bold text-info">25</p><p className="text-sm text-muted-foreground">Login Sessions</p></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
