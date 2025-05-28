// Mock Touch 'n Go Payment Service for Testing
import { z } from 'zod';

const CreatePaymentRequestSchema = z.object({
  orderId: z.string(),
  amount: z.number().positive(),
  currency: z.string().default('MYR'),
  description: z.string(),
  customerName: z.string(),
  customerEmail: z.string().email(),
  customerPhone: z.string().optional(),
  redirectUrl: z.string().url(),
  callbackUrl: z.string().url(),
});

const PaymentStatusSchema = z.object({
  paymentId: z.string(),
  status: z.enum(['pending', 'processing', 'success', 'failed', 'cancelled']),
  amount: z.number(),
  currency: z.string(),
  transactionId: z.string().optional(),
  failureReason: z.string().optional(),
});

// Mock payment storage for testing
const mockPayments = new Map<string, any>();

export class MockTouchNGoPaymentService {
  /**
   * Create a mock payment request
   */
  async createPayment(request: z.infer<typeof CreatePaymentRequestSchema>) {
    const validatedRequest = CreatePaymentRequestSchema.parse(request);
    
    console.log('🧪 DEMO MODE: Creating mock Touch n Go payment');
    console.log('📊 Payment Details:', {
      orderId: validatedRequest.orderId,
      amount: `RM ${validatedRequest.amount.toFixed(2)}`,
      customer: validatedRequest.customerName,
    });
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockPaymentId = `TNG_DEMO_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes
    
    // Store mock payment data
    mockPayments.set(mockPaymentId, {
      paymentId: mockPaymentId,
      orderId: validatedRequest.orderId,
      amount: validatedRequest.amount,
      status: 'pending',
      createdAt: new Date().toISOString(),
      expiresAt,
    });
    
    // Generate mock QR code (base64 encoded simple QR placeholder)
    const mockQrCode = `data:image/svg+xml;base64,${btoa(`
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="white"/>
        <rect x="20" y="20" width="20" height="20" fill="black"/>
        <rect x="60" y="20" width="20" height="20" fill="black"/>
        <rect x="100" y="20" width="20" height="20" fill="black"/>
        <rect x="140" y="20" width="20" height="20" fill="black"/>
        <rect x="20" y="60" width="20" height="20" fill="black"/>
        <rect x="100" y="60" width="20" height="20" fill="black"/>
        <rect x="160" y="60" width="20" height="20" fill="black"/>
        <rect x="40" y="100" width="20" height="20" fill="black"/>
        <rect x="80" y="100" width="20" height="20" fill="black"/>
        <rect x="120" y="100" width="20" height="20" fill="black"/>
        <rect x="160" y="100" width="20" height="20" fill="black"/>
        <rect x="20" y="140" width="20" height="20" fill="black"/>
        <rect x="60" y="140" width="20" height="20" fill="black"/>
        <rect x="140" y="140" width="20" height="20" fill="black"/>
        <text x="100" y="190" text-anchor="middle" font-size="12" fill="black">DEMO QR CODE</text>
      </svg>
    `)}`;
    
    const mockPaymentUrl = `touchngo://pay?paymentId=${mockPaymentId}&amount=${validatedRequest.amount}`;
    
    return {
      success: true,
      paymentId: mockPaymentId,
      paymentUrl: mockPaymentUrl,
      qrCode: mockQrCode,
      expiresAt,
      requestId: `DEMO_REQ_${Date.now()}`,
    };
  }

  /**
   * Get mock payment status with simulated state changes
   */
  async getPaymentStatus(paymentId: string) {
    console.log('🧪 DEMO MODE: Checking payment status for', paymentId);
    
    const payment = mockPayments.get(paymentId);
    if (!payment) {
      throw new Error('Payment not found');
    }
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Simulate payment progression over time
    const createdTime = new Date(payment.createdAt).getTime();
    const currentTime = Date.now();
    const elapsedSeconds = (currentTime - createdTime) / 1000;
    
    let status = payment.status;
    let transactionId: string | undefined;
    
    // Simulate payment states over time
    if (elapsedSeconds > 10 && status === 'pending') {
      status = 'processing';
      mockPayments.set(paymentId, { ...payment, status });
    }
    
    if (elapsedSeconds > 20 && status === 'processing') {
      // 80% chance of success, 20% chance of failure for demo
      status = Math.random() > 0.2 ? 'success' : 'failed';
      transactionId = status === 'success' ? `TXN_${Date.now()}` : undefined;
      mockPayments.set(paymentId, { ...payment, status, transactionId });
    }
    
    console.log('📊 Payment Status:', { paymentId, status, elapsed: `${elapsedSeconds.toFixed(1)}s` });
    
    return PaymentStatusSchema.parse({
      paymentId,
      status,
      amount: payment.amount,
      currency: 'MYR',
      transactionId,
      failureReason: status === 'failed' ? 'Simulated failure for demo' : undefined,
    });
  }

  /**
   * Mock webhook signature verification (always returns true in demo mode)
   */
  verifyWebhookSignature(payload: string, receivedSignature: string): boolean {
    console.log('🧪 DEMO MODE: Mock webhook signature verification (always passes)');
    return true;
  }

  /**
   * Process mock webhook notification
   */
  processWebhook(payload: any) {
    console.log('🧪 DEMO MODE: Processing mock webhook', payload);
    return PaymentStatusSchema.parse(payload);
  }
}

// Export singleton instance
export const mockTouchNGoService = new MockTouchNGoPaymentService();

// Types
export type CreatePaymentRequest = z.infer<typeof CreatePaymentRequestSchema>;
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;
