import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, Plus, Mail, Phone } from "lucide-react";
import { fetchUsers } from '@/api/users';

export default function Staff() {
  const { data: users = [] } = useQuery({ queryKey: ['admin-users'], queryFn: fetchUsers });

  const getStatusBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge variant="outline" className="border-success text-success bg-success/10">Admin</Badge>;
      case "user":
        return <Badge variant="outline" className="border-muted text-muted-foreground bg-muted/10">User</Badge>;
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
        <Button className="bg-primary-blue hover:bg-primary-blue-dark"><Plus className="h-4 w-4 mr-2" />Invite User</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-foreground">Total Users</p><p className="text-2xl font-bold">{users.length}</p></div><Users className="h-8 w-8 text-primary-blue" /></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-foreground">Admins</p><p className="text-2xl font-bold text-success">{users.filter(u => u.role === 'admin').length}</p></div><Users className="h-8 w-8 text-success" /></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-foreground">Standard</p><p className="text-2xl font-bold text-warning">{users.filter(u => u.role === 'user').length}</p></div><Users className="h-8 w-8 text-warning" /></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-foreground">Recently Added</p><p className="text-2xl font-bold text-info">{Math.min(users.length, 5)}</p></div><Users className="h-8 w-8 text-info" /></div></CardContent></Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {users.map((u) => (
          <Card key={u.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12"><AvatarFallback className="bg-primary-blue text-white font-medium">{getInitials(u.email)}</AvatarFallback></Avatar>
                  <div><h3 className="font-semibold text-foreground">{u.email}</h3><p className="text-sm text-muted-foreground capitalize">{u.role}</p></div>
                </div>
                {getStatusBadge(u.role)}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div><p className="text-sm font-medium text-muted-foreground">Joined</p><p className="text-sm text-foreground">{new Date(u.createdAt).toLocaleDateString()}</p></div>
              <div className="flex gap-2 pt-2"><Button variant="outline" size="sm" className="flex-1"><Mail className="h-4 w-4 mr-1" />Email</Button><Button variant="outline" size="sm" className="flex-1"><Phone className="h-4 w-4 mr-1" />Call</Button></div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
