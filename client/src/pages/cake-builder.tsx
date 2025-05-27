import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Plus, 
  Minus, 
  Upload, 
  ShoppingCart, 
  Save, 
  Share2,
  RotateCcw,
  ArrowRight,
  Star,
  AlertTriangle,
  Check,
  Mail,
  User,
  CheckCircle
} from "lucide-react";
import { useCakeBuilder } from "@/lib/cake-builder-store";
import ProgressIndicator from "@/components/progress-indicator";
import CakePreview from "@/components/cake-preview";
import ColorPalette from "@/components/ui/color-palette";
import RunningCost from "@/components/running-cost";
import CustomerForm from "@/components/customer-form";
import { 
  FLAVOR_OPTIONS, 
  DECORATION_OPTIONS, 
  COLOR_PALETTE, 
  DIETARY_OPTIONS,
  DIETARY_NOTE,
  type CakeConfig 
} from "@/types/cake";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function CakeBuilder() {
  const { 
    currentStep, 
    cakeConfig, 
    updateConfig, 
    nextStep, 
    goToStep,
    resetBuilder 
  } = useCakeBuilder();
  
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [showTemplates, setShowTemplates] = useState(false);

  // Fetch templates
  const { data: templates, isLoading: templatesLoading, error: templatesError } = useQuery({
    queryKey: ["/api/templates"],
  });

  // Debug logging for templates
  useEffect(() => {
    console.log("Templates data:", templates);
    console.log("Templates loading:", templatesLoading);
    console.log("Templates error:", templatesError);
    console.log("Show templates state:", showTemplates);
  }, [templates, templatesLoading, templatesError, showTemplates]);

  // Price calculation
  const { data: pricing, refetch: recalculatePrice } = useQuery({
    queryKey: ["/api/calculate-price", cakeConfig],
    queryFn: async () => {
      const response = await apiRequest("/api/calculate-price", "POST", {
        layers: cakeConfig.layers,
        servings: cakeConfig.servings,
        decorations: cakeConfig.decorations,
        icingType: cakeConfig.icingType,
        dietaryRestrictions: cakeConfig.dietaryRestrictions,
        flavors: cakeConfig.flavors,
        shape: cakeConfig.shape,
        sixInchCakes: cakeConfig.sixInchCakes,
        eightInchCakes: cakeConfig.eightInchCakes,
        template: cakeConfig.template,
      });
      return response.json();
    },
    enabled: currentStep >= 2,
  });

  // Fetch pricing structure
  const { data: pricingStructure } = useQuery({
    queryKey: ["/api/pricing-structure"],
    queryFn: async () => {
      const response = await apiRequest("/api/pricing-structure", "GET");
      return response.json();
    },
  });

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await apiRequest("/api/orders", "POST", orderData);
      return response.json();
    },
    onSuccess: (data) => {
      // Store order details for confirmation page
      localStorage.setItem("latestOrder", JSON.stringify(data));
      
      toast({
        title: "Order Placed Successfully!",
        description: `Your order #${data.id} has been received.`,
      });
      
      // Redirect to confirmation page
      setLocation("/order-confirmation");
      resetBuilder();
    },
    onError: () => {
      toast({
        title: "Order Failed",
        description: "There was an error placing your order. Please try again.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (currentStep >= 2) {
      recalculatePrice();
    }
  }, [cakeConfig, currentStep, recalculatePrice]);

  const handleTemplateSelect = (template: any) => {
    updateConfig({
      template: template.id,
      layers: template.layers,
      shape: template.shape,
      flavors: template.flavors,
      icingColor: template.icingColor,
      icingType: template.icingType,
      decorations: template.decorations,
      servings: template.layers === 1 ? 6 : template.layers === 2 ? 8 : 10,
      sixInchCakes: template.sixInchCakes || 1,
      eightInchCakes: template.eightInchCakes || 0,
    });
    goToStep(8); // Jump to customer form step (step 8)
  };

  const handleFlavorChange = (layerIndex: number, flavor: string) => {
    const newFlavors = [...cakeConfig.flavors];
    
    // Ensure butter is always selected for at least one layer
    if (flavor === 'butter' && newFlavors[layerIndex] === 'butter') {
      // Don't allow deselecting butter if it's the only layer with butter
      const butterCount = newFlavors.filter(f => f === 'butter').length;
      if (butterCount <= 1) {
        return; // Prevent deselection
      }
    }
    
    newFlavors[layerIndex] = flavor;
    updateConfig({ flavors: newFlavors });
  };

  const handleDecorationToggle = (decorationId: string) => {
    const newDecorations = cakeConfig.decorations.includes(decorationId)
      ? cakeConfig.decorations.filter(d => d !== decorationId)
      : [...cakeConfig.decorations, decorationId];
    updateConfig({ decorations: newDecorations });
  };

  const handleDietaryToggle = (dietaryId: string) => {
    let newRestrictions = [...cakeConfig.dietaryRestrictions];
    
    if (dietaryId === "eggless" || dietaryId === "vegan") {
      // Make eggless and vegan mutually exclusive
      if (newRestrictions.includes(dietaryId)) {
        // Remove if already selected
        newRestrictions = newRestrictions.filter(d => d !== dietaryId);
      } else {
        // Remove the other option and add this one
        newRestrictions = newRestrictions.filter(d => d !== "eggless" && d !== "vegan");
        newRestrictions.push(dietaryId);
      }
    } else {
      // Handle other dietary options normally
      if (newRestrictions.includes(dietaryId)) {
        newRestrictions = newRestrictions.filter(d => d !== dietaryId);
      } else {
        newRestrictions.push(dietaryId);
      }
    }
    
    updateConfig({ dietaryRestrictions: newRestrictions });
  };

  const handleCustomerSubmit = (customerData: any) => {
    // Store customer data and move to order summary step
    updateConfig(customerData);
    nextStep(); // Go to order summary step (step 9)
  };

  const handleOrderConfirm = () => {
    // Ensure required customer fields are present
    if (!cakeConfig.customerName || !cakeConfig.customerEmail) {
      toast({
        title: "Missing Information",
        description: "Please provide your contact information first.",
        variant: "destructive",
      });
      return;
    }

    const orderData = {
      ...cakeConfig,
      totalPrice: pricing?.totalPrice || 0,
    };
    
    console.log("Order data being submitted:", orderData);
    createOrderMutation.mutate(orderData);
  };

  const stepVariants = {
    enter: { opacity: 0, x: 50 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <ProgressIndicator />
      <RunningCost pricingStructure={pricingStructure} />
      
      <div className="pt-20 pb-32">
        <div className="max-w-lg mx-auto px-4">
          <AnimatePresence mode="wait">
            {/* Step 1: Welcome */}
            {currentStep === 1 && (
              <motion.div
                key="welcome"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <img 
                    src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300" 
                    alt="Beautiful decorated cake" 
                    className="w-48 h-36 object-cover rounded-xl mx-auto mb-6 shadow-lg"
                  />
                  <h1 className="text-4xl font-bold text-neutral-900 font-heading mb-3">
                    Build Your Dream Cake!
                  </h1>
                  <p className="text-neutral-500 text-lg">
                    Create a custom cake that's perfect for your special occasion
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Base Size Selection */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-neutral-800">Choose Your Base Size</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <Button 
                        className="btn-touch btn-primary h-auto py-4 flex-col space-y-2"
                        onClick={() => {
                          updateConfig({ servings: 6 });
                          nextStep();
                        }}
                      >
                        <div className="text-lg font-bold">6-inch</div>
                        <div className="text-sm opacity-90">5-7 servings</div>
                        <div className="text-xs font-semibold">
                          {pricingStructure?.basePrices?.['6inch'] 
                            ? `RM ${(pricingStructure.basePrices['6inch'] / 100).toFixed(0)}`
                            : 'RM 100'
                          }
                        </div>
                      </Button>
                      
                      <Button 
                        className="btn-touch btn-primary h-auto py-4 flex-col space-y-2"
                        onClick={() => {
                          updateConfig({ servings: 8 });
                          nextStep();
                        }}
                      >
                        <div className="text-lg font-bold">8-inch</div>
                        <div className="text-sm opacity-90">10-13 servings</div>
                        <div className="text-xs font-semibold">
                          {pricingStructure?.basePrices?.['8inch'] 
                            ? `RM ${(pricingStructure.basePrices['8inch'] / 100).toFixed(0)}`
                            : 'RM 155'
                          }
                        </div>
                      </Button>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="text-center text-sm text-neutral-500">
                    Or choose from our templates
                  </div>
                  
                  <Button 
                    variant="outline"
                    className="w-full btn-touch btn-secondary"
                    onClick={() => setShowTemplates(!showTemplates)}
                    disabled={templatesLoading}
                  >
                    <Star className="mr-3 h-5 w-5" />
                    {templatesLoading ? (
                      <>
                        <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                        Loading Templates...
                      </>
                    ) : templatesError ? (
                      <>Error Loading Templates</>
                    ) : (
                      <>Choose a Template {Array.isArray(templates) ? `(${templates.length})` : ''}</>
                    )}
                  </Button>

                  <Button 
                    variant="outline"
                    className="w-full btn-touch bg-blue-50 border-blue-300 text-blue-800 hover:bg-blue-100"
                    onClick={() => {
                      // Create Father's Day template directly
                      const fathersTemplate = {
                        id: 999,
                        name: "Father's Day Special",
                        category: "fathers-day",
                        layers: 1,
                        shape: "round",
                        flavors: ["butter"],
                        icingColor: "#87CEEB",
                        icingType: "butter",
                        decorations: [],
                        basePrice: pricingStructure?.basePrices?.['6inch'] || 8000, // Dynamic price for Father's Day special
                        servings: 6, // Fixed at 6 servings
                        sixInchCakes: 1, // Set to 1 six-inch cake
                        eightInchCakes: 0, // No eight-inch cakes
                      };
                      handleTemplateSelect(fathersTemplate);
                    }}
                  >
                    👨‍👦 Father's Day Special Cake
                  </Button>
                </div>

                {showTemplates && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-6"
                  >
                    {templatesLoading && (
                      <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p className="mt-2 text-sm text-neutral-500">Loading templates...</p>
                      </div>
                    )}
                    
                    {templatesError && (
                      <div className="text-center py-8">
                        <p className="text-red-600 text-sm">Failed to load templates</p>
                        <p className="text-xs text-neutral-500 mt-1">
                          Error: {templatesError.message}
                        </p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={() => window.location.reload()}
                        >
                          Retry
                        </Button>
                      </div>
                    )}
                    
                    {!templatesLoading && !templatesError && Array.isArray(templates) && templates.length > 0 && (
                      <div className="grid grid-cols-2 gap-4">
                        {templates.map((template: any) => (
                          <Card 
                            key={template.id}
                            className="cursor-pointer hover:shadow-lg transition-shadow"
                            onClick={() => handleTemplateSelect(template)}
                          >
                            <CardContent className="p-4">
                              <img 
                                src={`https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=120`}
                                alt={template.name}
                                className="w-full h-20 object-cover rounded-lg mb-2"
                              />
                              <h3 className="font-semibold text-center text-sm">
                                {template.name}
                              </h3>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                    
                    {!templatesLoading && !templatesError && (!templates || !Array.isArray(templates) || templates.length === 0) && (
                      <div className="text-center py-8">
                        <p className="text-neutral-500 text-sm">No templates available</p>
                        <p className="text-xs text-neutral-400 mt-1">
                          Templates data: {JSON.stringify(templates)}
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Step 2: Layer Selection */}
            {currentStep === 2 && (
              <motion.div
                key="layers"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-neutral-900 font-heading mb-2">
                    Build Your Layers
                  </h2>
                  <p className="text-neutral-500">Add layers and choose your cake shape</p>
                </div>

                <CakePreview />

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">
                        Layers ({cakeConfig.layers}/3)
                      </h3>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateConfig({ 
                            layers: Math.max(1, cakeConfig.layers - 1),
                            flavors: cakeConfig.flavors.slice(0, -1)
                          })}
                          disabled={cakeConfig.layers <= 1}
                          className="w-10 h-10 rounded-full"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => updateConfig({ 
                            layers: Math.min(3, cakeConfig.layers + 1),
                            flavors: [...cakeConfig.flavors, "chocolate"]
                          })}
                          disabled={cakeConfig.layers >= 3}
                          className="w-10 h-10 rounded-full bg-green-500 hover:bg-green-600"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">Choose Shape</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: "round", name: "Round", icon: "⭕" },
                        { id: "square", name: "Square", icon: "⬜" },
                        { id: "heart", name: "Heart", icon: "💖" },
                      ].map((shape) => (
                        <Button
                          key={shape.id}
                          variant={cakeConfig.shape === shape.id ? "default" : "outline"}
                          className="h-16 flex-col"
                          onClick={() => updateConfig({ shape: shape.id as any })}
                        >
                          <span className="text-2xl mb-1">{shape.icon}</span>
                          <span className="text-sm">{shape.name}</span>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Button className="w-full btn-touch btn-primary mb-32" onClick={nextStep}>
                  Continue to Flavors
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            )}

            {/* Step 3: Flavor Selection */}
            {currentStep === 3 && (
              <motion.div
                key="flavors"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-neutral-900 font-heading mb-2">
                    Choose Flavors
                  </h2>
                  <p className="text-neutral-500">Select flavors for each layer</p>
                </div>

                {Array.from({ length: cakeConfig.layers }, (_, layerIndex) => (
                  <Card key={layerIndex}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">
                          Layer {layerIndex + 1} 
                          {layerIndex === 0 && " (Bottom)"}
                          {layerIndex === cakeConfig.layers - 1 && " (Top)"}
                        </h3>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {FLAVOR_OPTIONS.map((flavor) => (
                          <Button
                            key={flavor.id}
                            variant={cakeConfig.flavors[layerIndex] === flavor.id ? "default" : "outline"}
                            className="h-auto p-3 flex-col"
                            onClick={() => handleFlavorChange(layerIndex, flavor.id)}
                          >
                            <img 
                              src={flavor.image} 
                              alt={flavor.name}
                              className="w-full h-12 object-cover rounded mb-2"
                            />
                            <span className="text-sm font-medium">{flavor.name}</span>
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <Button className="w-full btn-touch btn-primary mb-32" onClick={nextStep}>
                  Continue to Icing
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            )}

            {/* Step 4: Icing & Decorations */}
            {currentStep === 4 && (
              <motion.div
                key="icing"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-neutral-900 font-heading mb-2">
                    Icing & Decorations
                  </h2>
                  <p className="text-neutral-500">Choose colors, icing type, and decorations</p>
                </div>

                <CakePreview />

                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">Icing Color</h3>
                    <ColorPalette
                      colors={COLOR_PALETTE}
                      selectedColor={cakeConfig.icingColor}
                      onColorSelect={(color) => updateConfig({ icingColor: color })}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">Icing Type</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: "butter", name: "Butter", icon: "🧈" },
                        { id: "whipped", name: "Whipped", icon: "☁️" },
                        { id: "chocolate", name: "Chocolate (Premium)", icon: "🍫" },
                        { id: "fondant", name: "Fondant (Premium)", icon: "✨" },
                      ].map((icing) => (
                        <Button
                          key={icing.id}
                          variant={cakeConfig.icingType === icing.id ? "default" : "outline"}
                          className="h-16 flex-col"
                          onClick={() => updateConfig({ icingType: icing.id as any })}
                        >
                          <span className="text-2xl mb-1">{icing.icon}</span>
                          <span className="text-sm">{icing.name}</span>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">Add Decorations</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {DECORATION_OPTIONS.map((decoration) => (
                        <Button
                          key={decoration.id}
                          variant={cakeConfig.decorations.includes(decoration.id) ? "default" : "outline"}
                          className="h-auto p-3 flex-col relative"
                          onClick={() => handleDecorationToggle(decoration.id)}
                        >
                          <img 
                            src={decoration.image} 
                            alt={decoration.name}
                            className="w-full h-12 object-cover rounded mb-2"
                          />
                          <span className="text-sm font-medium">{decoration.name}</span>
                          <Badge variant="secondary" className="text-xs mt-1">
                            +RM {(decoration.price / 100).toFixed(2)}
                          </Badge>
                          {cakeConfig.decorations.includes(decoration.id) && (
                            <div className="absolute top-2 right-2">
                              <Check className="h-4 w-4 text-green-600" />
                            </div>
                          )}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Button className="w-full btn-touch btn-primary mb-32" onClick={nextStep}>
                  Continue to Message
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            )}

            {/* Step 5: Message */}
            {currentStep === 5 && (
              <motion.div
                key="message"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-neutral-900 font-heading mb-2">
                    Add Your Message
                  </h2>
                  <p className="text-neutral-500">Personalize your cake with text and photos</p>
                </div>

                <CakePreview />

                <Card>
                  <CardContent className="p-6">
                    <Label htmlFor="message" className="text-base font-semibold">
                      Your Message
                    </Label>
                    <Input
                      id="message"
                      placeholder="Enter your message..."
                      value={cakeConfig.message || ""}
                      onChange={(e) => updateConfig({ message: e.target.value })}
                      maxLength={25}
                      className="mt-2 text-lg"
                    />
                    <div className="text-right text-sm text-neutral-500 mt-2">
                      {(cakeConfig.message || "").length}/25 characters
                    </div>
                  </CardContent>
                </Card>

                <Button className="w-full btn-touch btn-primary" onClick={nextStep}>
                  Continue to Dietary Options
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            )}

            {/* Step 6: Dietary Preferences */}
            {currentStep === 6 && (
              <motion.div
                key="dietary"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-neutral-900 font-heading mb-2">
                    Dietary Preferences
                  </h2>
                  <p className="text-neutral-500">Select any dietary requirements or allergen restrictions</p>
                </div>

                <Card>
                  <CardContent className="p-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center">
                        <span className="text-green-600 mr-2">🌿</span>
                        <span className="text-sm text-green-800 font-medium">All our cakes are made with halal ingredients</span>
                      </div>
                    </div>
                    
                    <h3 className="font-semibold mb-4">Dietary Requirements</h3>
                    <div className="space-y-3">
                      {DIETARY_OPTIONS.map((option) => (
                        <div
                          key={option.id}
                          className={`flex items-center p-3 border-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
                            cakeConfig.dietaryRestrictions.includes(option.id)
                              ? "border-primary bg-primary/5"
                              : option.id === "nut-free"
                              ? "border-orange-300 bg-orange-50"
                              : "border-gray-200"
                          }`}
                          onClick={() => handleDietaryToggle(option.id)}
                        >
                          <Checkbox
                            checked={cakeConfig.dietaryRestrictions.includes(option.id)}
                            onChange={() => handleDietaryToggle(option.id)}
                            className="mr-3"
                          />
                          <div className="flex items-center flex-1">
                            <span className="text-xl mr-3">{option.icon}</span>
                            <div>
                              <div className="font-medium">{option.name}</div>
                              <div className="text-sm text-gray-500">{option.description}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <AlertTriangle className="inline w-4 h-4 mr-2" />
                        {DIETARY_NOTE}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-red-200 bg-red-50">
                  <CardContent className="p-4">
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-red-500 mr-3 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-red-800 mb-2">
                          Important Allergen Information
                        </h4>
                        <p className="text-sm text-red-700">
                          Please inform us of any severe allergies. Some products are made in 
                          facilities that also process nuts, dairy, and gluten.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Button className="w-full btn-touch btn-primary" onClick={nextStep}>
                  Continue to Size
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            )}

            {/* Step 7: Size & Servings */}
            {currentStep === 7 && (
              <motion.div
                key="size"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-neutral-900 font-heading mb-2">
                    Size & Servings
                  </h2>
                  <p className="text-neutral-500">Choose the perfect size for your occasion</p>
                </div>

                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-6">Choose Your Cake Combination</h3>
                    
                    {/* 6-inch Cakes Slider */}
                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between items-center">
                        <Label className="text-base font-medium">6-inch Cakes (5-7 servings each)</Label>
                        <div className="text-sm text-gray-500">
                          {pricingStructure?.basePrices?.['6inch'] 
                            ? `RM ${(pricingStructure.basePrices['6inch'] / 100).toFixed(0)} each`
                            : 'RM 100 each'}
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newCount = Math.max(0, (cakeConfig.sixInchCakes || 1) - 1);
                            updateConfig({ 
                              sixInchCakes: newCount,
                              servings: newCount * 6 + (cakeConfig.eightInchCakes || 0) * 8
                            });
                          }}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        
                        <div className="flex-1">
                          <div className="text-center text-lg font-semibold mb-2">
                            {cakeConfig.sixInchCakes || 1} cakes
                          </div>
                          <Slider
                            value={[cakeConfig.sixInchCakes || 1]}
                            onValueChange={([value]) => {
                              updateConfig({ 
                                sixInchCakes: value,
                                servings: value * 6 + (cakeConfig.eightInchCakes || 0) * 8
                              });
                            }}
                            max={5}
                            min={0}
                            step={1}
                            className="w-full"
                          />
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newCount = Math.min(5, (cakeConfig.sixInchCakes || 1) + 1);
                            updateConfig({ 
                              sixInchCakes: newCount,
                              servings: newCount * 6 + (cakeConfig.eightInchCakes || 0) * 8
                            });
                          }}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* 8-inch Cakes Slider */}
                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between items-center">
                        <Label className="text-base font-medium">8-inch Cakes (10-13 servings each)</Label>
                        <div className="text-sm text-gray-500">
                          {pricingStructure?.basePrices?.['8inch'] 
                            ? `RM ${(pricingStructure.basePrices['8inch'] / 100).toFixed(0)} each`
                            : 'RM 155 each'}
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newCount = Math.max(0, (cakeConfig.eightInchCakes || 0) - 1);
                            updateConfig({ 
                              eightInchCakes: newCount,
                              servings: (cakeConfig.sixInchCakes || 1) * 6 + newCount * 8
                            });
                          }}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        
                        <div className="flex-1">
                          <div className="text-center text-lg font-semibold mb-2">
                            {cakeConfig.eightInchCakes || 0} cakes
                          </div>
                          <Slider
                            value={[cakeConfig.eightInchCakes || 0]}
                            onValueChange={([value]) => {
                              updateConfig({ 
                                eightInchCakes: value,
                                servings: (cakeConfig.sixInchCakes || 1) * 6 + value * 8
                              });
                            }}
                            max={3}
                            min={0}
                            step={1}
                            className="w-full"
                          />
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newCount = Math.min(3, (cakeConfig.eightInchCakes || 0) + 1);
                            updateConfig({ 
                              eightInchCakes: newCount,
                              servings: (cakeConfig.sixInchCakes || 1) * 6 + newCount * 8
                            });
                          }}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Summary */}
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-primary mb-1">
                        {cakeConfig.servings} Total Servings
                      </div>
                      <div className="text-sm text-gray-600">
                        {cakeConfig.sixInchCakes || 1} × 6-inch + {cakeConfig.eightInchCakes || 0} × 8-inch cakes
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {pricing && (
                  <Card className="cake-gradient text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-lg font-semibold">Estimated Price</div>
                          <div className="text-sm opacity-90">Based on your selections</div>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold">
                            RM {(pricing.totalPrice / 100).toFixed(2)}
                          </div>
                          <div className="text-sm opacity-90">+ delivery</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Button className="w-full btn-touch btn-primary" onClick={nextStep}>
                  Review & Order
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            )}

            {/* Step 8: Customer Information */}
            {currentStep === 8 && (
              <motion.div
                key="customer"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-neutral-900 font-heading mb-2">
                    Almost Done!
                  </h2>
                  <p className="text-neutral-500">Enter your contact details to complete your order</p>
                </div>

                <CustomerForm 
                  onSubmit={handleCustomerSubmit}
                  isLoading={createOrderMutation.isPending}
                />
              </motion.div>
            )}

            {/* Step 9: Order Summary & Final Confirmation */}
            {currentStep === 9 && (
              <motion.div
                key="summary"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-neutral-900 font-heading mb-2">
                    Order Summary
                  </h2>
                  <p className="text-neutral-500">Review your custom cake before placing your order</p>
                </div>

                {/* Customer Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Mail className="w-5 h-5 mr-2" />
                      Customer Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{cakeConfig.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{cakeConfig.customerEmail}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-medium">{cakeConfig.customerPhone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Delivery:</span>
                      <span className="font-medium">
                        {cakeConfig.deliveryMethod === 'pickup' ? 'Store Pickup' : 'Home Delivery'}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Cake Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Your Custom Cake</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <CakePreview />
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Size:</span>
                        <span className="font-medium">
                          {cakeConfig.sixInchCakes > 0 && `${cakeConfig.sixInchCakes}×6" `}
                          {cakeConfig.eightInchCakes > 0 && `${cakeConfig.eightInchCakes}×8" `}
                          cake{(cakeConfig.sixInchCakes + cakeConfig.eightInchCakes) > 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Flavors:</span>
                        <span className="font-medium">{cakeConfig.flavors.length > 0 ? cakeConfig.flavors.join(', ') : 'Butter'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Icing:</span>
                        <span className="font-medium">{cakeConfig.icingType}</span>
                      </div>
                      {cakeConfig.decorations.length > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Decorations:</span>
                          <span className="font-medium">{cakeConfig.decorations.join(', ')}</span>
                        </div>
                      )}
                      {cakeConfig.message && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Message:</span>
                          <span className="font-medium">"{cakeConfig.message}"</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Order Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Layers:</span>
                      <span className="font-medium">
                        {cakeConfig.layers} {cakeConfig.layers === 1 ? 'layer' : 'layers'} ({cakeConfig.flavors.join(", ")})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shape:</span>
                      <span className="font-medium capitalize">{cakeConfig.shape}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Icing:</span>
                      <span className="font-medium">
                        {(() => {
                          const icingTypes = {
                            butter: "Butter",
                            buttercream: "Buttercream", 
                            whipped: "Whipped",
                            chocolate: "Chocolate",
                            fondant: "Fondant"
                          };
                          return icingTypes[cakeConfig.icingType as keyof typeof icingTypes] || cakeConfig.icingType;
                        })()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Decorations:</span>
                      <span className="font-medium">
                        {cakeConfig.decorations.length > 0 
                          ? cakeConfig.decorations.join(", ") 
                          : "None"}
                      </span>
                    </div>
                    {cakeConfig.message && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Message:</span>
                        <span className="font-medium">"{cakeConfig.message}"</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Servings:</span>
                      <span className="font-medium">{cakeConfig.servings} people</span>
                    </div>
                    {cakeConfig.dietaryRestrictions.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Dietary:</span>
                        <span className="font-medium">
                          {cakeConfig.dietaryRestrictions.join(", ")}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {pricing && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Price Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          Base: {cakeConfig.sixInchCakes > 0 && `${cakeConfig.sixInchCakes}×6" `}
                          {cakeConfig.eightInchCakes > 0 && `${cakeConfig.eightInchCakes}×8" `}
                          ({cakeConfig.layers} {cakeConfig.layers === 1 ? 'layer' : 'layers'})
                        </span>
                        <span>RM {(pricing.breakdown.base / 100).toFixed(2)}</span>
                      </div>
                      
                      {pricing.breakdown.layers > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Extra layers: +{cakeConfig.layers - 1}</span>
                          <span>RM {(pricing.breakdown.layers / 100).toFixed(2)}</span>
                        </div>
                      )}
                      
                      {pricing.breakdown.flavors > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            Premium flavors: {cakeConfig.flavors.includes('chocolate') && 'Chocolate '}
                            {cakeConfig.flavors.filter(f => f.includes('poppyseed')).length > 0 && 'Poppyseed'}
                          </span>
                          <span>RM {(pricing.breakdown.flavors / 100).toFixed(2)}</span>
                        </div>
                      )}
                      
                      {pricing.breakdown.shape > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            {cakeConfig.shape === 'heart' ? 'Heart' : cakeConfig.shape} shape upgrade
                          </span>
                          <span>RM {(pricing.breakdown.shape / 100).toFixed(2)}</span>
                        </div>
                      )}
                      
                      {pricing.breakdown.decorations > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            Decorations: {cakeConfig.decorations.map(d => 
                              d === 'flowers' ? 'Flowers' :
                              d === 'gold' ? 'Gold leaf' :
                              d === 'fruit' ? 'Fresh fruit' :
                              d === 'sprinkles' ? 'Sprinkles' :
                              d === 'happy-birthday' ? 'Birthday topper' :
                              d === 'anniversary' ? 'Anniversary topper' : d
                            ).join(', ')}
                          </span>
                          <span>RM {(pricing.breakdown.decorations / 100).toFixed(2)}</span>
                        </div>
                      )}
                      
                      {pricing.breakdown.icing > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            {cakeConfig.icingType === 'chocolate' ? 'Chocolate' : 
                             cakeConfig.icingType === 'buttercream' ? 'Buttercream' :
                             cakeConfig.icingType === 'fondant' ? 'Fondant' :
                             cakeConfig.icingType === 'whipped' ? 'Whipped' : 
                             cakeConfig.icingType} icing upgrade
                          </span>
                          <span>RM {(pricing.breakdown.icing / 100).toFixed(2)}</span>
                        </div>
                      )}
                      
                      {pricing.breakdown.dietary > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            {cakeConfig.dietaryRestrictions.map(d => 
                              d === 'eggless' ? 'Eggless' :
                              d === 'vegan' ? 'Vegan' :
                              d === 'halal' ? 'Halal' : d
                            ).join(', ')} option
                          </span>
                          <span>RM {(pricing.breakdown.dietary / 100).toFixed(2)}</span>
                        </div>
                      )}
                      
                      <Separator />
                      <div className="flex justify-between font-bold text-xl text-primary">
                        <span>Total</span>
                        <span>RM {(pricing.totalPrice / 100).toFixed(2)}</span>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">Delivery Options</h3>
                    <RadioGroup 
                      value={cakeConfig.deliveryMethod} 
                      onValueChange={(value: "pickup" | "delivery") => 
                        updateConfig({ deliveryMethod: value })
                      }
                    >
                      <div className="flex items-center space-x-2 p-3 border-2 border-primary bg-primary/5 rounded-lg">
                        <RadioGroupItem value="pickup" id="pickup" />
                        <div className="flex-1">
                          <Label htmlFor="pickup" className="font-medium">Store Pickup</Label>
                          <div className="text-sm text-gray-600">Ready in 2-3 business days</div>
                        </div>
                        <div className="font-medium text-green-600">FREE</div>
                      </div>
                      <div className="flex items-center space-x-2 p-3 border-2 border-gray-200 rounded-lg">
                        <RadioGroupItem value="delivery" id="delivery" />
                        <div className="flex-1">
                          <Label htmlFor="delivery" className="font-medium">Home Delivery</Label>
                          <div className="text-sm text-gray-600">Same day or next day available</div>
                        </div>
                        <div className="font-medium">RM 15.00</div>
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>

                {/* Final Confirmation Button */}
                <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-6 rounded-lg text-center">
                  <div className="text-lg font-semibold mb-2">Total Amount</div>
                  <div className="text-3xl font-bold">
                    RM {pricing ? (pricing.totalPrice / 100).toFixed(2) : '0.00'}
                  </div>
                  <div className="text-sm opacity-90 mt-2">
                    Ready in 2-3 business days
                  </div>
                </div>

                <div className="space-y-3 mb-32">
                  <Button 
                    className="w-full btn-touch btn-primary h-12"
                    onClick={handleOrderConfirm}
                    disabled={createOrderMutation.isPending}
                  >
                    {createOrderMutation.isPending ? "Placing Order..." : "Confirm & Place Order"}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full btn-touch"
                    onClick={() => goToStep(8)}
                  >
                    ← Back to Edit Details
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
