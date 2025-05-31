import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CakeConfig } from '@/types/cake';
import { CartItem, Cart, generateCartItemId } from '@/types/cart';

interface CakeBuilderStore {
  currentStep: number;
  cakeConfig: CakeConfig;
  updateConfig: (updates: Partial<CakeConfig>) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  resetBuilder: () => void;
  
  // Cart functionality
  cart: Cart;
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;
}

const initialConfig: CakeConfig = {
  layers: 1,
  shape: "round",
  flavors: ["butter"],
  icingColor: "#87CEEB",
  icingType: "butter",
  decorations: [],
  messageFont: "classic",
  dietaryRestrictions: [],
  servings: 6,
  sixInchCakes: 1,
  eightInchCakes: 0,
  deliveryMethod: "pickup",
};

const initialCart: Cart = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
};

export const useCakeBuilder = create<CakeBuilderStore>()(
  persist(
    (set, get) => ({
      currentStep: 1,
      cakeConfig: initialConfig,
      cart: initialCart,
      
      updateConfig: (updates) =>
        set((state) => ({
          cakeConfig: { ...state.cakeConfig, ...updates },
        })),
        
      nextStep: () =>
        set((state) => ({
          currentStep: Math.min(state.currentStep + 1, 9),
        })),
        
      prevStep: () =>
        set((state) => ({
          currentStep: Math.max(state.currentStep - 1, 1),
        })),
        
      goToStep: (step) =>
        set(() => ({
          currentStep: Math.min(Math.max(step, 1), 9),
        })),
        
      resetBuilder: () =>
        set(() => ({
          currentStep: 1,
          cakeConfig: initialConfig,
        })),

      // Cart functionality
      addToCart: (item) =>
        set((state) => {
          const newItem: CartItem = {
            ...item,
            id: generateCartItemId(),
          };
          
          const newItems = [...state.cart.items, newItem];
          const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
          const totalPrice = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
          
          return {
            cart: {
              items: newItems,
              totalItems,
              totalPrice,
            },
          };
        }),

      removeFromCart: (itemId) =>
        set((state) => {
          const newItems = state.cart.items.filter(item => item.id !== itemId);
          const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
          const totalPrice = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
          
          return {
            cart: {
              items: newItems,
              totalItems,
              totalPrice,
            },
          };
        }),

      updateQuantity: (itemId, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            // Remove item if quantity is 0 or negative
            const newItems = state.cart.items.filter(item => item.id !== itemId);
            const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
            const totalPrice = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            
            return {
              cart: {
                items: newItems,
                totalItems,
                totalPrice,
              },
            };
          }
          
          const newItems = state.cart.items.map(item =>
            item.id === itemId ? { ...item, quantity } : item
          );
          const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
          const totalPrice = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
          
          return {
            cart: {
              items: newItems,
              totalItems,
              totalPrice,
            },
          };
        }),

      clearCart: () =>
        set(() => ({
          cart: initialCart,
        })),

      getCartTotal: () => {
        const state = get();
        return state.cart.totalPrice;
      },

      getCartItemCount: () => {
        const state = get();
        return state.cart.totalItems;
      },
    }),
    {
      name: 'cake-builder-storage',
      partialize: (state) => ({ cart: state.cart }),
    }
  )
);
