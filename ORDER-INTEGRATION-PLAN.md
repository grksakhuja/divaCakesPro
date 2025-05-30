# Order Integration Plan

## Current State
- **Cake Builder**: Single custom cake → direct order
- **Cakes Page**: Specialty items → cart → (no checkout yet)
- **Problem**: Two separate order flows need to merge

## Integration Strategy

### Option 1: Unified Cart System (Recommended)
Modify cake builder to add custom cakes to cart, then checkout from cart.

**Pros:**
- Single checkout process
- Mix custom + specialty items
- Better user experience
- Future-proof for multiple custom cakes

**Cons:**
- Requires changes to cake builder flow

### Option 2: Dual Order Systems
Keep cake builder direct order, add separate cart checkout.

**Pros:**
- No changes to existing cake builder
- Quick to implement

**Cons:**
- Two separate checkout flows
- Confusing for users
- Can't mix custom + specialty items

## Recommended Implementation: Option 1

### Phase 1: Create Unified Checkout
1. **Add "Add to Cart" button** in cake builder (step 9)
2. **Modify existing "Place Order"** to also support cart checkout
3. **Create cart checkout page** that uses existing customer form
4. **Update order API** to handle both single orders and cart orders

### Phase 2: Database Schema (Backward Compatible)
```sql
-- New table for order items (many items per order)
CREATE TABLE order_items (
  id INTEGER PRIMARY KEY,
  order_id INTEGER REFERENCES cake_orders(id),
  item_type TEXT NOT NULL, -- 'custom', 'specialty', 'slice', 'candy'
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price INTEGER NOT NULL, -- in cents
  total_price INTEGER NOT NULL, -- quantity * unit_price
  
  -- For custom cakes (null for specialty items)
  layers INTEGER,
  shape TEXT,
  flavors JSON,
  icing_color TEXT,
  icing_type TEXT,
  decorations JSON,
  message TEXT,
  message_font TEXT,
  dietary_restrictions JSON,
  servings INTEGER,
  six_inch_cakes INTEGER,
  eight_inch_cakes INTEGER,
  
  -- For specialty items (null for custom cakes)
  specialty_id TEXT,
  specialty_name TEXT,
  specialty_description TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Keep existing cake_orders table for backward compatibility
-- Add new field to indicate if order has items in order_items table
ALTER TABLE cake_orders ADD COLUMN has_line_items BOOLEAN DEFAULT FALSE;
```

### Phase 3: API Updates
```typescript
// New checkout endpoint
POST /api/checkout
{
  customer: { name, email, phone, deliveryMethod, address?, specialInstructions? },
  items: [
    {
      type: 'custom' | 'specialty' | 'slice' | 'candy',
      quantity: number,
      price: number, // unit price in cents
      
      // For custom cakes
      cakeConfig?: CakeConfig,
      
      // For specialty items
      specialtyId?: string,
      name?: string,
      description?: string
    }
  ]
}

// Backward compatible - existing cake builder can still use /api/orders
// But internally convert to line items
```

### Phase 4: Frontend Changes

#### 4.1: Update Cake Builder
```typescript
// In cake builder step 9 (Order Summary)
<div className="space-y-3">
  <Button onClick={handleAddToCart} variant="outline" size="lg">
    Add to Cart (RM {totalPrice})
  </Button>
  <Button onClick={handleDirectOrder} size="lg">
    Order Now (RM {totalPrice})
  </Button>
</div>
```

#### 4.2: Create Unified Checkout Page
```typescript
// /checkout page that works for both cart and direct orders
export default function Checkout() {
  const { cart, clearCart } = useCakeBuilder();
  const [orderSource] = useLocation(); // from cart or direct
  
  // If coming from cake builder, use single item
  // If coming from cart, use cart items
  
  return (
    <div>
      <CustomerForm onSubmit={handleCheckout} />
      <OrderSummary items={items} total={total} />
    </div>
  );
}
```

#### 4.3: Update Cart Sidebar/Page
```typescript
// Replace "Proceed to Checkout" button
<Button asChild>
  <Link href="/checkout?source=cart">Proceed to Checkout</Link>
</Button>
```

## Implementation Steps

### Step 1: Add "Add to Cart" to Cake Builder ✅ (First Priority)
- Add button to step 9 of cake builder
- Use existing `createCustomCakeCartItem` helper
- Show success toast and option to continue or view cart

### Step 2: Create Checkout Page (High Priority)
- New `/checkout` route
- Reuse existing `CustomerForm` component
- Support both cart items and single custom cake
- Calculate totals from cart or passed item

### Step 3: Update Order API (High Priority)
- Create new `POST /api/checkout` endpoint
- Support array of line items
- Maintain backward compatibility with existing `/api/orders`
- Send emails with multiple items

### Step 4: Database Migration (Medium Priority)
- Add `order_items` table
- Migrate existing orders to new format (optional)
- Update admin orders view to show line items

### Step 5: Testing & Polish (Medium Priority)
- Test all order flows
- Ensure email templates work with multiple items
- Update order confirmation page
- Test mixed cart orders (custom + specialty)

## User Flows After Integration

### Flow 1: Custom Cake Only
1. Build cake → Add to Cart → View Cart → Checkout
2. Build cake → Order Now (direct, existing flow)

### Flow 2: Specialty Items Only
1. Browse cakes → Add to Cart → Checkout

### Flow 3: Mixed Order
1. Build cake → Add to Cart
2. Browse cakes → Add more items
3. View cart → Checkout

All flows converge at the unified checkout page using the same customer form and order processing.