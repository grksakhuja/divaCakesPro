import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { Package, Phone, Mail, MapPin, Clock, CheckCircle, LogOut } from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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
                    <div className="flex gap-2">
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                      <Badge variant="outline">
                        {order.deliveryMethod === 'pickup' ? 'Pickup' : 'Delivery'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Customer Info */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Customer Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                      <div><strong>Name:</strong> {order.customerName}</div>
                      <div><strong>Email:</strong> {order.customerEmail}</div>
                      <div><strong>Phone:</strong> {order.customerPhone}</div>
                    </div>
                  </div>

                  {/* Cake Details */}
                  <div className="bg-pink-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Cake Specifications</h3>
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
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No orders yet</h3>
              <p className="text-gray-500">Orders will appear here when customers place them</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}