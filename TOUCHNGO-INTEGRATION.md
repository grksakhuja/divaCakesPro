# Touch 'n Go Payment Integration Guide

This guide explains how to integrate Touch 'n Go eWallet payments into your CakeCraftPro application.

## 🚀 Quick Setup

### 1. **Register with Touch 'n Go eWallet**

1. Visit the [Touch 'n Go eWallet Developer Portal](https://developer.tngdigital.com.my/)
2. Create a developer account
3. Apply for a merchant account
4. Get your credentials:
   - Merchant ID
   - Secret Key
   - API Access

### 2. **Environment Configuration**

Copy `.env.example` to `.env` and update the Touch 'n Go settings:

```bash
cp .env.example .env
```

Update these values in your `.env` file:

```env
# Touch 'n Go eWallet Configuration
TNG_BASE_URL="https://sandbox-api.tngdigital.com.my"  # Sandbox for testing
TNG_MERCHANT_ID="your_actual_merchant_id"
TNG_SECRET_KEY="your_actual_secret_key"
BASE_URL="https://yourdomain.com"  # For production deployment
```

### 3. **Database Migration**

Run the payment system migration to add the necessary database tables:

```bash
npm run db:migrate-payments
```

Or manually run:

```bash
tsx server/migrate-payments.ts
```

### 4. **Update Package.json Scripts**

Add the migration script to your `package.json`:

```json
{
  "scripts": {
    "db:migrate-payments": "tsx server/migrate-payments.ts"
  }
}
```

## 🏗️ Implementation Details

### **New Database Tables**

#### **payments table:**
- Tracks all payment transactions
- Links to cake orders
- Stores Touch 'n Go response data
- Handles webhook notifications

#### **cake_orders table updates:**
- Added payment method tracking
- Payment status and references
- Payment completion timestamps

### **New API Endpoints**

1. **POST** `/api/orders/:id/payment` - Create payment for an order
2. **GET** `/api/payments/:paymentId/status` - Check payment status
3. **POST** `/api/payments/webhook` - Touch 'n Go webhook handler
4. **GET** `/payment/success` - Payment success redirect

### **Frontend Components**

1. **PaymentMethodSelector** - Choose between cash, Touch 'n Go, or card
2. **PaymentProcessor** - Handle Touch 'n Go payment flow
3. **Updated CakeBuilder** - 11-step process including payment

### **Payment Flow**

1. **Order Creation** → Customer completes cake customization
2. **Payment Method** → Select Touch 'n Go eWallet
3. **Payment Processing** → Generate QR code or redirect to app
4. **Payment Completion** → Webhook updates order status
5. **Order Confirmation** → Customer receives confirmation

## 🔧 Configuration Options

### **Sandbox vs Production**

**Sandbox (Testing):**
```env
TNG_BASE_URL="https://sandbox-api.tngdigital.com.my"
```

**Production:**
```env
TNG_BASE_URL="https://api.tngdigital.com.my"
```

### **Webhook Configuration**

Set up your webhook URL in the Touch 'n Go merchant portal:
```
https://yourdomain.com/api/payments/webhook
```

### **Security Features**

- HMAC-SHA256 signature verification
- Request timestamp validation
- Secure credential storage
- Payment status validation

## 📱 User Experience

### **Payment Options Available:**

1. **Touch 'n Go eWallet** (Recommended)
   - QR code scanning
   - Direct app redirect
   - Instant payment confirmation
   - Real-time status updates

2. **Cash Payment**
   - Pay on pickup/delivery
   - No processing fees
   - Traditional flow

3. **Credit/Debit Card** (Coming Soon)
   - Future implementation ready

### **Mobile-Optimized Flow:**

- Touch-friendly payment selection
- QR code display for mobile scanning
- App redirect functionality
- Real-time payment status polling

## 🛠️ Testing

### **Test Payment Flow:**

1. Start the application in development mode
2. Complete a cake order
3. Select "Touch 'n Go eWallet" as payment method
4. Use Touch 'n Go sandbox credentials
5. Test with their provided test data

### **Webhook Testing:**

Use tools like ngrok to expose your local webhook endpoint:

```bash
ngrok http 5000
# Update BASE_URL in .env to the ngrok URL
```

## 🚨 Production Deployment

### **Environment Variables for Railway:**

Set these in your Railway environment:

```env
TNG_BASE_URL=https://api.tngdigital.com.my
TNG_MERCHANT_ID=your_production_merchant_id
TNG_SECRET_KEY=your_production_secret_key
BASE_URL=https://your-railway-app.railway.app
```

### **Database Migration on Deployment:**

Add to your Railway deployment script or run manually:

```bash
npm run db:migrate-payments
```

## 📊 Monitoring & Analytics

### **Payment Status Tracking:**

- Real-time payment status updates
- Webhook notification logging
- Failed payment retry mechanisms
- Payment analytics dashboard (future enhancement)

### **Order Management:**

- Payment method display in admin panel
- Payment status in order details
- Refund handling capabilities
- Transaction history

## 🔍 Troubleshooting

### **Common Issues:**

1. **Webhook Signature Verification Fails**
   - Check secret key configuration
   - Verify webhook URL setup
   - Confirm payload format

2. **Payment Status Not Updating**
   - Check webhook endpoint accessibility
   - Verify database connectivity
   - Review error logs

3. **QR Code Not Displaying**
   - Confirm Touch 'n Go API response
   - Check image URL validity
   - Verify merchant configuration

### **Debugging Tools:**

- Payment service logs
- Webhook payload inspection
- API response monitoring
- Database query logging

## 🔐 Security Best Practices

1. **Environment Variables:** Never commit secrets to code
2. **Webhook Verification:** Always verify signatures
3. **HTTPS Only:** Use secure connections in production
4. **Error Handling:** Don't expose sensitive information
5. **Rate Limiting:** Implement API rate limits
6. **Audit Logging:** Track all payment activities

## 📈 Future Enhancements

1. **Multi-Currency Support**
2. **Refund Processing**
3. **Subscription Payments**
4. **Payment Analytics Dashboard**
5. **Alternative Payment Methods**
6. **Fraud Detection**

## 🆘 Support

For Touch 'n Go eWallet integration support:
- [Developer Documentation](https://developer.tngdigital.com.my/docs)
- [Integration Guide](https://developer.tngdigital.com.my/integration)
- [Support Portal](https://support.tngdigital.com.my)

---

## 📝 Implementation Checklist

- [ ] Touch 'n Go merchant account setup
- [ ] Environment variables configured
- [ ] Database migration completed
- [ ] Webhook endpoint configured
- [ ] Payment flow tested in sandbox
- [ ] Production credentials updated
- [ ] SSL certificate configured
- [ ] Monitoring and logging setup
- [ ] Error handling implemented
- [ ] User acceptance testing completed

This integration provides a seamless, secure, and user-friendly payment experience for your Malaysian customers using Touch 'n Go eWallet! 🎉
