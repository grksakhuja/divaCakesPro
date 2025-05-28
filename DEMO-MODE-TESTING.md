# 🧪 Demo Mode Testing Guide

Test the Touch 'n Go payment integration without database setup or real credentials!

## 🚀 Quick Start Testing

### **1. Enable Demo Mode**

Add this to your `.env` file (or create one):

```env
DEMO_MODE=true
NODE_ENV=development
```

### **2. Start the Application**

```bash
npm run dev
```

### **3. Test the Payment Flow**

1. **Build a Cake** → Go through the cake builder steps 1-8
2. **Choose Payment Method** → Select "Touch 'n Go eWallet" 
3. **Complete Order** → Click "Confirm & Place Order"
4. **Payment Processing** → You'll see the demo payment screen with:
   - 🧪 Demo mode banner
   - Mock QR code
   - Simulated payment flow
   - Automatic status updates

## 🧪 What's Simulated

### **Demo Payment Service**
- ✅ **Mock QR Code Generation** - Shows a demo QR code
- ✅ **Fake Payment URLs** - Demo Touch 'n Go app links
- ✅ **Status Progression** - Simulates real payment states:
  - `pending` → `processing` → `success` (80% chance)
  - `pending` → `processing` → `failed` (20% chance)

### **Demo User Experience**
- ✅ **Visual Demo Indicators** - Orange demo banners and badges
- ✅ **Realistic Timing** - 20-second payment simulation
- ✅ **Interactive Elements** - Functional buttons and QR codes
- ✅ **Status Polling** - Real-time status updates every 3 seconds
- ✅ **Error Handling** - Retry and cancel functionality

### **Demo Backend**
- ✅ **In-Memory Storage** - No database required
- ✅ **Mock API Responses** - Simulates Touch 'n Go API
- ✅ **Webhook Simulation** - Fake webhook processing
- ✅ **Console Logging** - Detailed demo activity logs

## 📱 Testing Scenarios

### **Successful Payment Flow**
1. Complete cake customization
2. Select Touch 'n Go payment
3. Watch the demo QR code appear
4. Wait 20+ seconds for automatic success
5. See the confirmation screen

### **Failed Payment Flow**
1. Follow the same steps
2. Demo has 20% failure rate
3. If payment fails, test the retry functionality
4. Try different payment methods

### **Payment Cancellation**
1. Start payment process
2. Click "Cancel Payment" during QR code screen
3. Return to payment method selection
4. Switch to cash payment to complete order

## 🔍 Demo Mode Indicators

Look for these visual cues that you're in demo mode:

- 🧪 **Orange Demo Banner** at top of payment screens
- 🧪 **Demo Badges** next to payment status
- 🧪 **"Demo Mode" text** in payment details  
- 🧪 **Console Messages** with demo prefixes
- 🧪 **Mock QR Code** with "DEMO QR CODE" text

## 📊 Console Output

Watch your browser console and server logs for detailed demo activity:

```bash
🧪 DEMO MODE: Creating mock payment
📊 Payment Details: { orderId: "1", amount: "RM 45.00", customer: "John Doe" }
🧪 DEMO: Payment stored in mock storage
🧪 DEMO MODE: Checking mock payment status
📊 Payment Status: { paymentId: "TNG_DEMO_123", status: "processing", elapsed: "15.2s" }
🧪 DEMO: Payment status updated to success
```

## ⚡ Testing Without Frontend

You can also test the backend API directly:

```bash
# Create a mock order (if needed)
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"customerName":"Test User","customerEmail":"test@example.com","totalPrice":4500}'

# Create demo payment
curl -X POST http://localhost:5000/api/orders/1/payment \
  -H "Content-Type: application/json"

# Check payment status
curl http://localhost:5000/api/payments/TNG_DEMO_123/status
```

## 🛑 Limitations in Demo Mode

**What's NOT tested:**
- Real Touch 'n Go API integration
- Actual webhook signature verification  
- Database persistence
- Real QR code generation
- Actual payment processing

**What IS tested:**
- Full UI/UX payment flow
- Frontend component behavior
- API endpoint routing
- Error handling logic
- Status polling mechanisms
- Payment state management

## 🔄 Switching to Production

When ready for real payments:

1. **Remove Demo Mode**
   ```env
   DEMO_MODE=false
   # or remove the line entirely
   ```

2. **Add Real Credentials**
   ```env
   TNG_MERCHANT_ID=your_real_merchant_id
   TNG_SECRET_KEY=your_real_secret_key
   TNG_BASE_URL=https://api.tngdigital.com.my
   ```

3. **Run Database Migration**
   ```bash
   npm run db:migrate-payments
   ```

4. **Test with Touch 'n Go Sandbox**
   ```env
   TNG_BASE_URL=https://sandbox-api.tngdigital.com.my
   ```

## 💡 Demo Mode Benefits

✅ **No External Dependencies** - Test without Touch 'n Go account  
✅ **No Database Setup** - Works with in-memory storage  
✅ **Realistic Experience** - Full payment flow simulation  
✅ **Safe Testing** - No real money involved  
✅ **Fast Iteration** - Immediate feedback and testing  
✅ **Error Scenarios** - Built-in failure simulation  

## 🎯 Perfect for:

- **UI/UX Testing** - Validate payment flow design
- **Integration Testing** - Test component interactions  
- **Demo Presentations** - Show clients the payment experience
- **Development** - Build and test without external services
- **Quality Assurance** - Verify all payment scenarios

---

## 🚀 Ready to Test?

1. Set `DEMO_MODE=true` in your `.env`
2. Run `npm run dev`
3. Build a cake and test the payment flow!

The demo mode gives you a **complete, realistic payment experience** without any external dependencies. Perfect for testing, development, and demonstrations! 🎂💳✨
