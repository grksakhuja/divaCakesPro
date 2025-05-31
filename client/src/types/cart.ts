import { CakeConfig } from './cake';

export interface CartItem {
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

export interface Cart {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

export interface CartStore {
  cart: Cart;
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;
}

// Helper function to generate cart item ID
export function generateCartItemId(): string {
  return `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Helper function to create cart item from specialty cake
export function createSpecialtyCartItem(
  specialtyId: string,
  name: string,
  price: number,
  description: string,
  image: string,
  quantity: number = 1
): Omit<CartItem, 'id'> {
  return {
    type: 'specialty',
    name,
    price,
    quantity,
    specialtyId,
    description,
    image,
  };
}

// Helper function to create cart item from custom cake
export function createCustomCakeCartItem(
  cakeConfig: CakeConfig,
  price: number,
  quantity: number = 1
): Omit<CartItem, 'id'> {
  const sizesText = [];
  if (cakeConfig.sixInchCakes > 0) sizesText.push(`${cakeConfig.sixInchCakes}×6"`);
  if (cakeConfig.eightInchCakes > 0) sizesText.push(`${cakeConfig.eightInchCakes}×8"`);
  
  const name = `Custom ${cakeConfig.shape} cake (${sizesText.join(', ')})`;
  
  return {
    type: 'custom',
    name,
    price,
    quantity,
    cakeConfig,
  };
}