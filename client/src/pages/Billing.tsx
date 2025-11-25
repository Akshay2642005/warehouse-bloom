import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

const Billing = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Billing & Subscription</h2>
        <p className="text-muted-foreground">Manage your subscription plan and billing details.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Free Plan */}
        <Card>
          <CardHeader>
            <CardTitle>Free</CardTitle>
            <CardDescription>For small teams just getting started.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$0<span className="text-sm font-normal text-muted-foreground">/month</span></div>
            <ul className="mt-4 space-y-2">
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Up to 5 members</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> 100 items limit</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Basic analytics</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full" variant="outline" disabled>Current Plan</Button>
          </CardFooter>
        </Card>

        {/* Pro Plan */}
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Pro</CardTitle>
            <CardDescription>For growing businesses.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$29<span className="text-sm font-normal text-muted-foreground">/month</span></div>
            <ul className="mt-4 space-y-2">
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Unlimited members</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Unlimited items</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Advanced analytics</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Priority support</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full">Upgrade to Pro</Button>
          </CardFooter>
        </Card>

        {/* Enterprise Plan */}
        <Card>
          <CardHeader>
            <CardTitle>Enterprise</CardTitle>
            <CardDescription>For large organizations.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">Custom</div>
            <ul className="mt-4 space-y-2">
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Dedicated support</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> SLA</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Custom integrations</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full" variant="outline">Contact Sales</Button>
          </CardFooter>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>Manage your payment details.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-10 w-16 bg-muted rounded flex items-center justify-center">VISA</div>
              <div>
                <p className="font-medium">Visa ending in 4242</p>
                <p className="text-sm text-muted-foreground">Expires 12/2025</p>
              </div>
            </div>
            <Button variant="ghost">Edit</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>View your past invoices.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                <div>
                  <p className="font-medium">Invoice #{1000 + i}</p>
                  <p className="text-sm text-muted-foreground">Oct {i}, 2023</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-medium">$29.00</span>
                  <Badge variant="outline" className="text-green-500 border-green-500">Paid</Badge>
                  <Button variant="ghost" size="sm">Download</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Billing;
