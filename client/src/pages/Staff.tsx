import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, Plus, Mail, Phone } from "lucide-react";

const staffData = [
  {
    id: "EMP-001",
    name: "John Doe",
    role: "Warehouse Manager",
    department: "Operations",
    email: "john.doe@company.com",
    phone: "+1 (555) 123-4567",
    status: "Active",
    startDate: "2022-03-15",
    shift: "Day Shift"
  },
  {
    id: "EMP-002",
    name: "Sarah Smith",
    role: "Inventory Specialist",
    department: "Inventory",
    email: "sarah.smith@company.com",
    phone: "+1 (555) 234-5678",
    status: "Active",
    startDate: "2023-01-20",
    shift: "Day Shift"
  },
  {
    id: "EMP-003",
    name: "Mike Johnson",
    role: "Forklift Operator",
    department: "Operations",
    email: "mike.johnson@company.com",
    phone: "+1 (555) 345-6789",
    status: "Active",
    startDate: "2023-06-10",
    shift: "Night Shift"
  },
  {
    id: "EMP-004",
    name: "Lisa Chen",
    role: "Quality Inspector",
    department: "Quality Control",
    email: "lisa.chen@company.com",
    phone: "+1 (555) 456-7890",
    status: "On Leave",
    startDate: "2022-11-05",
    shift: "Day Shift"
  }
];

export default function Staff() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <Badge variant="outline" className="border-success text-success bg-success/10">Active</Badge>;
      case "On Leave":
        return <Badge variant="outline" className="border-warning text-warning bg-warning/10">On Leave</Badge>;
      case "Inactive":
        return <Badge variant="outline" className="border-muted text-muted-foreground bg-muted/10">Inactive</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Staff Management</h1>
          <p className="text-muted-foreground">Manage warehouse staff and team members.</p>
        </div>
        <Button className="bg-primary-blue hover:bg-primary-blue-dark">
          <Plus className="h-4 w-4 mr-2" />
          Add Staff Member
        </Button>
      </div>

      {/* Staff Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Staff</p>
                <p className="text-2xl font-bold">24</p>
              </div>
              <Users className="h-8 w-8 text-primary-blue" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-success">22</p>
              </div>
              <Users className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">On Leave</p>
                <p className="text-2xl font-bold text-warning">2</p>
              </div>
              <Users className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Day Shift</p>
                <p className="text-2xl font-bold text-info">18</p>
              </div>
              <Users className="h-8 w-8 text-info" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Staff Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {staffData.map((staff) => (
          <Card key={staff.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary-blue text-white font-medium">
                      {getInitials(staff.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-foreground">{staff.name}</h3>
                    <p className="text-sm text-muted-foreground">{staff.role}</p>
                  </div>
                </div>
                {getStatusBadge(staff.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Department</p>
                <p className="text-sm text-foreground">{staff.department}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Shift</p>
                <p className="text-sm text-foreground">{staff.shift}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Start Date</p>
                <p className="text-sm text-foreground">{staff.startDate}</p>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Mail className="h-4 w-4 mr-1" />
                  Email
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Phone className="h-4 w-4 mr-1" />
                  Call
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
