import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { User, Mail, Shield, Settings, Save, Edit, KeyRound, QrCode, Smartphone } from "lucide-react";
import { updateUserPassword, updateUserProfile, setupTwoFactor, verifyTwoFactor, disableTwoFactor } from '@/api/users';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import type { UpdateUserData, UpdatePasswordData, TwoFactorSetup } from '@/types';

export default function Profile() {
  const { user, setUser, refreshUser } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [show2FADialog, setShow2FADialog] = useState(false);
  const [twoFactorSetup, setTwoFactorSetup] = useState<TwoFactorSetup | null>(null);
  const [verificationToken, setVerificationToken] = useState('');
  const [formData, setFormData] = useState({
    email: user?.email || '',
    name: user?.name || '',
    avatarUrl: user?.avatarUrl || '',
    phoneNumber: (user as any)?.phoneNumber || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        email: user.email || '',
        name: user.name || '',
        avatarUrl: user.avatarUrl || '',
        phoneNumber: (user as any).phoneNumber || ''
      }));
    }
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateUserData) => updateUserProfile(data),
    onSuccess: async (response) => {
      // Update user with the returned data from backend
      if (response?.data?.user) {
        setUser(response.data.user);
      }
      // Also refresh from server to ensure consistency
      await refreshUser();
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      toast({ title: 'Success', description: 'Profile updated successfully' });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to update profile';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    }
  });

  const updatePasswordMutation = useMutation({
    mutationFn: (data: UpdatePasswordData) => updateUserPassword(data),
    onSuccess: () => {
      setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
      toast({ title: 'Success', description: 'Password updated successfully' });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to update password';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    }
  });

  const setup2FAMutation = useMutation({
    mutationFn: () => setupTwoFactor(),
    onSuccess: (data) => {
      setTwoFactorSetup(data);
      setShow2FADialog(true);
    },
    onError: () => toast({ title: 'Error', description: 'Failed to setup 2FA', variant: 'destructive' })
  });

  const verify2FAMutation = useMutation({
    mutationFn: (token: string) => verifyTwoFactor(token),
    onSuccess: async () => {
      setUser({ ...user!, twoFactorEnabled: true });
      setShow2FADialog(false);
      setTwoFactorSetup(null);
      setVerificationToken('');
      await refreshUser();
      toast({ title: 'Success', description: '2FA enabled successfully' });
    },
    onError: () => toast({ title: 'Error', description: 'Invalid verification code', variant: 'destructive' })
  });

  const disable2FAMutation = useMutation({
    mutationFn: () => disableTwoFactor(user!.id),
    onSuccess: async () => {
      setUser({ ...user!, twoFactorEnabled: false });
      await refreshUser();
      toast({ title: 'Success', description: '2FA disabled successfully' });
    },
    onError: () => toast({ title: 'Error', description: 'Failed to disable 2FA', variant: 'destructive' })
  });

  const handleSave = () => {
    if (!user) return;
    updateProfileMutation.mutate({
      email: formData.email,
      confirmEmail: formData.email, // simple confirm pairing
      name: formData.name,
      avatarUrl: formData.avatarUrl,
      phoneNumber: formData.phoneNumber
    });
  };

  const handlePasswordChange = () => {
    if (!user || formData.newPassword !== formData.confirmPassword) {
      toast({ title: 'Error', description: 'Passwords do not match', variant: 'destructive' });
      return;
    }
    updatePasswordMutation.mutate({
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword,
      confirmPassword: formData.confirmPassword
    });
  };

  const handleSetup2FA = () => {
    if (!user?.twoFactorEnabled) {
      setup2FAMutation.mutate();
    } else {
      disable2FAMutation.mutate();
    }
  };

  const handleVerify2FA = () => {
    if (verificationToken.length === 6) {
      verify2FAMutation.mutate(verificationToken);
    }
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
        <Button onClick={() => {
          if (isEditing) {
            // Reset form data when canceling
            setFormData({
              email: user?.email || '',
              name: user?.name || '',
              avatarUrl: user?.avatarUrl || '',
              phoneNumber: (user as any)?.phoneNumber || '',
              currentPassword: '',
              newPassword: '',
              confirmPassword: ''
            });
          }
          setIsEditing(!isEditing);
        }} variant={isEditing ? "outline" : "default"}>
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
                {formData.avatarUrl && <AvatarImage src={formData.avatarUrl} alt={formData.name || user?.email} />}
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
                  <p className="text-sm font-medium">Two-Factor Auth</p>
                  <p className="text-sm text-muted-foreground">{user?.twoFactorEnabled ? 'Enabled' : 'Disabled'}</p>
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
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input id="phoneNumber" value={formData.phoneNumber} onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))} disabled={!isEditing} />
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
                <Button 
                  onClick={handlePasswordChange} 
                  variant="outline" 
                  className="flex-1"
                  disabled={!formData.currentPassword || !formData.newPassword || updatePasswordMutation.isPending}
                >
                  <KeyRound className="h-4 w-4 mr-2" />
                  Update Password
                </Button>
                <Button 
                  onClick={handleSetup2FA} 
                  variant="outline" 
                  className="flex-1"
                  disabled={setup2FAMutation.isPending || disable2FAMutation.isPending}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  {user?.twoFactorEnabled ? 'Disable 2FA' : 'Setup 2FA'}
                </Button>
              </div>
            </div>

            {isEditing && (
              <>
                <Separator />
                <div className="flex gap-3">
                  <Button 
                  onClick={handleSave} 
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black"
                  disabled={updateProfileMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
                  <Button variant="outline" onClick={() => {
                    setFormData({
                      email: user?.email || '',
                      name: user?.name || '',
                      avatarUrl: user?.avatarUrl || '',
                      phoneNumber: (user as any)?.phoneNumber || '',
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    });
                    setIsEditing(false);
                  }} className="flex-1">Cancel</Button>
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

      {/* 2FA Setup Dialog */}
      <Dialog open={show2FADialog} onOpenChange={setShow2FADialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Setup Two-Factor Authentication
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {twoFactorSetup && (
              <>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                  </p>
                  <div className="flex justify-center mb-4">
                    <img src={twoFactorSetup.qrCode} alt="2FA QR Code" className="border rounded" />
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">
                    Or enter this secret manually: <code className="bg-muted px-1 rounded">{twoFactorSetup.secret}</code>
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="token">Enter verification code</Label>
                  <Input
                    id="token"
                    placeholder="000000"
                    value={verificationToken}
                    onChange={(e) => setVerificationToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                  />
                </div>
                {twoFactorSetup?.backupCodes && (
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">Backup Codes (store these safely):</p>
                    <ul className="text-xs grid grid-cols-2 gap-1 font-mono bg-muted p-2 rounded">
                      {twoFactorSetup.backupCodes.map(code => (
                        <li key={code}>{code}</li>
                      ))}
                    </ul>
                    <p className="text-[10px] text-muted-foreground mt-1">These will not be shown again.</p>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button 
                    onClick={handleVerify2FA}
                    disabled={verificationToken.length !== 6 || verify2FAMutation.isPending}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black"
                  >
                    {verify2FAMutation.isPending ? 'Verifying...' : 'Verify & Enable'}
                  </Button>
                  <Button variant="outline" onClick={() => setShow2FADialog(false)}>
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
