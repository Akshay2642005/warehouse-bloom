import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Monitor, Smartphone, Tablet, Trash2, Shield } from "lucide-react";
import { axiosInstance } from '@/api/axiosInstance';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface UserSession {
  id: string;
  ipAddress: string;
  userAgent: string;
  lastActivity: string;
  createdAt: string;
}

export function SessionManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: sessions = [] } = useQuery({
    queryKey: ['sessions'],
    queryFn: async () => {
      const response = await axiosInstance.get('/settings/sessions');
      return response.data.data?.sessions || [];
    }
  });

  const revokeSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      await axiosInstance.delete(`/settings/sessions/${sessionId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast({ title: 'Success', description: 'Session revoked successfully' });
    },
    onError: () => toast({ title: 'Error', description: 'Failed to revoke session', variant: 'destructive' })
  });

  const revokeAllMutation = useMutation({
    mutationFn: async () => {
      await axiosInstance.delete('/settings/sessions');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast({ title: 'Success', description: 'All sessions revoked successfully' });
      setOpen(false);
    },
    onError: () => toast({ title: 'Error', description: 'Failed to revoke sessions', variant: 'destructive' })
  });

  const getDeviceIcon = (userAgent: string) => {
    if (userAgent.includes('Mobile')) return <Smartphone className="h-4 w-4" />;
    if (userAgent.includes('Tablet')) return <Tablet className="h-4 w-4" />;
    return <Monitor className="h-4 w-4" />;
  };

  const getDeviceType = (userAgent: string) => {
    if (userAgent.includes('Mobile')) return 'Mobile';
    if (userAgent.includes('Tablet')) return 'Tablet';
    return 'Desktop';
  };

  const getBrowser = (userAgent: string) => {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Shield className="h-4 w-4 mr-2" />
          View Active Sessions
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Active Sessions</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {sessions.length} active session{sessions.length !== 1 ? 's' : ''}
            </p>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => revokeAllMutation.mutate()}
              disabled={revokeAllMutation.isPending || sessions.length === 0}
            >
              Revoke All Sessions
            </Button>
          </div>
          <Separator />
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {sessions.map((session: UserSession) => (
              <Card key={session.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getDeviceIcon(session.userAgent)}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{getDeviceType(session.userAgent)}</span>
                          <Badge variant="outline">{getBrowser(session.userAgent)}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {session.ipAddress} • Last active: {new Date(session.lastActivity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => revokeSessionMutation.mutate(session.id)}
                      disabled={revokeSessionMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {sessions.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No active sessions found</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}