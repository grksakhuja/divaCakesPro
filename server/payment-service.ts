import crypto from 'crypto';
import { z } from 'zod';

// Touch 'n Go eWallet API Configuration
const TNG_CONFIG = {
  baseUrl: process.env.TNG_BASE_URL || 'https://sandbox-api.tngdigital.com.my', // Use sandbox for testing
  merchantId: process.env.TNG_MERCHANT_ID!,
  secretKey: process.env.TNG_SECRET_KEY!,
  version: '1.0',
  timeout: 30000, // 30 seconds
};

// Request/Response schemas
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

// Utility functions
function generateSignature(params: Record<string, any>, secretKey: string): string {
  // Sort parameters alphabetically
  const sortedKeys = Object.keys(params).sort();
  const queryString = sortedKeys
    .map(key => `${key}=${params[key]}`)
    .join('&');
  
  // Create HMAC-SHA256 signature
  return crypto
    .createHmac('sha256', secretKey)
    .update(queryString)
    .digest('hex')
    .toUpperCase();
}

function generateRequestId(): string {
  return `REQ_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export class TouchNGoPaymentService {
  private baseUrl: string;
  private merchantId: string;
  private secretKey: string;

  constructor() {
    this.baseUrl = TNG_CONFIG.baseUrl;
    this.merchantId = TNG_CONFIG.merchantId;
    this.secretKey = TNG_CONFIG.secretKey;

    if (!this.merchantId || !this.secretKey) {
      throw new Error('Touch n Go credentials not configured. Please set TNG_MERCHANT_ID and TNG_SECRET_KEY environment variables.');
    }
  }

  /**
   * Create a new payment request
   */
  async createPayment(request: z.infer<typeof CreatePaymentRequestSchema>) {
    const validatedRequest = CreatePaymentRequestSchema.parse(request);
    
    const requestId = generateRequestId();
    const timestamp = Math.floor(Date.now() / 1000);
    
    const params = {
      merchantId: this.merchantId,
      version: TNG_CONFIG.version,
      requestId,
      timestamp,
      orderId: validatedRequest.orderId,
      amount: (validatedRequest.amount * 100).toString(), // Convert to cents
      currency: validatedRequest.currency,
      description: validatedRequest.description,
      customerName: validatedRequest.customerName,
      customerEmail: validatedRequest.customerEmail,
      customerPhone: validatedRequest.customerPhone || '',
      redirectUrl: validatedRequest.redirectUrl,
      callbackUrl: validatedRequest.callbackUrl,
    };

    const signature = generateSignature(params, this.secretKey);
    
    try {
      const response = await fetch(`${this.baseUrl}/payment/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Signature': signature,
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`TNG API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        paymentId: data.paymentId,
        paymentUrl: data.paymentUrl,
        qrCode: data.qrCode,
        expiresAt: data.expiresAt,
        requestId,
      };
    } catch (error) {
      console.error('Touch n Go payment creation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check payment status
   */
  async getPaymentStatus(paymentId: string) {
    const requestId = generateRequestId();
    const timestamp = Math.floor(Date.now() / 1000);
    
    const params = {
      merchantId: this.merchantId,
      version: TNG_CONFIG.version,
      requestId,
      timestamp,
      paymentId,
    };

    const signature = generateSignature(params, this.secretKey);
    
    try {
      const response = await fetch(`${this.baseUrl}/payment/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Signature': signature,
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`TNG API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      return PaymentStatusSchema.parse(data);
    } catch (error) {
      console.error('Touch n Go status check failed:', error);
      throw error;
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, receivedSignature: string): boolean {
    const expectedSignature = crypto
      .createHmac('sha256', this.secretKey)
      .update(payload)
      .digest('hex')
      .toUpperCase();
    
    return crypto.timingSafeEqual(
      Buffer.from(receivedSignature),
      Buffer.from(expectedSignature)
    );
  }

  /**
   * Process webhook notification
   */
  processWebhook(payload: any) {
    try {
      return PaymentStatusSchema.parse(payload);
    } catch (error) {
      console.error('Invalid webhook payload:', error);
      throw new Error('Invalid webhook payload');
    }
  }
}

// Export singleton instance
export const touchNGoService = new TouchNGoPaymentService();

// Types
export type CreatePaymentRequest = z.infer<typeof CreatePaymentRequestSchema>;
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;
