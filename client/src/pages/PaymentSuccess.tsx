import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const checkoutId = searchParams.get('checkout_id');

  useEffect(() => {
    if (checkoutId) {
      // Handle payment success
      toast({
        title: "Payment Successful!",
        description: "Your account has been activated. You can now login.",
      });
    }
  }, [checkoutId, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-600">Payment Successful!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Your Warehouse Bloom account has been activated successfully. 
            You can now login and start managing your inventory.
          </p>
          
          {checkoutId && (
            <p className="text-sm text-muted-foreground">
              Transaction ID: {checkoutId}
            </p>
          )}
          
          <div className="space-y-2">
            <Button 
              onClick={() => navigate('/login')}
              className="w-full"
            >
              Go to Login
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/')}
              className="w-full"
            >
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}