import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Download, CheckCircle } from 'lucide-react';

export default function Billing() {

  // Subscription billing history
  const billingHistory = [
    {
      id: '1',
      date: new Date(Date.now() - 30*24*60*60*1000).toISOString(),
      amount: 2900,
      status: 'COMPLETED',
      description: 'Monthly Subscription - Basic Plan'
    },
    {
      id: '2',
      date: new Date(Date.now() - 60*24*60*60*1000).toISOString(),
      amount: 2900,
      status: 'COMPLETED',
      description: 'Monthly Subscription - Basic Plan'
    },
    {
      id: '3',
      date: new Date(Date.now() - 90*24*60*60*1000).toISOString(),
      amount: 2900,
      status: 'COMPLETED',
      description: 'Monthly Subscription - Basic Plan'
    }
  ];



  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };



  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Subscription & Billing</h1>
          <p className="text-muted-foreground">
            Manage your Warehouse Bloom cloud subscription ($29/month)
          </p>
        </div>
      </div>

      {/* Subscription Info */}
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>Your Warehouse Bloom subscription</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">Basic Plan</div>
                <div className="text-muted-foreground">$29/month</div>
              </div>
              <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                Active
              </Badge>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                1,000 items
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                500 orders per month
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                5 team members
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                Real-time analytics
              </div>
            </div>
            <div className="pt-4 border-t">
              <div className="text-sm text-muted-foreground mb-2">Next billing date</div>
              <div className="font-medium">{new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString()}</div>
            </div>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.open(import.meta.env.VITE_POLAR_BILLING_URL, '_blank')}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Manage Subscription on Polar
            </Button>
          </div>
        </CardContent>
      </Card>



      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>
            Your subscription payment history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {billingHistory.map((bill) => (
              <div key={bill.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <div className="font-medium">{bill.description}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(bill.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(bill.amount)}</div>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      {bill.status}
                    </Badge>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}