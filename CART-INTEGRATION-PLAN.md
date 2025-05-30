# Shopping Cart Integration Plan

## Overview
Add a shopping cart system to allow customers to:
1. Add specialty cakes (from /cakes page) to their cart
2. Mix custom cakes (from cake builder) with ready-made cakes
3. Checkout with multiple items in one order

## Current System Analysis
- **Single-order workflow**: One custom cake per order
- **No cart state**: Configuration held temporarily during building
- **Order structure**: Supports one cake with quantities (sixInchCakes/eightInchCakes)
- **No payment**: Quote-based system with email follow-up

## Proposed Solution

### Phase 1: Cart State Management
1. **Extend existing Zustand store** to include cart functionality
2. **Cart item types**:
   - Custom cakes (from cake builder)
   - Specialty items (from cakes page)
   - Sliced cakes
   - Coconut candy

### Phase 2: Cart Data Structure
```typescript
interface CartItem {
  id: string;
  type: 'custom' | 'specialty' | 'slice' | 'candy';
  name: string;
  price: number; // in cents
  quantity: number;
  
  // For custom cakes
  cakeConfig?: CakeConfig;
  
  // For specialty items
  specialtyId?: string;
  description?: string;
  image?: string;
}

interface Cart {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}
```

### Phase 3: UI Components
1. **Cart Icon/Badge** in navigation (show item count)
2. **Add to Cart buttons** on cakes page
3. **Cart Sidebar/Modal** for quick view
4. **Cart Page** for full cart management
5. **Mini cart** in header

### Phase 4: Integration Points

#### A. Cakes Page Integration
- Replace "Order Now" buttons with "Add to Cart"
- Show quantity selectors
- Add success toast notifications

#### B. Cake Builder Integration
- Add "Add to Cart" option alongside "Place Order"
- Allow multiple custom cakes in one session
- Keep existing direct order flow as option

#### C. Checkout Flow
- **Option 1**: Extend existing order structure (recommended)
- **Option 2**: Create new "multi-item order" structure

### Phase 5: Backend Changes

#### Order Schema Extension
```sql
-- Add order_items table
CREATE TABLE order_items (
  id INTEGER PRIMARY KEY,
  order_id INTEGER REFERENCES cake_orders(id),
  item_type TEXT, -- 'custom', 'specialty', 'slice', 'candy'
  item_name TEXT,
  quantity INTEGER,
  unit_price INTEGER, -- in cents
  total_price INTEGER, -- quantity * unit_price
  
  -- For custom cakes (null for specialty items)
  cake_config JSON,
  
  -- For specialty items (null for custom cakes)
  specialty_id TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### API Changes
1. **Cart endpoints**:
   - `GET /api/cart` - get cart (session-based)
   - `POST /api/cart/add` - add item to cart
   - `PUT /api/cart/item/:id` - update quantity
   - `DELETE /api/cart/item/:id` - remove item

2. **Modified order endpoint**:
   - `POST /api/orders` - handle cart checkout
   - Backward compatible with single-cake orders

### Phase 6: Implementation Strategy

#### Step 1: State Management (Low Risk)
- Extend `cake-builder-store.ts` with cart functions
- Add cart persistence (localStorage)

#### Step 2: UI Components (Medium Risk)
- Create cart components
- Add to existing pages without breaking current flow

#### Step 3: Backend Integration (High Risk)
- Add new database table
- Extend API endpoints
- Maintain backward compatibility

#### Step 4: Testing & Rollout
- Test mixed orders
- Ensure email notifications work with multiple items
- Test cart persistence across sessions

## Risk Mitigation

### Backward Compatibility
- Keep existing single-cake order flow intact
- New cart system as additional option
- Gradual migration path

### Data Integrity
- Validate cart items before checkout
- Handle pricing changes between add-to-cart and checkout
- Clear cart after successful order

### User Experience
- Clear cart states and feedback
- Easy cart modification
- Persistent cart across page refreshes

## Timeline Estimate
- **Phase 1-2**: 2-3 days (state management + data structure)
- **Phase 3**: 3-4 days (UI components)
- **Phase 4**: 2-3 days (integration)
- **Phase 5**: 4-5 days (backend changes)
- **Phase 6**: 2-3 days (testing)

**Total**: ~2 weeks

## Success Metrics
1. Users can add multiple specialty items to cart
2. Mixed orders (custom + specialty) work end-to-end
3. Cart persists across browser sessions
4. Email notifications include all order items
5. No regression in existing cake builder flow