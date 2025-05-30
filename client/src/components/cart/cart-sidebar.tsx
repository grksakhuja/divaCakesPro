import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { useCakeBuilder } from "@/lib/cake-builder-store";
import { CartItem } from "@/types/cart";
import { Link, useLocation } from "wouter";

interface CartSidebarProps {
  trigger: React.ReactNode;
}

export function CartSidebar({ trigger }: CartSidebarProps) {
  const { cart, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCakeBuilder();
  const [isOpen, setIsOpen] = useState(false);
  const [, setLocation] = useLocation();

  const formatPrice = (priceInCents: number) => {
    return `RM ${(priceInCents / 100).toFixed(2)}`;
  };

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const getItemTypeLabel = (type: CartItem['type']) => {
    switch (type) {
      case 'specialty': return 'Specialty';
      case 'slice': return 'Slice';
      case 'candy': return 'Candy';
      case 'custom': return 'Custom';
      default: return 'Item';
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {trigger}
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Your Cart ({cart.totalItems} {cart.totalItems === 1 ? 'item' : 'items'})
          </SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 flex-1 overflow-y-auto">
          {cart.items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-gray-600 mb-4">Add some delicious cakes to get started!</p>
              <Button onClick={() => setIsOpen(false)} asChild>
                <Link href="/cakes">Browse Cakes</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.items.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
                  {item.image && (
                    <div className="w-16 h-16 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-sm">{item.name}</h4>
                        <Badge variant="secondary" className="text-xs mt-1">
                          {getItemTypeLabel(item.type)}
                        </Badge>
                        {item.description && (
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="font-medium text-sm w-8 text-center">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-semibold">
                          {formatPrice(item.price * item.quantity)}
                        </div>
                        <div className="text-xs text-gray-600">
                          {formatPrice(item.price)} each
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.items.length > 0 && (
          <div className="border-t pt-4 mt-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Total:</span>
              <span className="font-bold text-lg">{formatPrice(getCartTotal())}</span>
            </div>
            
            <div className="space-y-2">
              <Button 
                className="w-full" 
                size="lg" 
                onClick={() => {
                  setIsOpen(false);
                  setLocation("/checkout");
                }}
              >
                Proceed to Checkout
              </Button>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setIsOpen(false)}
                  asChild
                >
                  <Link href="/cakes">Continue Shopping</Link>
                </Button>
                <Button 
                  variant="ghost" 
                  className="flex-1"
                  onClick={clearCart}
                >
                  Clear Cart
                </Button>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}