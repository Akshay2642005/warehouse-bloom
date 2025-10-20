import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreditCard, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useToast } from '@/hooks/use-toast';
import { paymentsApi } from '@/api/payments';

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: {
    id: string;
    orderNumber: string;
    totalCents: number;
    status: string;
  };
}

export function PaymentDialog({ open, onOpenChange, order }: PaymentDialogProps) {
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createPaymentMutation = useMutation({
    mutationFn: paymentsApi.createPayment,
    onSuccess: (data) => {
      if (data.paymentUrl) {
        setPaymentUrl(data.paymentUrl);
        // Open payment URL in new window
        window.open(data.paymentUrl, '_blank', 'width=600,height=700');
      }
      toast({
        title: "Payment initiated",
        description: "Complete your payment in the new window.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Payment failed",
        description: error.response?.data?.message || "Failed to create payment",
        variant: "destructive",
      });
    }
  });

  const handleCreatePayment = () => {
    createPaymentMutation.mutate({
      orderId: order.id,
      amount: order.totalCents,
      currency: 'USD',
      description: `Payment for order ${order.orderNumber}`,
      metadata: {
        orderNumber: order.orderNumber
      }
    });
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Process Payment
          </DialogTitle>
          <DialogDescription>
            Complete payment for order {order.orderNumber}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Order Number:</span>
              <span className="font-medium">{order.orderNumber}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Status:</span>
              <Badge variant={order.status === 'PENDING' ? 'secondary' : 'default'}>
                {order.status}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Amount:</span>
              <span className="font-bold text-lg">{formatCurrency(order.totalCents)}</span>
            </div>
          </div>

          {paymentUrl ? (
            <div className="text-center space-y-3">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
              <p className="text-sm text-gray-600">
                Payment window opened. Complete your payment and return here.
              </p>
              <Button
                variant="outline"
                onClick={() => window.open(paymentUrl, '_blank')}
                className="w-full"
              >
                Reopen Payment Window
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-blue-50 p-3 rounded border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Secure Payment:</strong> You'll be redirected to Polar's secure payment page to complete your transaction.
                </p>
              </div>
              
              <Button
                onClick={handleCreatePayment}
                disabled={createPaymentMutation.isPending}
                className="w-full"
              >
                {createPaymentMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Payment...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Pay {formatCurrency(order.totalCents)}
                  </>
                )}
              </Button>
            </div>
          )}

          <div className="text-xs text-gray-500 text-center">
            Payments are processed securely by Polar. Your payment information is never stored on our servers.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}