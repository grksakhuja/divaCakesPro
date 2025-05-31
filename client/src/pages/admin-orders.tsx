import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { Package, Phone, Mail, MapPin, Clock, CheckCircle, LogOut, Trash2, AlertTriangle, User, RotateCcw, DollarSign } from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface OrderItem {
  id: number;
  orderId: number;
  itemType: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  layers?: number;
  shape?: string;
  flavors?: string[];
  icingColor?: string;
  icingType?: string;
  decorations?: string[];
  message?: string;
  messageFont?: string;
  dietaryRestrictions?: string[];
  servings?: number;
  sixInchCakes?: number;
  eightInchCakes?: number;
  specialtyId?: string;
  specialtyDescription?: string;
  createdAt: string;
}

interface Order {
  id: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  layers: number;
  shape: string;
  flavors: string[];
  icingType: string;
  decorations: string[];
  message?: string;
  dietaryRestrictions: string[];
  sixInchCakes: number;
  eightInchCakes: number;
  totalPrice: number;
  deliveryMethod: string;
  orderDate: string;
  status: string;
  hasLineItems?: boolean;
  orderItems?: OrderItem[];
  specialInstructions?: string;
}

export default function AdminOrders() {
  const { isAuthenticated, isLoading: authLoading, logout } = useAdminAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Get session token for authenticated requests
  const getSessionToken = () => {
    const sessionData = localStorage.getItem("admin_auth_session");
    if (sessionData) {
      try {
        const { token } = JSON.parse(sessionData);
        return token;
      } catch {
        return null;
      }
    }
    return null;
  };

  const { data: orders = [], refetch, isLoading } = useQuery({
    queryKey: ["/api/orders"],
    queryFn: async () => {
      const token = getSessionToken();
      if (!token) {
        throw new Error("No authentication token");
      }
      
      const response = await fetch("/api/orders", {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Admin-Session': token
        }
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }
      
      return response.json();
    },
    refetchInterval: isAuthenticated ? 5000 : false, // Auto-refresh every 5 seconds when authenticated
    enabled: isAuthenticated === true, // Only fetch when authenticated
  });

  // Update order status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, newStatus }: { orderId: number, newStatus: string }) => {
      const token = getSessionToken();
      if (!token) {
        throw new Error("No authentication token");
      }
      
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Admin-Session': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update order status");
      }
      
      return response.json();
    },
    onSuccess: (data, { newStatus }) => {
      toast({
        title: "Status updated",
        description: `Order #${data.id} status updated to ${newStatus}`,
      });
      refetch(); // Refresh the orders list
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Delete specific order mutation
  const deleteOrderMutation = useMutation({
    mutationFn: async (orderId: number) => {
      const token = getSessionToken();
      if (!token) {
        throw new Error("No authentication token");
      }
      
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Admin-Session': token
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete order");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Order deleted",
        description: `Order #${data.orderId} has been deleted successfully`,
      });
      refetch(); // Refresh the orders list
    },
    onError: (error: Error) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleDeleteOrder = (orderId: number) => {
    deleteOrderMutation.mutate(orderId);
  };

  const handleStatusToggle = (orderId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'pending' ? 'picked up' : 'pending';
    updateOrderStatusMutation.mutate({ orderId, newStatus });
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
    setLocation("/admin/login");
  };

  // Redirect to login if not authenticated
  React.useEffect(() => {
    console.log("Auth state:", { authLoading, isAuthenticated });
    if (!authLoading && !isAuthenticated) {
      console.log("Redirecting to login");
      setLocation("/admin/login");
    }
  }, [authLoading, isAuthenticated, setLocation]);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  console.log("Admin orders data:", orders);

  const formatPrice = (price: number) => {
    return `RM ${(price / 100).toFixed(2)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'picked up': return 'bg-green-100 text-green-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-purple-100 text-purple-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
            <p className="text-gray-600 mt-2">View and manage incoming cake orders</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => refetch()} 
              variant="outline"
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Refresh Orders"}
            </Button>
            <Button 
              onClick={() => setLocation("/admin/pricing")}
              variant="outline"
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Manage Pricing
            </Button>
            <Button 
              onClick={handleLogout}
              variant="outline"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {Array.isArray(orders) && orders.length > 0 ? (
          <div className="grid gap-6">
            {orders.map((order: Order) => (
              <Card key={order.id} className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="w-5 h-5" />
                        Order #{order.id}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        <Clock className="w-4 h-4 inline mr-1" />
                        {formatDistanceToNow(new Date(order.orderDate), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="flex gap-2 items-center">
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                      
                      {/* Status Toggle Button with Tooltip */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleStatusToggle(order.id, order.status)}
                            disabled={updateOrderStatusMutation.isPending}
                            className={order.status === 'pending' ? 
                              "text-green-600 hover:text-green-700 hover:bg-green-50" : 
                              "text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                            }
                          >
                            {order.status === 'pending' ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              <RotateCcw className="w-4 h-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            {order.status === 'pending' 
                              ? 'Mark as picked up' 
                              : 'Mark as pending'
                            }
                          </p>
                        </TooltipContent>
                      </Tooltip>
                      
                      {/* Delete Button with Confirmation Dialog */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            disabled={deleteOrderMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                              <AlertTriangle className="w-5 h-5 text-red-500" />
                              Delete Order #{order.id}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this order? This action cannot be undone.
                              <br /><br />
                              <strong>Customer:</strong> {order.customerName}<br />
                              <strong>Total:</strong> {formatPrice(order.totalPrice)}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteOrder(order.id)}
                              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                              disabled={deleteOrderMutation.isPending}
                            >
                              {deleteOrderMutation.isPending ? "Deleting..." : "Delete Order"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Customer Info */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Customer Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {order.customerEmail}
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {order.customerPhone || 'Not provided'}
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  {order.hasLineItems ? (
                    order.orderItems && order.orderItems.length > 0 ? (
                    <div className="bg-pink-50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">Order Items ({order.orderItems.length})</h3>
                      <div className="space-y-3">
                        {order.orderItems.map((item, index) => (
                          <div key={item.id} className="bg-white p-3 rounded border">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-medium">{item.itemName}</h4>
                                <p className="text-sm text-gray-600 capitalize">{item.itemType}</p>
                              </div>
                              <div className="text-right">
                                <div className="font-medium">Qty: {item.quantity}</div>
                                <div className="text-sm text-gray-600">{formatPrice(item.unitPrice)} each</div>
                              </div>
                            </div>
                            
                            {item.itemType === 'custom' && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mt-2 pt-2 border-t">
                                <div><strong>Size:</strong> {item.sixInchCakes}×6" + {item.eightInchCakes}×8"</div>
                                <div><strong>Layers:</strong> {item.layers}</div>
                                <div><strong>Shape:</strong> {item.shape}</div>
                                <div><strong>Flavors:</strong> {item.flavors?.join(', ')}</div>
                                <div><strong>Icing:</strong> {item.icingType}</div>
                                {item.decorations && item.decorations.length > 0 && (
                                  <div><strong>Decorations:</strong> {item.decorations.join(', ')}</div>
                                )}
                                {item.message && (
                                  <div className="md:col-span-2"><strong>Message:</strong> "{item.message}"</div>
                                )}
                                {item.dietaryRestrictions && item.dietaryRestrictions.length > 0 && (
                                  <div><strong>Dietary:</strong> {item.dietaryRestrictions.join(', ')}</div>
                                )}
                              </div>
                            )}
                            
                            {item.itemType !== 'custom' && item.specialtyDescription && (
                              <p className="text-sm text-gray-600 mt-2">{item.specialtyDescription}</p>
                            )}
                            
                            <div className="text-right mt-2 pt-2 border-t">
                              <span className="font-semibold">{formatPrice(item.totalPrice)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    ) : (
                      /* Multi-item order but items failed to load */
                      <div className="bg-red-50 p-4 rounded-lg">
                        <h3 className="font-semibold mb-2 text-red-800">⚠️ Multi-Item Order (Items Not Loaded)</h3>
                        <p className="text-sm text-red-600 mb-2">
                          This order contains multiple items but the details failed to load from the database.
                        </p>
                        <div className="text-sm">
                          <div><strong>Order Type:</strong> Multi-item cart order</div>
                          <div><strong>Total Items:</strong> {order.servings} items</div>
                          <div><strong>Debug:</strong> hasLineItems={String(order.hasLineItems)}, orderItems={order.orderItems ? `array(${order.orderItems.length})` : 'null'}</div>
                        </div>
                      </div>
                    )
                  ) : (
                    /* Single Custom Cake Details */
                    <div className="bg-pink-50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">Custom Cake Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div><strong>Size:</strong> {order.sixInchCakes}×6" + {order.eightInchCakes}×8" cake{(order.sixInchCakes + order.eightInchCakes) > 1 ? 's' : ''}</div>
                        <div><strong>Layers:</strong> {order.layers}</div>
                        <div><strong>Shape:</strong> {order.shape}</div>
                        <div><strong>Flavors:</strong> {order.flavors.join(', ')}</div>
                        <div><strong>Icing:</strong> {order.icingType}</div>
                        {order.decorations.length > 0 && (
                          <div><strong>Decorations:</strong> {order.decorations.join(', ')}</div>
                        )}
                        {order.message && (
                          <div className="md:col-span-2"><strong>Message:</strong> "{order.message}"</div>
                        )}
                        {order.dietaryRestrictions.length > 0 && (
                          <div><strong>Dietary:</strong> {order.dietaryRestrictions.join(', ')}</div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Special Instructions */}
                  {order.specialInstructions && (
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">Special Instructions</h3>
                      <p className="text-sm">{order.specialInstructions}</p>
                    </div>
                  )}

                  {/* Delivery Method */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Delivery Method
                    </h3>
                    <p className="text-sm capitalize">{order.deliveryMethod}</p>
                  </div>

                  {/* Price */}
                  <div className="flex justify-between items-center bg-green-50 p-4 rounded-lg">
                    <span className="font-semibold">Total Amount:</span>
                    <span className="text-2xl font-bold text-green-700">
                      {formatPrice(order.totalPrice)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No orders found</h3>
            <p className="text-gray-500">Orders will appear here when customers place them.</p>
          </div>
        )}
      </div>
    </div>
  );
}