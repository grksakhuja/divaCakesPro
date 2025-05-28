import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QrCode, Smartphone, Clock, CheckCircle, XCircle, RotateCcw, FlaskConical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { DemoAlert } from '@/components/demo-banner';

interface PaymentProcessorProps {
  orderId: number;
  totalAmount: number;
  onPaymentSuccess: () => void;
  onPaymentCancel: () => void;
}

interface PaymentResponse {
  success: boolean;
  paymentId: string;
  paymentUrl: string;
  qrCode?: string;
  expiresAt: string;
  demoMode?: boolean;
  message?: string;
}

interface PaymentStatus {
  paymentId: string;
  status: 'pending' | 'processing' | 'success' | 'failed' | 'cancelled';
  amount: number;
  transactionId?: string;
  demoMode?: boolean;
}

export default function PaymentProcessor({ 
  orderId, 
  totalAmount, 
  onPaymentSuccess, 
  onPaymentCancel 
}: PaymentProcessorProps) {
  const [paymentData, setPaymentData] = useState<PaymentResponse | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [statusPollingEnabled, setStatusPollingEnabled] = useState(false);

  // Create payment mutation
  const createPaymentMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest(`/api/orders/${orderId}/payment`, 'POST');
      return response.json();
    },
    onSuccess: (data: PaymentResponse) => {
      setPaymentData(data);
      setStatusPollingEnabled(true);
      
      // Calculate time left (usually 15 minutes)
      const expiresAt = new Date(data.expiresAt).getTime();
      const now = Date.now();
      setTimeLeft(Math.max(0, Math.floor((expiresAt - now) / 1000)));
    }
  });

  // Poll payment status
  const { data: paymentStatus } = useQuery({
    queryKey: [`/api/payments/${paymentData?.paymentId}/status`],
    queryFn: async () => {
      const response = await apiRequest(`/api/payments/${paymentData?.paymentId}/status`, 'GET');
      return response.json() as PaymentStatus;
    },
    enabled: statusPollingEnabled && !!paymentData?.paymentId,
    refetchInterval: 3000, // Poll every 3 seconds
  });

  // Handle payment status changes
  useEffect(() => {
    if (paymentStatus) {
      if (paymentStatus.status === 'success') {
        setStatusPollingEnabled(false);
        onPaymentSuccess();
      } else if (paymentStatus.status === 'failed' || paymentStatus.status === 'cancelled') {
        setStatusPollingEnabled(false);
      }
    }
  }, [paymentStatus, onPaymentSuccess]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && paymentData) {
      setStatusPollingEnabled(false);
    }
  }, [timeLeft, paymentData]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRetryPayment = () => {
    setPaymentData(null);
    setStatusPollingEnabled(false);
    createPaymentMutation.mutate();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Waiting for Payment</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800"><RotateCcw className="w-3 h-3 mr-1 animate-spin" />Processing</Badge>;
      case 'success':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Payment Successful</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Payment Failed</Badge>;
      case 'cancelled':
        return <Badge variant="secondary"><XCircle className="w-3 h-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge variant="outline">Unknown Status</Badge>;
    }
  };

  // Check if we're in demo mode
  const isDemoMode = paymentData?.demoMode || paymentStatus?.demoMode;

  return (
    <div className="space-y-6">
      {/* Demo Mode Alert */}
      {isDemoMode && (
        <DemoAlert />
      )}
      
      <AnimatePresence mode="wait">
        {/* Initial Payment Creation */}
        {!paymentData && (
          <motion.div
            key="create-payment"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-center">
                  <Smartphone className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  Touch 'n Go eWallet Payment
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="text-lg">
                  Total Amount: <span className="font-bold text-2xl text-blue-600">RM {(totalAmount / 100).toFixed(2)}</span>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    You'll be redirected to Touch 'n Go eWallet to complete your payment securely.
                  </p>
                </div>

                <div className="space-y-3">
                  <Button 
                    onClick={() => createPaymentMutation.mutate()}
                    disabled={createPaymentMutation.isPending}
                    className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700"
                  >
                    {createPaymentMutation.isPending ? (
                      <>
                        <RotateCcw className="w-5 h-5 mr-2 animate-spin" />
                        Creating Payment...
                      </>
                    ) : (
                      <>
                        <Smartphone className="w-5 h-5 mr-2" />
                        Pay with Touch 'n Go
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={onPaymentCancel}
                    className="w-full"
                  >
                    Cancel & Go Back
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Payment Created - Show QR Code or Redirect */}
        {paymentData && !paymentStatus?.status && (
          <motion.div
            key="payment-pending"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-center">
                  <QrCode className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  Complete Your Payment
                  {isDemoMode && <FlaskConical className="w-5 h-5 inline-block ml-2 text-orange-500" />}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <div className="text-lg font-semibold mb-2">RM {(totalAmount / 100).toFixed(2)}</div>
                  <div className="text-sm text-blue-800">Order #{orderId}</div>
                  {isDemoMode && (
                    <div className="text-xs text-orange-600 mt-2 font-medium">
                      🧪 Demo Mode - No real payment required
                    </div>
                  )}
                </div>

                {paymentData.qrCode && (
                  <div className="flex justify-center">
                    <img 
                      src={paymentData.qrCode} 
                      alt="Touch 'n Go QR Code" 
                      className="w-48 h-48 border-2 border-gray-200 rounded-lg"
                    />
                  </div>
                )}

                <div className="space-y-4">
                  <div className="text-sm text-gray-600">
                    {isDemoMode 
                      ? "This is a demo QR code. In demo mode, payment will automatically succeed after 20 seconds."
                      : "Scan the QR code with your Touch 'n Go eWallet app or click the button below"
                    }
                  </div>

                  <Button 
                    onClick={() => window.open(paymentData.paymentUrl, '_blank')}
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700"
                  >
                    <Smartphone className="w-5 h-5 mr-2" />
                    {isDemoMode ? 'Demo Touch \'n Go App' : 'Open Touch \'n Go App'}
                  </Button>

                  {timeLeft > 0 && (
                    <div className="flex items-center justify-center space-x-2 text-sm text-orange-600">
                      <Clock className="w-4 h-4" />
                      <span>
                        {isDemoMode 
                          ? `Demo payment expires in ${formatTime(timeLeft)}`
                          : `Payment expires in ${formatTime(timeLeft)}`
                        }
                      </span>
                    </div>
                  )}
                </div>

                <Button 
                  variant="outline" 
                  onClick={onPaymentCancel}
                >
                  Cancel Payment
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Payment Status Updates */}
        {paymentStatus && (
          <motion.div
            key="payment-status"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-center flex items-center justify-center">
                  {getStatusBadge(paymentStatus.status)}
                  {isDemoMode && <FlaskConical className="w-4 h-4 ml-2 text-orange-500" />}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="text-lg">
                  Amount: RM {paymentStatus.amount.toFixed(2)}
                </div>
                
                {paymentStatus.transactionId && (
                  <div className="text-sm text-gray-600">
                    Transaction ID: {paymentStatus.transactionId}
                    {isDemoMode && <span className="text-orange-600 ml-2">(Demo)</span>}
                  </div>
                )}

                {paymentStatus.status === 'success' && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    <p className="text-green-800 font-semibold">Payment Successful!</p>
                    <p className="text-sm text-green-700 mt-1">
                      {isDemoMode 
                        ? "Demo payment completed! Your order has been confirmed."
                        : "Your order has been confirmed and we'll start preparing your cake."
                      }
                    </p>
                  </div>
                )}

                {(paymentStatus.status === 'failed' || paymentStatus.status === 'cancelled') && (
                  <div className="space-y-4">
                    <div className="bg-red-50 p-4 rounded-lg">
                      <XCircle className="w-8 h-8 mx-auto mb-2 text-red-600" />
                      <p className="text-red-800 font-semibold">
                        {paymentStatus.status === 'failed' ? 'Payment Failed' : 'Payment Cancelled'}
                        {isDemoMode && ' (Demo)'}
                      </p>
                      <p className="text-sm text-red-700 mt-1">
                        {isDemoMode 
                          ? 'This is a simulated payment failure for demo purposes.'
                          : paymentStatus.status === 'failed' 
                            ? 'There was an issue processing your payment. Please try again.'
                            : 'The payment was cancelled. You can try again or choose a different payment method.'
                        }
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Button 
                        onClick={handleRetryPayment}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        {isDemoMode ? 'Try Demo Again' : 'Try Again'}
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        onClick={onPaymentCancel}
                        className="w-full"
                      >
                        Choose Different Payment Method
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
