import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from "lucide-react";
import { useCakeBuilder } from "@/lib/cake-builder-store";
import { CartItem } from "@/types/cart";
import { Link } from "wouter";

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCakeBuilder();

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
      case 'specialty': return 'Specialty Cake';
      case 'slice': return 'Cake Slice';
      case 'candy': return 'Coconut Candy';
      case 'custom': return 'Custom Cake';
      default: return 'Item';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/cakes">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Continue Shopping
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
              <p className="text-gray-600">
                {cart.totalItems} {cart.totalItems === 1 ? 'item' : 'items'} in your cart
              </p>
            </div>
          </div>

          {cart.items.length === 0 ? (
            /* Empty Cart State */
            <Card className="p-12 text-center">
              <ShoppingBag className="h-16 w-16 mx-auto text-gray-400 mb-6" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your cart is empty</h2>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Looks like you haven't added any delicious cakes to your cart yet. 
                Browse our selection and find something sweet!
              </p>
              <div className="space-y-3">
                <Link href="/cakes">
                  <Button size="lg">Browse Our Cakes</Button>
                </Link>
                <div>
                  <Link href="/order">
                    <Button variant="outline" size="lg">Build Custom Cake</Button>
                  </Link>
                </div>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cart.items.map((item) => (
                  <Card key={item.id} className="p-6">
                    <div className="flex gap-6">
                      {item.image && (
                        <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-semibold">{item.name}</h3>
                            <Badge variant="secondary" className="mt-1">
                              {getItemTypeLabel(item.type)}
                            </Badge>
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
                        
                        {item.description && (
                          <p className="text-gray-600 text-sm mb-4">
                            {item.description}
                          </p>
                        )}
                        
                        {/* Custom cake details */}
                        {item.type === 'custom' && item.cakeConfig && (
                          <div className="bg-gray-50 p-3 rounded-md mb-4 text-sm">
                            <p><strong>Size:</strong> {item.cakeConfig.sixInchCakes > 0 && `${item.cakeConfig.sixInchCakes}×6" `}
                            {item.cakeConfig.eightInchCakes > 0 && `${item.cakeConfig.eightInchCakes}×8"`}</p>
                            <p><strong>Shape:</strong> {item.cakeConfig.shape}</p>
                            <p><strong>Flavors:</strong> {item.cakeConfig.flavors.join(', ')}</p>
                            <p><strong>Icing:</strong> {item.cakeConfig.icingType}</p>
                            {item.cakeConfig.decorations.length > 0 && (
                              <p><strong>Decorations:</strong> {item.cakeConfig.decorations.join(', ')}</p>
                            )}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium">Quantity:</span>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                className="h-8 w-8 p-0"
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="font-medium w-8 text-center">
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
                          </div>
                          
                          {/* Price */}
                          <div className="text-right">
                            <div className="text-lg font-bold">
                              {formatPrice(item.price * item.quantity)}
                            </div>
                            <div className="text-sm text-gray-600">
                              {formatPrice(item.price)} each
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <Card className="p-6 sticky top-4">
                  <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal ({cart.totalItems} items)</span>
                      <span>{formatPrice(getCartTotal())}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Delivery</span>
                      <span>Calculated at checkout</span>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="flex justify-between text-lg font-bold mb-6">
                    <span>Total</span>
                    <span>{formatPrice(getCartTotal())}</span>
                  </div>
                  
                  <div className="space-y-3">
                    <Button className="w-full" size="lg" asChild>
                      <Link href="/checkout">Proceed to Checkout</Link>
                    </Button>
                    <Link href="/cakes">
                      <Button variant="outline" className="w-full">
                        Continue Shopping
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      className="w-full"
                      onClick={clearCart}
                    >
                      Clear Cart
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}