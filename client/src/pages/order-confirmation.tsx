import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Clock, MapPin, Phone, Mail, ArrowLeft, Share2, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface OrderDetails {
  id: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  layers: number;
  shape: string;
  flavors: string[];
  icingColor: string;
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

export default function OrderConfirmation() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);

  useEffect(() => {
    // Get order details from localStorage (set during order creation)
    const savedOrder = localStorage.getItem("latestOrder");
    if (savedOrder) {
      setOrderDetails(JSON.parse(savedOrder));
      // Clear from localStorage after retrieving
      localStorage.removeItem("latestOrder");
    } else {
      // Redirect if no order found
      setLocation("/");
    }
  }, [setLocation]);

  const handleShare = () => {
    toast({
      title: "Sharing Feature",
      description: "Share functionality coming soon!"
    });
  };

  const handleDownload = () => {
    toast({
      title: "Download Receipt",
      description: "Download feature coming soon!"
    });
  };

  const getIcingDisplayName = (icingType: string) => {
    const icingTypes = {
      butter: "Butter",
      buttercream: "Buttercream", 
      whipped: "Whipped",
      chocolate: "Chocolate",
      fondant: "Fondant"
    };
    return icingTypes[icingType as keyof typeof icingTypes] || icingType;
  };

  if (!orderDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  const estimatedDays = orderDetails.deliveryMethod === "pickup" ? "2-3" : "3-4";

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center pt-8">
          <div className="mb-4">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">
              Order Confirmed!
            </h1>
            <p className="text-neutral-600">
              Thank you for your order. We're excited to create your dream cake!
            </p>
          </div>
          
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600">Order Number</div>
                  <div className="text-2xl font-bold text-primary">#{orderDetails.id}</div>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <Clock className="w-4 h-4 mr-1" />
                  {estimatedDays} days
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="w-5 h-5 mr-2" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Name:</span>
              <span className="font-medium">{orderDetails.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="font-medium">{orderDetails.customerEmail}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Phone:</span>
              <span className="font-medium">{orderDetails.customerPhone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Delivery:</span>
              <span className="font-medium capitalize">
                {orderDetails.deliveryMethod === "pickup" ? "Store Pickup" : "Home Delivery"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Cake Details */}
        <Card>
          <CardHeader>
            <CardTitle>Your Cake Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Size:</span>
              <span className="font-medium">
                {orderDetails.sixInchCakes > 0 && `${orderDetails.sixInchCakes}x 6-inch`}
                {orderDetails.sixInchCakes > 0 && orderDetails.eightInchCakes > 0 && " + "}
                {orderDetails.eightInchCakes > 0 && `${orderDetails.eightInchCakes}x 8-inch`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Layers:</span>
              <span className="font-medium">
                {orderDetails.layers} {orderDetails.layers === 1 ? 'layer' : 'layers'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shape:</span>
              <span className="font-medium capitalize">{orderDetails.shape}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Flavors:</span>
              <span className="font-medium">
                {orderDetails.flavors.length > 0 ? orderDetails.flavors.join(", ") : "Vanilla"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Icing:</span>
              <span className="font-medium">
                {getIcingDisplayName(orderDetails.icingType)}
              </span>
            </div>
            {orderDetails.decorations.length > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Decorations:</span>
                <span className="font-medium">{orderDetails.decorations.join(", ")}</span>
              </div>
            )}
            {orderDetails.message && (
              <div className="flex justify-between">
                <span className="text-gray-600">Message:</span>
                <span className="font-medium">"{orderDetails.message}"</span>
              </div>
            )}
            {orderDetails.dietaryRestrictions.length > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Dietary:</span>
                <span className="font-medium">{orderDetails.dietaryRestrictions.join(", ")}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card className="cake-gradient text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold">Total Amount</div>
                <div className="text-sm opacity-90">
                  Ready in {estimatedDays} business days
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">
                  RM {(orderDetails.totalPrice / 100).toFixed(2)}
                </div>
                <div className="text-sm opacity-90">
                  {orderDetails.deliveryMethod === "delivery" ? "+ delivery fee" : "No delivery fee"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          <Button 
            className="w-full btn-touch btn-primary"
            onClick={() => setLocation("/")}
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Create Another Cake
          </Button>
          
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="btn-touch" onClick={handleShare}>
              <Share2 className="mr-2 h-4 w-4" />
              Share Order
            </Button>
            <Button variant="outline" className="btn-touch" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>
        </div>

        {/* Footer Info */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="text-center text-sm text-blue-800">
              <p className="font-medium mb-1">We'll contact you soon!</p>
              <p>Our team will call you within 24 hours to confirm your order details and arrange {orderDetails.deliveryMethod === "pickup" ? "pickup" : "delivery"}.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}