# 🎂 CakeCraftPro Touch 'n Go Payment Integration - Complete Guide

**A comprehensive Touch 'n Go eWallet payment system for your custom cake ordering platform**

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Quick Demo Testing](#quick-demo-testing)
3. [File Structure](#file-structure)
4. [Implementation Details](#implementation-details)
5. [Production Setup](#production-setup)
6. [API Documentation](#api-documentation)
7. [Frontend Components](#frontend-components)
8. [Database Schema](#database-schema)
9. [Environment Configuration](#environment-configuration)
10. [Switching Between Modes](#switching-between-modes)
11. [Troubleshooting](#troubleshooting)
12. [Deployment Guide](#deployment-guide)

---

## 🎯 Overview

This implementation adds a complete Touch 'n Go eWallet payment system to your CakeCraftPro application with:

### ✅ **What's Included**

- **Complete Payment Flow** - 11-step cake builder with payment processing
- **Touch 'n Go Integration** - Real API integration with QR codes and app redirects
- **Demo Mode** - Full testing without external dependencies
- **Database Integration** - Payment tracking and order management
- **Mobile-First UI** - Responsive payment interface
- **Real-time Updates** - Payment status polling and webhooks
- **Error Handling** - Comprehensive retry and failure scenarios
- **Admin Integration** - Payment management in admin panel

### 🧪 **Demo Mode Features**

- **Zero Setup Testing** - No database or credentials needed
- **Realistic Simulation** - Complete payment flow with mock data
- **Visual Indicators** - Clear demo mode markers
- **Random Outcomes** - Success/failure testing scenarios
- **In-Memory Storage** - No external dependencies

### 💳 **Production Features**

- **Real Touch 'n Go API** - Live payment processing
- **Webhook Integration** - Real-time payment notifications  
- **Database Persistence** - Full payment and order tracking
- **Security** - HMAC signature verification and secure storage
- **Scalability** - Production-ready architecture

---

## 🚀 Quick Demo Testing

### **Option 1: One-Command Setup**
```bash
npm run demo      # Sets up demo environment
npm run dev       # Starts application
```

### **Option 2: Manual Setup**
```bash
cp .env.example .env    # DEMO_MODE=true already set
npm install
npm run dev
```

### **Option 3: Force Demo Mode**
```bash
npm run demo:start      # Starts with demo enabled
```

### **🧪 Testing the Flow**

1. **Visit** `http://localhost:5000`
2. **Build a cake** through customization steps (1-8)
3. **Select Touch 'n Go** as payment method (step 9)
4. **Review order** summary (step 10)
5. **Complete payment** and watch demo flow (step 11)

**Look for demo indicators:**
- 🧪 Orange "DEMO MODE" banner
- Mock QR codes with "DEMO QR CODE" text
- Demo badges and console messages
- Automatic payment success after ~20 seconds

---

## 📁 File Structure

### **New Files Created**

```
CakeCraftPro-Railway/
├── server/
│   ├── payment-service.ts           # Real Touch 'n Go API integration
│   ├── mock-payment-service.ts      # Demo mode simulation
│   ├── demo-config.ts               # Demo mode configuration
│   └── migrate-payments.ts          # Database migration script
├── client/src/components/
│   ├── payment-method-selector.tsx  # Payment method selection UI
│   ├── payment-processor.tsx        # Payment processing interface
│   └── demo-banner.tsx              # Demo mode indicators
├── shared/
│   └── schema.ts                    # Updated with payment tables
├── .env.example                     # Environment template
├── setup-demo.sh                   # Demo setup script
├── TOUCHNGO-INTEGRATION.md          # Production setup guide
├── DEMO-MODE-TESTING.md             # Demo testing guide
├── DEMO-TESTING-README.md           # Quick demo instructions
└── PAYMENT-INTEGRATION-GUIDE.md    # This comprehensive guide
```

### **Modified Files**

```
├── server/
│   ├── routes.ts                    # Added payment endpoints
│   ├── storage.ts                   # Added payment methods
│   └── index.ts                     # Demo mode integration
├── client/src/pages/
│   └── cake-builder.tsx             # Extended to 11 steps with payments
├── package.json                     # Added demo scripts
└── shared/schema.ts                 # Added payment tables
```

---

## 🛠️ Implementation Details

### **Backend Architecture**

#### **Payment Service (`payment-service.ts`)**
```typescript
export class TouchNGoPaymentService {
  // Create payment with Touch 'n Go API
  async createPayment(request: CreatePaymentRequest)
  
  // Check payment status
  async getPaymentStatus(paymentId: string)
  
  // Verify webhook signatures
  verifyWebhookSignature(payload: string, signature: string): boolean
  
  // Process webhook notifications
  processWebhook(payload: any)
}
```

#### **Mock Service (`mock-payment-service.ts`)**
```typescript
export class MockTouchNGoPaymentService {
  // Simulate payment creation with fake QR codes
  async createPayment(request: CreatePaymentRequest)
  
  // Simulate status progression over time
  async getPaymentStatus(paymentId: string)
  
  // Mock webhook verification (always passes)
  verifyWebhookSignature(payload: string, signature: string): boolean
}
```

#### **Demo Configuration (`demo-config.ts`)**
```typescript
export const DEMO_MODE = process.env.DEMO_MODE === 'true' || process.env.NODE_ENV === 'development';

export const demoConfig = {
  enableMockPayments: DEMO_MODE,
  simulatePaymentDelay: true,
  mockPaymentSuccessRate: 0.8, // 80% success rate
};
```

### **Frontend Architecture**

#### **Payment Method Selector**
- Radio button selection between cash, Touch 'n Go, and card
- Visual pricing and recommendation indicators
- Mobile-optimized touch interface

#### **Payment Processor**
- Multi-step payment flow with animations
- QR code display and app redirect functionality
- Real-time status polling every 3 seconds
- Error handling with retry mechanisms

#### **Cake Builder Extension**
- Extended from 9 to 11 steps
- Integrated payment method selection
- Payment processing step
- Order confirmation flow

### **Database Schema**

#### **Payments Table**
```sql
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES cake_orders(id),
  payment_method TEXT NOT NULL,
  payment_provider TEXT NOT NULL,
  payment_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'MYR',
  status TEXT DEFAULT 'pending',
  provider_response JSON,
  webhook_data JSON,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

#### **Extended Cake Orders**
```sql
ALTER TABLE cake_orders 
ADD COLUMN payment_method TEXT DEFAULT 'cash',
ADD COLUMN payment_status TEXT DEFAULT 'pending',
ADD COLUMN payment_id TEXT,
ADD COLUMN payment_url TEXT,
ADD COLUMN payment_completed_at TEXT;
```

---

## 🏭 Production Setup

### **1. Get Touch 'n Go Credentials**

1. **Visit** [Touch 'n Go Developer Portal](https://developer.tngdigital.com.my/)
2. **Create** developer account
3. **Apply** for merchant account
4. **Obtain** credentials:
   - Merchant ID
   - Secret Key
   - API access

### **2. Environment Configuration**

Create production `.env`:

```env
# Production Mode
NODE_ENV=production
DEMO_MODE=false

# Database
DATABASE_URL="postgresql://user:pass@host:5432/database"

# Touch 'n Go Production
TNG_BASE_URL="https://api.tngdigital.com.my"
TNG_MERCHANT_ID="your_production_merchant_id"
TNG_SECRET_KEY="your_production_secret_key"
BASE_URL="https://yourdomain.com"

# Security
ADMIN_USERNAME="secure_admin_username"
ADMIN_PASSWORD="secure_admin_password"

# Email Service
BREVO_API_KEY="your_brevo_key"
SENDGRID_API_KEY="your_sendgrid_key"
```

### **3. Database Migration**

```bash
# Push schema changes
npm run db:push

# Run payment migration
npm run db:migrate-payments

# Verify migration
npm run db:seed
```

### **4. Webhook Configuration**

Configure webhook URL in Touch 'n Go merchant portal:
```
https://yourdomain.com/api/payments/webhook
```

### **5. SSL Certificate**

Ensure HTTPS is configured for:
- Webhook security
- Payment page security
- Customer trust

---

## 📡 API Documentation

### **Payment Endpoints**

#### **Create Payment**
```http
POST /api/orders/:id/payment
Content-Type: application/json

Response:
{
  "success": true,
  "paymentId": "TNG_12345",
  "paymentUrl": "touchngo://pay?id=12345",
  "qrCode": "data:image/png;base64,iVBOR...",
  "expiresAt": "2024-01-01T12:00:00Z"
}
```

#### **Check Payment Status**
```http
GET /api/payments/:paymentId/status

Response:
{
  "paymentId": "TNG_12345",
  "status": "success",
  "amount": 45.00,
  "transactionId": "TXN_67890"
}
```

#### **Webhook Notification**
```http
POST /api/payments/webhook
Content-Type: application/json
X-Signature: HMAC-SHA256-SIGNATURE

{
  "paymentId": "TNG_12345",
  "status": "success",
  "amount": 45.00,
  "transactionId": "TXN_67890"
}
```

#### **Payment Success Redirect**
```http
GET /payment/success?orderId=123
Redirects to: /?payment=success&orderId=123
```

### **Payment States**

- **`pending`** - Payment created, waiting for customer
- **`processing`** - Customer initiated payment
- **`success`** - Payment completed successfully
- **`failed`** - Payment failed or declined
- **`cancelled`** - Payment cancelled by customer

---

## 🎨 Frontend Components

### **PaymentMethodSelector Component**

```typescript
interface PaymentMethodSelectorProps {
  selectedMethod: 'cash' | 'touchngo' | 'card';
  onMethodChange: (method: 'cash' | 'touchngo' | 'card') => void;
  totalAmount: number;
}
```

**Features:**
- Visual payment method cards
- Pricing information display
- Mobile-optimized selection
- Recommendation badges

### **PaymentProcessor Component**

```typescript
interface PaymentProcessorProps {
  orderId: number;
  totalAmount: number;
  onPaymentSuccess: () => void;
  onPaymentCancel: () => void;
}
```

**Features:**
- Multi-step payment flow
- QR code display
- Real-time status updates
- Error handling and retry
- Demo mode indicators

### **Updated CakeBuilder Flow**

1. **Welcome & Size Selection** (Step 1)
2. **Layer Configuration** (Step 2)
3. **Flavor Selection** (Step 3)
4. **Icing & Decorations** (Step 4)
5. **Custom Message** (Step 5)
6. **Dietary Preferences** (Step 6)
7. **Size & Servings** (Step 7)
8. **Customer Information** (Step 8)
9. **Payment Method Selection** (Step 9) ← NEW
10. **Order Summary** (Step 10) ← UPDATED
11. **Payment Processing** (Step 11) ← NEW

---

## ⚙️ Environment Configuration

### **Demo Mode (.env)**
```env
DEMO_MODE=true
NODE_ENV=development
PORT=5000
BASE_URL=http://localhost:5000
```

### **Sandbox Testing (.env)**
```env
DEMO_MODE=false
NODE_ENV=development
TNG_BASE_URL=https://sandbox-api.tngdigital.com.my
TNG_MERCHANT_ID=sandbox_merchant_id
TNG_SECRET_KEY=sandbox_secret_key
DATABASE_URL=postgresql://localhost:5432/cakecraft_dev
```

### **Production (.env)**
```env
DEMO_MODE=false
NODE_ENV=production
TNG_BASE_URL=https://api.tngdigital.com.my
TNG_MERCHANT_ID=production_merchant_id
TNG_SECRET_KEY=production_secret_key
DATABASE_URL=postgresql://prod-host:5432/cakecraft_prod
BASE_URL=https://yourdomain.com
```

---

## 🔄 Switching Between Modes

### **Demo → Sandbox Testing**
```bash
# Update .env
echo "DEMO_MODE=false" > .env
echo "TNG_BASE_URL=https://sandbox-api.tngdigital.com.my" >> .env
echo "TNG_MERCHANT_ID=your_sandbox_id" >> .env
echo "TNG_SECRET_KEY=your_sandbox_key" >> .env

# Run migration
npm run db:migrate-payments

# Restart
npm run dev
```

### **Sandbox → Production**
```bash
# Update .env
sed -i 's/sandbox-api/api/' .env
sed -i 's/sandbox_merchant_id/production_merchant_id/' .env
sed -i 's/sandbox_secret_key/production_secret_key/' .env
echo "NODE_ENV=production" >> .env

# Deploy
npm run build
npm start
```

### **Any Mode → Demo**
```bash
echo "DEMO_MODE=true" > .env
npm run dev
```

### **Quick Commands**
```bash
# Start demo mode
npm run demo:start

# Setup demo environment
npm run demo

# Start with specific mode
DEMO_MODE=false npm run dev
NODE_ENV=production npm start
```

---

## 🔧 Troubleshooting

### **Demo Mode Issues**

#### **Problem: Still seeing real payment flow**
```bash
# Check environment
echo $DEMO_MODE
cat .env | grep DEMO

# Force demo mode
DEMO_MODE=true npm run dev
```

#### **Solution: Clear and reset**
```bash
rm .env
cp .env.example .env
npm run dev
```

### **Production Issues**

#### **Problem: Touch 'n Go API errors**
```bash
# Check credentials
echo $TNG_MERCHANT_ID
echo $TNG_SECRET_KEY

# Test connectivity
curl -I https://api.tngdigital.com.my
```

#### **Problem: Webhook not received**
```bash
# Check webhook URL configuration
# Verify SSL certificate
# Test webhook endpoint manually
curl -X POST https://yourdomain.com/api/payments/webhook
```

#### **Problem: Database connection errors**
```bash
# Test database connection
npm run db:push

# Run migration
npm run db:migrate-payments
```

### **Payment Flow Issues**

#### **Problem: Payment stuck in pending**
- Check Touch 'n Go API status
- Verify webhook configuration
- Check payment expiration time

#### **Problem: QR code not displaying**
- Verify API response contains qrCode
- Check image format and encoding
- Test with demo mode first

#### **Problem: Status not updating**
- Verify polling is enabled
- Check network connectivity
- Review browser console for errors

---

## 🚀 Deployment Guide

### **Railway Deployment**

#### **1. Environment Variables**
Set in Railway dashboard:
```env
NODE_ENV=production
DEMO_MODE=false
TNG_BASE_URL=https://api.tngdigital.com.my
TNG_MERCHANT_ID=your_merchant_id
TNG_SECRET_KEY=your_secret_key
BASE_URL=https://your-app.railway.app
DATABASE_URL=[Auto-provided by Railway]
```

#### **2. Build Configuration**
```json
// package.json
{
  "scripts": {
    "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start": "NODE_ENV=production node dist/index.js"
  }
}
```

#### **3. Database Migration**
```bash
# After deployment
railway run npm run db:migrate-payments
```

### **Vercel Deployment**

#### **1. Configuration**
```json
// vercel.json
{
  "functions": {
    "server/index.ts": {
      "maxDuration": 30
    }
  },
  "env": {
    "DEMO_MODE": "false",
    "NODE_ENV": "production"
  }
}
```

### **Docker Deployment**

#### **Dockerfile**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

---

## 📊 Monitoring & Analytics

### **Payment Metrics to Track**

- Payment success rate
- Average payment completion time
- Failed payment reasons
- Abandoned payment rate
- QR code scan rate
- Mobile vs desktop usage

### **Logging Configuration**

```typescript
// Add to payment service
console.log('Payment created:', {
  orderId,
  paymentId,
  amount,
  method: 'touchngo',
  timestamp: new Date().toISOString()
});
```

### **Error Monitoring**

```typescript
// Add error tracking
try {
  const payment = await touchNGoService.createPayment(request);
} catch (error) {
  console.error('Payment creation failed:', {
    error: error.message,
    orderId,
    customerEmail,
    timestamp: new Date().toISOString()
  });
  // Send to error monitoring service
}
```

---

## 🔐 Security Best Practices

### **Environment Variables**
- Never commit secrets to code
- Use different credentials for each environment
- Rotate keys regularly
- Use Railway/Vercel secret management

### **Webhook Security**
- Always verify HMAC signatures
- Use HTTPS only
- Implement request rate limiting
- Log suspicious webhook activity

### **Payment Security**
- Validate all payment amounts
- Implement payment timeout handling
- Store sensitive data encrypted
- Use secure session management

### **API Security**
- Implement request authentication
- Use CORS properly
- Validate all input data
- Implement rate limiting

---

## 📋 Testing Checklist

### **Demo Mode Testing**
- [ ] ✅ Demo mode starts without setup
- [ ] ✅ Visual demo indicators appear
- [ ] ✅ Mock QR code displays
- [ ] ✅ Payment status updates automatically
- [ ] ✅ Success/failure scenarios work
- [ ] ✅ Retry functionality works
- [ ] ✅ Payment cancellation works

### **Sandbox Testing**
- [ ] ✅ Real Touch 'n Go API integration
- [ ] ✅ Actual QR codes generate
- [ ] ✅ Webhook notifications received
- [ ] ✅ Database payments recorded
- [ ] ✅ Error handling works
- [ ] ✅ Admin panel shows payments

### **Production Testing**
- [ ] ✅ SSL certificate configured
- [ ] ✅ Production API credentials work
- [ ] ✅ Webhook URL accessible
- [ ] ✅ Real payments process correctly
- [ ] ✅ Email notifications sent
- [ ] ✅ Error monitoring active

---

## 🎯 Next Steps & Enhancements

### **Immediate Improvements**
1. **Refund Processing** - Add refund capability
2. **Payment Analytics** - Dashboard with payment metrics
3. **Multi-Currency** - Support other currencies
4. **Payment Links** - Generate shareable payment links

### **Advanced Features**
1. **Subscription Payments** - Recurring cake orders
2. **Split Payments** - Multiple payment methods per order
3. **Saved Payment Methods** - Customer payment preferences
4. **Fraud Detection** - Suspicious payment monitoring

### **Integration Opportunities**
1. **Other Payment Methods** - Credit cards, bank transfers
2. **Loyalty Program** - Points and rewards integration
3. **Inventory Management** - Stock-aware pricing
4. **CRM Integration** - Customer relationship management

---

## 📞 Support & Resources

### **Touch 'n Go Resources**
- [Developer Portal](https://developer.tngdigital.com.my/)
- [API Documentation](https://developer.tngdigital.com.my/docs)
- [Integration Guide](https://developer.tngdigital.com.my/integration)
- [Merchant Support](https://support.tngdigital.com.my)

### **Implementation Support**
- Demo mode for risk-free testing
- Comprehensive error logging
- Step-by-step setup guides
- Troubleshooting documentation

---

## 🎉 Summary

This Touch 'n Go payment integration provides:

✅ **Complete Payment System** - End-to-end payment processing  
✅ **Demo Mode** - Risk-free testing without external dependencies  
✅ **Production Ready** - Scalable, secure, real-world deployment  
✅ **Mobile Optimized** - Touch-friendly responsive design  
✅ **Real-time Updates** - Live payment status and webhooks  
✅ **Comprehensive Documentation** - Everything needed to deploy  

**Perfect for Malaysian cake businesses wanting to offer modern digital payment options while maintaining the flexibility to test and develop safely!** 🎂💳✨

---

**Get started with demo testing in under 2 minutes:**

```bash
npm run demo && npm run dev
```

**Then visit `http://localhost:5000` and experience the complete Touch 'n Go payment flow!**
