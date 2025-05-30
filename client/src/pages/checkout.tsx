import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ShoppingCart, Cake, CheckCircle, User } from "lucide-react";
import { useCakeBuilder } from "@/lib/cake-builder-store";
import { CartItem } from "@/types/cart";
import CustomerForm from "@/components/customer-form";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CheckoutItem {
  id: string;
  name: string;
  type: 'custom' | 'specialty' | 'slice' | 'candy';
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  description?: string;
  image?: string;
  cakeConfig?: any;
  specialtyId?: string;
}

export default function Checkout() {
  const { cart, clearCart } = useCakeBuilder();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [orderItems, setOrderItems] = useState<CheckoutItem[]>([]);
  const [orderTotal, setOrderTotal] = useState(0);

  // Check if coming from cart or single item
  useEffect(() => {
    if (cart.items.length > 0) {
      // Coming from cart
      const items: CheckoutItem[] = cart.items.map(item => ({
        id: item.id,
        name: item.name,
        type: item.type,
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: item.price * item.quantity,
        description: item.description,
        image: item.image,
        cakeConfig: item.cakeConfig,
        specialtyId: item.specialtyId,
      }));
      setOrderItems(items);
      setOrderTotal(cart.totalPrice);
    } else {
      // No items in cart, redirect to home
      setLocation("/");
    }
  }, [cart, setLocation]);

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await apiRequest("/api/checkout", "POST", orderData);
      return response.json();
    },
    onSuccess: (data) => {
      // Store order details for confirmation page
      localStorage.setItem("latestOrder", JSON.stringify(data));
      
      toast({
        title: "Order Placed Successfully! 🎉",
        description: `Your order #${data.id} has been received.`,
      });
      
      // Clear cart and redirect to confirmation page
      clearCart();
      setLocation("/order-confirmation");
    },
    onError: (error) => {
      console.error("Order creation failed:", error);
      toast({
        title: "Order Failed",
        description: "There was an error placing your order. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCustomerSubmit = (customerData: any) => {
    const orderData = {
      customer: customerData,
      items: orderItems.map(item => ({
        type: item.type,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        name: item.name,
        description: item.description,
        
        // For custom cakes
        ...(item.cakeConfig && { cakeConfig: item.cakeConfig }),
        
        // For specialty items
        ...(item.specialtyId && { 
          specialtyId: item.specialtyId,
          specialtyName: item.name,
          specialtyDescription: item.description 
        }),
      })),
      totalPrice: orderTotal,
    };

    console.log("Checkout order data:", orderData);
    createOrderMutation.mutate(orderData);
  };

  const formatPrice = (priceInCents: number) => {
    return `RM ${(priceInCents / 100).toFixed(2)}`;
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

  const renderCustomCakeDetails = (item: CheckoutItem) => {
    if (item.type !== 'custom' || !item.cakeConfig) return null;

    const config = item.cakeConfig;
    const sizesText = [];
    if (config.sixInchCakes > 0) sizesText.push(`${config.sixInchCakes}×6"`);
    if (config.eightInchCakes > 0) sizesText.push(`${config.eightInchCakes}×8"`);

    return (
      <div className="bg-blue-50 p-3 rounded-md mt-3 text-sm">
        <div className="grid grid-cols-2 gap-2">
          <div><strong>Size:</strong> {sizesText.join(', ')}</div>
          <div><strong>Shape:</strong> {config.shape}</div>
          <div><strong>Layers:</strong> {config.layers}</div>
          <div><strong>Icing:</strong> {config.icingType}</div>
          <div className="col-span-2"><strong>Flavors:</strong> {config.flavors.join(', ')}</div>
          {config.decorations.length > 0 && (
            <div className="col-span-2"><strong>Decorations:</strong> {config.decorations.join(', ')}</div>
          )}
          {config.dietaryRestrictions.length > 0 && (
            <div className="col-span-2"><strong>Dietary:</strong> {config.dietaryRestrictions.join(', ')}</div>
          )}
          {config.message && (
            <div className="col-span-2"><strong>Message:</strong> "{config.message}"</div>
          )}
        </div>
      </div>
    );
  };

  if (orderItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <ShoppingCart className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Items to Checkout</h2>
          <p className="text-gray-600 mb-4">Your cart is empty. Add some items before proceeding to checkout.</p>
          <Button onClick={() => setLocation("/cakes")}>Browse Cakes</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" onClick={() => setLocation("/cart")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Cart
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
              <p className="text-gray-600">Complete your order</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Customer Information */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CustomerForm 
                    onSubmit={handleCustomerSubmit}
                    isLoading={createOrderMutation.isPending}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cake className="h-5 w-5" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {orderItems.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex gap-4">
                        {item.image && (
                          <div className="w-16 h-16 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                            <img 
                              src={item.image} 
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-semibold">{item.name}</h3>
                              <Badge variant="secondary" className="text-xs">
                                {getItemTypeLabel(item.type)}
                              </Badge>
                            </div>
                            <div className="text-right">
                              <div className="font-bold">{formatPrice(item.totalPrice)}</div>
                              <div className="text-sm text-gray-600">
                                {formatPrice(item.unitPrice)} × {item.quantity}
                              </div>
                            </div>
                          </div>
                          
                          {item.description && (
                            <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                          )}
                          
                          {renderCustomCakeDetails(item)}
                        </div>
                      </div>
                    </div>
                  ))}

                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal ({orderItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                      <span>{formatPrice(orderTotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Delivery</span>
                      <span>Calculated based on selection</span>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{formatPrice(orderTotal)}</span>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-blue-900">Order Process</p>
                        <p className="text-blue-700">
                          After placing your order, we'll contact you within 24 hours to confirm 
                          details and arrange pickup/delivery. Payment will be processed upon confirmation.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}