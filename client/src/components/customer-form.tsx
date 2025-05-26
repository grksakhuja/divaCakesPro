import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { User, Mail, Phone, MapPin, MessageSquare } from "lucide-react";

const customerFormSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  customerEmail: z.string().email("Please enter a valid email address"),
  customerPhone: z.string().min(10, "Please enter a valid phone number"),
  deliveryMethod: z.enum(["pickup", "delivery"]),
  specialInstructions: z.string().optional(),
  deliveryAddress: z.string().optional(),
}).refine((data) => {
  if (data.deliveryMethod === "delivery" && (!data.deliveryAddress || data.deliveryAddress.trim() === "")) {
    return false;
  }
  return true;
}, {
  message: "Delivery address is required for delivery orders",
  path: ["deliveryAddress"],
});

type CustomerFormData = z.infer<typeof customerFormSchema>;

interface CustomerFormProps {
  onSubmit: (data: CustomerFormData) => void;
  isLoading?: boolean;
}

export default function CustomerForm({ onSubmit, isLoading }: CustomerFormProps) {
  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      deliveryMethod: "pickup",
      specialInstructions: "",
      deliveryAddress: "",
    },
  });

  const watchDeliveryMethod = form.watch("deliveryMethod");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <User className="w-5 h-5 mr-2" />
          Contact Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="customerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      Full Name
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter your full name" 
                        {...field} 
                        className="h-12"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customerEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      <Mail className="w-4 h-4 mr-2" />
                      Email Address
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="email"
                        placeholder="your.email@example.com" 
                        {...field} 
                        className="h-12"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customerPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      <Phone className="w-4 h-4 mr-2" />
                      Phone Number
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="tel"
                        placeholder="60123456789" 
                        {...field} 
                        className="h-12"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Delivery Method */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="deliveryMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      How would you like to receive your cake?
                    </FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-2 gap-4"
                      >
                        <div className="flex items-center space-x-2 border rounded-lg p-4">
                          <RadioGroupItem value="pickup" id="pickup" />
                          <Label htmlFor="pickup" className="flex-1 cursor-pointer">
                            <div className="font-medium">Store Pickup</div>
                            <div className="text-sm text-gray-600">Pick up from our store</div>
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 border rounded-lg p-4">
                          <RadioGroupItem value="delivery" id="delivery" />
                          <Label htmlFor="delivery" className="flex-1 cursor-pointer">
                            <div className="font-medium">Home Delivery</div>
                            <div className="text-sm text-gray-600">We'll deliver to you</div>
                          </Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Delivery Address (only show if delivery is selected) */}
              {watchDeliveryMethod === "delivery" && (
                <FormField
                  control={form.control}
                  name="deliveryAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Delivery Address</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter your full delivery address including postcode and state"
                          {...field} 
                          className="min-h-[80px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Special Instructions */}
            <FormField
              control={form.control}
              name="specialInstructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Special Instructions (Optional)
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Any special requests or delivery instructions..."
                      {...field} 
                      className="min-h-[60px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full btn-touch btn-primary h-12"
              disabled={isLoading}
            >
              {isLoading ? "Creating Order Summary..." : "Continue to Order Summary"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}