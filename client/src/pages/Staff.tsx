import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, Plus, Mail, Phone, Shield, Trash2, RefreshCcw, UserCog, AlertTriangle } from "lucide-react";
import { fetchUsers } from '@/api/users';
import { inviteStaff, listInvitations, updateStaffRole, deleteStaff } from '@/api/staff';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export default function Staff() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: users = [], isLoading } = useQuery({ queryKey: ['admin-users'], queryFn: fetchUsers });
  const { data: invitations = [] } = useQuery({ queryKey: ['invitations'], queryFn: listInvitations });

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('USER');
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [newRole, setNewRole] = useState('USER');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const inviteMutation = useMutation({
    mutationFn: () => inviteStaff(inviteEmail, inviteRole),
    onSuccess: () => {
      toast({ title: 'Invitation sent' });
      setInviteEmail('');
      setInviteRole('USER');
      setInviteOpen(false);
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
    },
    onError: () => toast({ title: 'Failed to invite', variant: 'destructive' })
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => updateStaffRole(id, role),
    onSuccess: () => {
      toast({ title: 'Role updated' });
      setEditingRoleId(null);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: () => toast({ title: 'Failed to update role', variant: 'destructive' })
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteStaff(id),
    onSuccess: () => {
      toast({ title: 'User deleted' });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: () => toast({ title: 'Delete failed', variant: 'destructive' })
  });

  const getStatusBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <Badge variant="outline" className="border-success text-success bg-success/10">Admin</Badge>;
      case "USER":
        return <Badge variant="outline" className="border-muted text-muted-foreground bg-muted/10">User</Badge>;
      case "STAFF":
        return <Badge variant="outline" className="border-blue-500 text-blue-500 bg-blue-50">Staff</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getInitials = (email: string) => email.substring(0, 2).toUpperCase();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Staff Management</h1>
          <p className="text-muted-foreground">Manage users and roles.</p>
        </div>
        <Button onClick={() => setInviteOpen(true)} className="bg-primary-blue hover:bg-primary-blue-dark"><Plus className="h-4 w-4 mr-2" />Invite User</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-foreground">Total Users</p><p className="text-2xl font-bold">{users.length}</p></div><Users className="h-8 w-8 text-primary-blue" /></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-foreground">Admins</p><p className="text-2xl font-bold text-success">{users.filter(u => u.role === 'ADMIN').length}</p></div><Users className="h-8 w-8 text-success" /></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-foreground">Standard</p><p className="text-2xl font-bold text-warning">{users.filter(u => u.role === 'USER').length}</p></div><Users className="h-8 w-8 text-warning" /></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-foreground">Recently Added</p><p className="text-2xl font-bold text-info">{Math.min(users.length, 5)}</p></div><Users className="h-8 w-8 text-info" /></div></CardContent></Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {users.map((u) => (
          <Card key={u.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12"><AvatarFallback className="bg-primary-blue text-white font-medium">{getInitials(u.email)}</AvatarFallback></Avatar>
                  <div>
                    <h3 className="font-semibold text-foreground break-all">{u.email}</h3>
                    {editingRoleId === u.id ? (
                      <div className="flex items-center gap-2 mt-1">
                        <Select value={newRole} onValueChange={setNewRole}>
                          <SelectTrigger className="h-7 w-28"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                            <SelectItem value="USER">User</SelectItem>
                            <SelectItem value="STAFF">Staff</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button size="sm" variant="outline" onClick={() => roleMutation.mutate({ id: u.id, role: newRole })} disabled={roleMutation.isPending}>Save</Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingRoleId(null)}>Cancel</Button>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground capitalize flex items-center gap-2">{u.role}<Button aria-label="edit role" size="icon" variant="ghost" className="h-6 w-6" onClick={() => { setEditingRoleId(u.id); setNewRole(u.role); }}><UserCog className="h-4 w-4" /></Button></p>
                    )}
                  </div>
                </div>
                {getStatusBadge(u.role)}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div><p className="text-sm font-medium text-muted-foreground">Joined</p><p className="text-sm text-foreground">{new Date(u.createdAt).toLocaleDateString()}</p></div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <a href={`mailto:${u.email}?subject=Warehouse%20Platform&body=Hi%20there,`}> 
                    <Mail className="h-4 w-4 mr-1" />Email
                  </a>
                </Button>
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <a href={`tel:${(u as any).phoneNumber || ''}`}>
                    <Phone className="h-4 w-4 mr-1" />Call
                  </a>
                </Button>
                <Button variant="destructive" size="sm" className="flex-1" disabled={deleteMutation.isPending || u.role === 'ADMIN'} onClick={() => setConfirmDeleteId(u.id)}><Trash2 className="h-4 w-4 mr-1" />Del</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={!!confirmDeleteId} onOpenChange={(o) => { if (!o) setConfirmDeleteId(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-destructive" /> Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Are you sure you want to delete this user? This action cannot be undone.</p>
            <div className="flex gap-2">
              <Button className="flex-1" variant="destructive" disabled={deleteMutation.isPending} onClick={() => { if (confirmDeleteId) { deleteMutation.mutate(confirmDeleteId); setConfirmDeleteId(null); } }}>Delete</Button>
              <Button className="flex-1" variant="outline" onClick={() => setConfirmDeleteId(null)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite New Staff</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="inviteEmail">Email</Label>
              <Input id="inviteEmail" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="user@example.com" />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">User</SelectItem>
                  <SelectItem value="STAFF">Staff</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" disabled={!inviteEmail || inviteMutation.isPending} onClick={() => inviteMutation.mutate()}>
              {inviteMutation.isPending ? 'Sending...' : 'Send Invitation'}
            </Button>
            {invitations.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2 flex items-center gap-2"><RefreshCcw className="h-4 w-4" /> Recent Invitations</p>
                <ul className="max-h-40 overflow-auto text-xs space-y-1">
                  {invitations.slice(0, 10).map(inv => (
                    <li key={inv.id} className="flex justify-between gap-2">
                      <span className="truncate" title={inv.email}>{inv.email}</span>
                      <span className="uppercase text-muted-foreground">{inv.role}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
