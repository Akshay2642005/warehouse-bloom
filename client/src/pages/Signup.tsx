import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { registerUser } from '@/api/auth';
import { useToast } from '@/hooks/use-toast';
import { Badge } from "@/components/ui/badge";

export default function Signup() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const signupMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      if (data.payment?.checkoutUrl) {
        setPaymentUrl(data.payment.checkoutUrl);
        toast({ 
          title: "Account Created", 
          description: "Please complete payment to activate your account." 
        });
      } else {
        toast({ title: "Success", description: "Account created successfully! Please login." });
        navigate('/login');
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Registration failed",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }

    signupMutation.mutate({
      email: formData.email,
      password: formData.password
    });
  };

  if (paymentUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Complete Payment</CardTitle>
            <p className="text-center text-muted-foreground">Activate your Warehouse Bloom account</p>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p>Your account has been created! Complete payment to activate it.</p>
            <Button 
              onClick={() => window.open(paymentUrl, '_blank')}
              className="w-full"
            >
              Complete Payment
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/login')}
              className="w-full"
            >
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Create Account</CardTitle>
          <p className="text-center text-muted-foreground">Join Warehouse Bloom</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                required
                minLength={8}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                required
                minLength={8}
              />
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h3 className="font-semibold text-blue-900 mb-2">Warehouse Bloom - $29/month</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  1,000 items
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  500 orders per month
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  5 team members
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Real-time analytics
                </li>
              </ul>
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={signupMutation.isPending}
            >
              {signupMutation.isPending ? 'Creating Account...' : 'Sign Up'}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}