import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { Package, Phone, Mail, MapPin, Clock, CheckCircle, LogOut, Trash2, AlertTriangle, User, RotateCcw, DollarSign, Instagram, FileText, Cake, ShoppingBag, TrendingUp, Calendar, Sparkles } from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/admin/admin-layout";
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
      case 'pending': return 'bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-800 border-orange-200';
      case 'picked up': return 'bg-gradient-to-r from-green-100 to-emerald-100 text-emerald-800 border-emerald-200';
      case 'confirmed': return 'bg-gradient-to-r from-blue-100 to-indigo-100 text-indigo-800 border-indigo-200';
      case 'in-progress': return 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-purple-200';
      case 'ready': return 'bg-gradient-to-r from-teal-100 to-green-100 text-teal-800 border-teal-200';
      case 'completed': return 'bg-gradient-to-r from-gray-100 to-slate-100 text-slate-800 border-slate-200';
      default: return 'bg-gradient-to-r from-gray-100 to-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return Clock;
      case 'picked up': return CheckCircle;
      case 'confirmed': return Calendar;
      case 'in-progress': return Package;
      case 'ready': return Cake;
      case 'completed': return ShoppingBag;
      default: return Package;
    }
  };

  // Calculate stats
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((order: Order) => order.status === 'pending').length;
  const totalRevenue = orders.reduce((sum: number, order: Order) => sum + order.totalPrice, 0);
  const todayOrders = orders.filter((order: Order) => {
    const orderDate = new Date(order.orderDate);
    const today = new Date();
    return orderDate.toDateString() === today.toDateString();
  }).length;

  return (
    <AdminLayout 
      title="Order Management" 
      description="View and manage incoming cake orders"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-600 text-sm font-medium">Total Orders</p>
                <p className="text-3xl font-bold text-pink-900 mt-1">{totalOrders}</p>
              </div>
              <div className="bg-pink-200 p-3 rounded-xl">
                <ShoppingBag className="w-6 h-6 text-pink-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-orange-100 border-orange-200 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">Pending Orders</p>
                <p className="text-3xl font-bold text-orange-900 mt-1">{pendingOrders}</p>
              </div>
              <div className="bg-orange-200 p-3 rounded-xl">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-emerald-200 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-600 text-sm font-medium">Total Revenue</p>
                <p className="text-3xl font-bold text-emerald-900 mt-1">{formatPrice(totalRevenue)}</p>
              </div>
              <div className="bg-emerald-200 p-3 rounded-xl">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-indigo-100 border-indigo-200 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-600 text-sm font-medium">Today's Orders</p>
                <p className="text-3xl font-bold text-indigo-900 mt-1">{todayOrders}</p>
              </div>
              <div className="bg-indigo-200 p-3 rounded-xl">
                <Calendar className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-end mb-6">
        <Button 
          onClick={() => refetch()} 
          disabled={isLoading}
          className="bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600 shadow-md"
        >
          <RotateCcw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? "Refreshing..." : "Refresh Orders"}
        </Button>
      </div>

        {Array.isArray(orders) && orders.length > 0 ? (
          <div className="grid gap-6">
            {orders.map((order: Order) => {
              const StatusIcon = getStatusIcon(order.status);
              return (
                <Card key={order.id} className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-l-pink-400">
                  <CardHeader className="pb-4 bg-gradient-to-r from-pink-50 to-purple-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-3 text-gray-800">
                          <div className="bg-gradient-to-br from-pink-400 to-purple-500 p-2 rounded-lg">
                            <Cake className="w-5 h-5 text-white" />
                          </div>
                          <span className="text-xl">Order #{order.id}</span>
                        </CardTitle>
                        <div className="flex items-center gap-4 mt-2">
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Clock className="w-4 h-4 text-purple-500" />
                            {formatDistanceToNow(new Date(order.orderDate), { addSuffix: true })}
                          </p>
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <User className="w-4 h-4 text-pink-500" />
                            {order.customerName}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 items-center">
                        <Badge className={`${getStatusColor(order.status)} border px-3 py-1 flex items-center gap-1`}>
                          <StatusIcon className="w-3 h-3" />
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
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                      <h3 className="font-semibold mb-3 flex items-center gap-2 text-blue-900">
                        <div className="bg-blue-200 p-1 rounded">
                          <User className="w-4 h-4 text-blue-700" />
                        </div>
                        Customer Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Mail className="w-4 h-4 text-blue-500" />
                          <span className="font-medium">{order.customerEmail}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <Phone className="w-4 h-4 text-blue-500" />
                          <span className="font-medium">{order.customerPhone || 'Not provided'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    {order.hasLineItems ? (
                      order.orderItems && order.orderItems.length > 0 ? (
                      <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-4 rounded-xl border border-pink-100">
                        <h3 className="font-semibold mb-3 flex items-center gap-2 text-pink-900">
                          <div className="bg-pink-200 p-1 rounded">
                            <ShoppingBag className="w-4 h-4 text-pink-700" />
                          </div>
                          Order Items ({order.orderItems.length})
                        </h3>
                        <div className="space-y-3">
                          {order.orderItems.map((item, index) => (
                            <div key={item.id} className="bg-white p-4 rounded-lg border border-pink-200 hover:border-pink-300 transition-colors">
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
                      <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-4 rounded-xl border border-pink-100">
                        <h3 className="font-semibold mb-3 flex items-center gap-2 text-pink-900">
                          <div className="bg-pink-200 p-1 rounded">
                            <Cake className="w-4 h-4 text-pink-700" />
                          </div>
                          Custom Cake Details
                        </h3>
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
                      <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-4 rounded-xl border border-yellow-100">
                        <h3 className="font-semibold mb-2 flex items-center gap-2 text-yellow-900">
                          <div className="bg-yellow-200 p-1 rounded">
                            <AlertTriangle className="w-4 h-4 text-yellow-700" />
                          </div>
                          Special Instructions
                        </h3>
                        <p className="text-sm text-gray-700">{order.specialInstructions}</p>
                      </div>
                    )}

                    {/* Delivery Method */}
                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-xl border border-purple-100">
                      <h3 className="font-semibold mb-2 flex items-center gap-2 text-purple-900">
                        <div className="bg-purple-200 p-1 rounded">
                          <MapPin className="w-4 h-4 text-purple-700" />
                        </div>
                        Delivery Method
                      </h3>
                      <p className="text-sm capitalize font-medium text-gray-700">{order.deliveryMethod}</p>
                    </div>

                    {/* Price */}
                    <div className="flex justify-between items-center bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-xl border border-emerald-200">
                      <div className="flex items-center gap-2">
                        <div className="bg-emerald-200 p-1 rounded">
                          <DollarSign className="w-5 h-5 text-emerald-700" />
                        </div>
                        <span className="font-semibold text-emerald-900">Total Amount:</span>
                      </div>
                      <span className="text-2xl font-bold text-emerald-700">
                        {formatPrice(order.totalPrice)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="bg-gradient-to-br from-pink-50 to-purple-50 border-pink-200">
            <CardContent className="text-center py-16">
              <div className="bg-gradient-to-br from-pink-100 to-purple-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="w-12 h-12 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No orders yet!</h3>
              <p className="text-gray-600 mb-6">Orders will appear here when customers place them.</p>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <Sparkles className="w-4 h-4 text-pink-500" />
                <span>Check back soon for new cake orders</span>
                <Sparkles className="w-4 h-4 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        )}
      </AdminLayout>
  );
}