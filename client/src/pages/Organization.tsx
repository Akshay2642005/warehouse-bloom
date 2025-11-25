import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@/contexts/UserContext";
import { useOrganizationStore } from "@/stores/organization.store";
import { createOrganization, fetchOrganizationMembers } from "@/api/organizations";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from 'react-router-dom';
import { Member } from "@/types";

const Organization = () => {
  const { user } = useUser();
  const { activeOrgId, organizations, setActiveOrg, setOrganizations } = useOrganizationStore();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('general');
  const [members, setMembers] = useState<Member[]>([]);
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgSlug, setNewOrgSlug] = useState('');

  const activeOrg = organizations.find(o => o.id === activeOrgId);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    if (activeOrgId) {
      fetchOrganizationMembers(activeOrgId).then(setMembers).catch(console.error);
    }
  }, [activeOrgId]);

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newOrg = await createOrganization({ name: newOrgName, slug: newOrgSlug });
      setOrganizations([...organizations, newOrg]);
      setActiveOrg(newOrg.id);
      toast({ title: "Success", description: "Organization created successfully" });
      setNewOrgName('');
      setNewOrgSlug('');
      setActiveTab('general');
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.message || "Failed to create organization", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Organization</h2>
        <p className="text-muted-foreground">Manage your organization settings and members.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="create">Create New</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Organization Details</CardTitle>
              <CardDescription>Update your organization's public information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeOrg ? (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" defaultValue={activeOrg.name} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="slug">Slug</Label>
                    <Input id="slug" defaultValue={activeOrg.slug} disabled />
                  </div>
                  <Button>Save Changes</Button>
                </>
              ) : (
                <div className="text-center py-4">No organization selected. Please create one.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Members</CardTitle>
              <CardDescription>Manage who has access to your organization.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Input placeholder="Search members..." className="max-w-sm" />
                  <Button>Invite Member</Button>
                </div>
                <div className="rounded-md border">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={member.user?.image} />
                          <AvatarFallback>{member.user?.name?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.user?.name}</p>
                          <p className="text-sm text-muted-foreground">{member.user?.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{member.role}</span>
                        <Button variant="ghost" size="sm">Manage</Button>
                      </div>
                    </div>
                  ))}
                  {members.length === 0 && <div className="p-4 text-center text-muted-foreground">No members found</div>}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create Organization</CardTitle>
              <CardDescription>Start a new organization to manage inventory.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateOrg} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="newName">Organization Name</Label>
                  <Input id="newName" value={newOrgName} onChange={(e) => setNewOrgName(e.target.value)} placeholder="Acme Inc." required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="newSlug">Slug (URL Identifier)</Label>
                  <Input id="newSlug" value={newOrgSlug} onChange={(e) => setNewOrgSlug(e.target.value)} placeholder="acme-inc" required />
                </div>
                <Button type="submit">Create Organization</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Danger Zone</CardTitle>
              <CardDescription>Irreversible actions.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive">Delete Organization</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Organization;
