import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { QrCode, Shield, ShieldCheck, ShieldX } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

interface TwoFactorSetup {
  secret: string;
  qrCodeUrl: string;
  manualEntryKey: string;
}

interface TwoFactorStatus {
  enabled: boolean;
}

const api = axios.create({
  baseURL: '/api/2fa',
  withCredentials: true
});

export function TwoFactorAuth() {
  const [setupData, setSetupData] = useState<TwoFactorSetup | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const { toast } = useToast();

  // Get 2FA status
  const { data: status, refetch } = useQuery<TwoFactorStatus>({
    queryKey: ['2fa-status'],
    queryFn: async () => {
      const response = await api.get('/status');
      return response.data.data;
    }
  });

  // Setup 2FA
  const setupMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/setup');
      return response.data.data;
    },
    onSuccess: (data) => {
      setSetupData(data);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to setup 2FA",
        variant: "destructive"
      });
    }
  });

  // Enable 2FA
  const enableMutation = useMutation({
    mutationFn: async (data: { secret: string; token: string }) => {
      const response = await api.post('/enable', data);
      return response.data.data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Two-factor authentication enabled successfully"
      });
      setSetupData(null);
      setVerificationCode('');
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to enable 2FA",
        variant: "destructive"
      });
    }
  });

  // Disable 2FA
  const disableMutation = useMutation({
    mutationFn: async (token: string) => {
      const response = await api.post('/disable', { token });
      return response.data.data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Two-factor authentication disabled successfully"
      });
      setDisableCode('');
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to disable 2FA",
        variant: "destructive"
      });
    }
  });

  const handleSetup = () => {
    setupMutation.mutate();
  };

  const handleEnable = () => {
    if (!setupData || !verificationCode) return;
    enableMutation.mutate({
      secret: setupData.secret,
      token: verificationCode
    });
  };

  const handleDisable = () => {
    if (!disableCode) return;
    disableMutation.mutate(disableCode);
  };

  if (!status) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Two-Factor Authentication
          {status.enabled ? (
            <Badge variant="default" className="bg-green-100 text-green-800">
              <ShieldCheck className="w-3 h-3 mr-1" />
              Enabled
            </Badge>
          ) : (
            <Badge variant="secondary">
              <ShieldX className="w-3 h-3 mr-1" />
              Disabled
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!status.enabled ? (
          // Setup 2FA
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Add an extra layer of security to your account by enabling two-factor authentication.
            </p>
            
            {!setupData ? (
              <Button 
                onClick={handleSetup}
                disabled={setupMutation.isPending}
              >
                {setupMutation.isPending ? 'Setting up...' : 'Setup 2FA'}
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <QrCode className="w-4 h-4" />
                    Scan QR Code
                  </h4>
                  <div className="flex justify-center items-center bg-white p-4 rounded border">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(setupData.qrCodeUrl)}`}
                      alt="2FA QR Code"
                      className="w-48 h-48 object-contain"
                      loading="lazy"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Manual Entry</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    If you can't scan the QR code, enter this key manually:
                  </p>
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                    {setupData.manualEntryKey}
                  </code>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="verification-code">Verification Code</Label>
                  <Input
                    id="verification-code"
                    placeholder="Enter 6-digit code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    maxLength={6}
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={handleEnable}
                    disabled={enableMutation.isPending || verificationCode.length !== 6}
                  >
                    {enableMutation.isPending ? 'Enabling...' : 'Enable 2FA'}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setSetupData(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Disable 2FA
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Two-factor authentication is currently enabled for your account.
            </p>
            
            <div className="space-y-2">
              <Label htmlFor="disable-code">Enter verification code to disable</Label>
              <Input
                id="disable-code"
                placeholder="Enter 6-digit code"
                value={disableCode}
                onChange={(e) => setDisableCode(e.target.value)}
                maxLength={6}
              />
            </div>

            <Button 
              variant="destructive"
              onClick={handleDisable}
              disabled={disableMutation.isPending || disableCode.length !== 6}
            >
              {disableMutation.isPending ? 'Disabling...' : 'Disable 2FA'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}