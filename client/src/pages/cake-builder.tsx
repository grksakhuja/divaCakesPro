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
  CheckCircle,
  X
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
  getDecorationOptionsWithPricing,
  type CakeConfig 
} from "@/types/cake";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useFeatureFlags } from "@/hooks/use-feature-flags";
import ImprovedButtonGrid from "@/components/ui/improved-button-grid";
import ImprovedSelectionCard from "@/components/ui/improved-selection-card";

// Add this right after the imports and before the export default function CakeBuilder()
const SIMPLIFIED_COLOR_PALETTE = [
  { id: "white", name: "White", hex: "#FFFFFF" },
  { id: "light-pink", name: "Pink", hex: "#FFB6C1" },
  { id: "sky-blue", name: "Blue", hex: "#87CEEB" },
  { id: "mint-green", name: "Green", hex: "#98FB98" },
  { id: "lemon-yellow", name: "Yellow", hex: "#F0E68C" },
  { id: "lavender", name: "Purple", hex: "#DDA0DD" },
  { id: "peach", name: "Orange", hex: "#FFA07A" },
  { id: "cream", name: "Cream", hex: "#F5DEB3" },
];

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
  
  // Feature flags
  const { featureFlags } = useFeatureFlags();

  // Fetch templates - only when feature flag is enabled
  const { data: templates, isLoading: templatesLoading, error: templatesError } = useQuery({
    queryKey: ["/api/templates"],
    enabled: featureFlags.templates.enableTemplateApi,
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
      
      <div className="pt-20 pb-40">
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
                <div className="text-center mb-16">
                  <div className="mb-12 mt-8">
                    <div className="text-6xl mb-1 animate-float">🎂🍰🧁</div>
                    <h1 className="text-5xl font-extrabold text-pink-600 mb-8 tracking-wide">
                      Sugar Art Diva
                    </h1>
                  </div>
                  <h2 className="text-2xl font-bold text-neutral-900 mb-3">
                    Build Your Dream Cake! 🎂
                  </h2>
                  <p className="text-neutral-500 text-lg">
                    Where Every Cake is a Masterpiece - Designed Just for You!
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Base Size Selection - IMPROVED with component */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-neutral-800">🎂 Choose Your Base Size</h3>
                    <ImprovedButtonGrid
                      items={[
                        {
                          id: "6inch",
                          onClick: () => {
                            updateConfig({ servings: 6 });
                            nextStep();
                          },
                          className: "btn-touch btn-primary",
                          children: (
                            <>
                              <div className="text-lg font-bold">6-inch</div>
                              <div className="text-sm opacity-90">5-7 servings</div>
                              <div className="text-xs font-semibold">
                                {pricingStructure?.basePrices?.['6inch'] 
                                  ? `RM ${(pricingStructure.basePrices['6inch'] / 100).toFixed(0)}`
                                  : 'RM 90'
                                }
                              </div>
                            </>
                          )
                        },
                        {
                          id: "8inch",
                          onClick: () => {
                            updateConfig({ servings: 8 });
                            nextStep();
                          },
                          className: "btn-touch btn-primary",
                          children: (
                            <>
                              <div className="text-lg font-bold">8-inch</div>
                              <div className="text-sm opacity-90">10-13 servings</div>
                              <div className="text-xs font-semibold">
                                {pricingStructure?.basePrices?.['8inch'] 
                                  ? `RM ${(pricingStructure.basePrices['8inch'] / 100).toFixed(0)}`
                                  : 'RM 160'
                                }
                              </div>
                            </>
                          )
                        }
                      ]}
                      columns={2}
                    />
                  </div>
                  
                  {/* TEMPLATE BUTTONS - FEATURE FLAG CONTROLLED */}
                  {featureFlags.templates.showTemplateSection && (
                    <>
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
                            basePrice: pricingStructure?.basePrices?.['6inch'] || 8000,
                            servings: 6,
                            sixInchCakes: 1,
                            eightInchCakes: 0,
                          };
                          handleTemplateSelect(fathersTemplate);
                        }}
                      >
                        👨‍👦 Father's Day Special Cake
                      </Button>
                    </>
                  )}

                  {/* FATHER'S DAY SPECIAL - ALWAYS AVAILABLE */}
                  <Separator />
                  
                  <div className="text-center text-sm text-neutral-500">
                    Special Occasion
                  </div>
                  
                  <Button 
                    variant="outline"
                    className="w-full btn-touch bg-blue-50 border-blue-300 text-blue-800 hover:bg-blue-100"
                    onClick={() => {
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
                        basePrice: pricingStructure?.basePrices?.['6inch'] || 8000,
                        servings: 6,
                        sixInchCakes: 1,
                        eightInchCakes: 0,
                      };
                      handleTemplateSelect(fathersTemplate);
                    }}
                  >
                    👨‍👦 Father's Day Special Cake
                  </Button>

                  {/* GENERAL TEMPLATES - FEATURE FLAG CONTROLLED */}
                  {featureFlags.templates.showTemplateSection && (
                    <>
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
                    </>
                  )}
                  
                  {/* TEMPLATE DISPLAY - FEATURE FLAG CONTROLLED */}
                  {featureFlags.templates.showTemplateSection && showTemplates && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 mt-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200 shadow-inner">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-semibold text-purple-800">Choose Your Template</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowTemplates(false)}
                            className="text-purple-600 hover:text-purple-800"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        {templatesError ? (
                          <div className="text-red-600 text-center py-4">
                            Failed to load templates. Please try again later.
                          </div>
                        ) : Array.isArray(templates) && templates.length > 0 ? (
                          <div className="grid gap-3">
                            {templates.map((template) => (
                              <div
                                key={template.id}
                                className="p-3 bg-white rounded-lg border border-purple-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer hover:border-purple-300"
                                onClick={() => handleTemplateSelect(template)}
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h5 className="font-medium text-purple-800">{template.name}</h5>
                                    <p className="text-sm text-purple-600 capitalize">{template.category.replace('-', ' ')}</p>
                                    <p className="text-xs text-neutral-600 mt-1">
                                      {template.layers} layer • {template.shape} • {template.servings} servings
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-medium text-purple-800">
                                      ₱{(template.basePrice / 100).toFixed(2)}
                                    </p>
                                    <p className="text-xs text-neutral-500">base price</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-4 text-neutral-600">
                            No templates available
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
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
                <div className="mb-6 text-center">
                  <h2 className="text-3xl font-bold text-neutral-800 mb-4">
                    🧁 Build Your Layers
                  </h2>
                  <p className="text-neutral-500">Add layers and choose your cake shape</p>
                </div>

                <CakePreview />

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-semibold text-lg">
                        Layers ({cakeConfig.layers}/3)
                      </h3>
                      <div className="flex gap-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateConfig({ 
                            layers: Math.max(1, cakeConfig.layers - 1),
                            flavors: cakeConfig.flavors.slice(0, -1)
                          })}
                          disabled={cakeConfig.layers <= 1}
                          className="w-12 h-12 rounded-full border-2 hover:border-red-300 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Minus className="h-5 w-5" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => updateConfig({ 
                            layers: Math.min(3, cakeConfig.layers + 1),
                            flavors: [...cakeConfig.flavors, "chocolate"]
                          })}
                          disabled={cakeConfig.layers >= 3}
                          className="w-12 h-12 rounded-full bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                    
                  {/* Centered Layer Information */}
                  <div className="flex justify-center mb-4">
                    <div className="flex items-center text-center py-3 px-6 bg-gray-50 rounded-lg border">
                      {/* Shape Icon */}
                      <div className="mr-3">
                        {cakeConfig.shape === 'round' && (
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-400 to-pink-500 border-2 border-pink-600 shadow-sm flex items-center justify-center">
                            <div className="w-3 h-3 rounded-full bg-white/30"></div>
                          </div>
                        )}
                        {cakeConfig.shape === 'square' && (
                          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-400 to-blue-500 border-2 border-blue-600 shadow-sm flex items-center justify-center">
                            <div className="w-3 h-3 rounded-sm bg-white/30"></div>
                          </div>
                        )}
                        {cakeConfig.shape === 'heart' && (
                          <div className="text-2xl">💖</div>
                        )}
                      </div>
                      
                      {/* Text Content */}
                      <div>
                        <div className="text-lg font-bold text-gray-800 mb-1">
                          {cakeConfig.layers} Layer{cakeConfig.layers > 1 ? 's' : ''}
                        </div>
                        <div className="text-sm text-gray-600">
                          {cakeConfig.shape.charAt(0).toUpperCase() + cakeConfig.shape.slice(1)} Shape
                        </div>
                      </div>
                    </div>
                  </div>
                  </CardContent>
                </Card>

                <ImprovedSelectionCard
                  title="Choose Shape"
                  items={[
                    { 
                      id: "round", 
                      name: "Round", 
                      icon: (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-pink-500 border-2 border-pink-600 shadow-sm flex items-center justify-center">
                          <div className="w-4 h-4 rounded-full bg-white/30"></div>
                        </div>
                      )
                    },
                    { 
                      id: "square", 
                      name: "Square", 
                      icon: (
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-blue-500 border-2 border-blue-600 shadow-sm flex items-center justify-center">
                          <div className="w-4 h-4 rounded-sm bg-white/30"></div>
                        </div>
                      )
                    },
                    { 
                      id: "heart", 
                      name: "Heart", 
                      icon: "💖"
                    }
                  ]}
                  selectedItems={cakeConfig.shape}
                  onSelectionChange={(shapeId) => updateConfig({ shape: shapeId as any })}
                  multiple={false}
                  columns={3}
                />

                <Button className="w-full btn-touch btn-primary mb-32" onClick={nextStep}>
                  🧁 Continue to Flavors
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            )}

            {/* Step 3: Flavors - IMPROVED but keeping ALL functionality */}
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
                <div className="mb-6 text-center">
                  <h2 className="text-3xl font-bold text-neutral-800 mb-4">
                    🍰 Choose Flavors
                  </h2>
                  <p className="text-neutral-500">Select flavors for each layer</p>
                </div>

                {Array.from({ length: cakeConfig.layers }, (_, layerIndex) => (
                  <ImprovedSelectionCard
                    key={layerIndex}
                    title={cakeConfig.layers === 1 
                      ? "Cake Flavor" 
                      : `Layer ${layerIndex + 1}${layerIndex === 0 ? " (Bottom)" : layerIndex === cakeConfig.layers - 1 ? " (Top)" : ""}`
                    }
                    items={FLAVOR_OPTIONS}
                    selectedItems={cakeConfig.flavors[layerIndex]}
                    onSelectionChange={(flavorId) => handleFlavorChange(layerIndex, flavorId)}
                    multiple={false}
                    columns={2}
                  />
                ))}

                <Button className="w-full btn-touch btn-primary mb-32" onClick={nextStep}>
                  🍰 Continue to Icing
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            )}

            {/* Step 4: Icing & Decorations - IMPROVED */}
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
                <div className="mb-6 text-center">
                  <h2 className="text-3xl font-bold text-neutral-800 mb-4">
                    🎨 Icing & Decorations
                  </h2>
                  <p className="text-neutral-500">Choose colors, icing type, and decorations</p>
                </div>

                <CakePreview />

                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">Icing Color</h3>
                    <div className="grid grid-cols-4 gap-4">
                      {SIMPLIFIED_COLOR_PALETTE.map((color) => (
                        <button
                          key={color.id}
                          onClick={() => updateConfig({ icingColor: color.hex })}
                          className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                            cakeConfig.icingColor === color.hex
                              ? "border-primary bg-primary/5 scale-105"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div
                            className="w-12 h-12 rounded-lg border-2 border-white shadow-md mb-2"
                            style={{ backgroundColor: color.hex }}
                          />
                          <span className="text-sm font-medium text-gray-700">
                            {color.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Icing Type - IMPROVED */}
                <ImprovedSelectionCard
                  title="Icing Type"
                  items={[
                    { id: "butter", name: "Butter", icon: "🧈" },
                    { id: "whipped", name: "Whipped", icon: "☁️" },
                    { id: "chocolate", name: "Chocolate (Premium)", icon: "🍫", premium: true },
                    { id: "fondant", name: "Fondant (Premium)", icon: "✨", premium: true },
                  ]}
                  selectedItems={cakeConfig.icingType}
                  onSelectionChange={(icingType) => updateConfig({ icingType: icingType as any })}
                  multiple={false}
                  columns={2}
                />

                {/* Decorations - Updated to use dynamic pricing */}
                <ImprovedSelectionCard
                  title="Add Decorations"
                  items={getDecorationOptionsWithPricing(pricingStructure)}
                  selectedItems={cakeConfig.decorations}
                  onSelectionChange={handleDecorationToggle}
                  multiple={true}
                  columns={2}
                />

                <Button className="w-full btn-touch btn-primary mb-32" onClick={nextStep}>
                  🎨 Continue to Message
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
                <div className="mb-6 text-center">
                  <h2 className="text-3xl font-bold text-neutral-800 mb-4">
                    💌 Add Your Message
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
                  💌 Continue to Dietary Options
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
                  <h2 className="text-3xl font-bold text-neutral-800 mb-4">
                    🌱 Dietary Preferences
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
                  📏 Continue to Size & Servings
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
                  <h2 className="text-3xl font-bold text-neutral-800 mb-4">
                    📏 Size & Servings
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
                            const newCount = Math.max(0, (cakeConfig.sixInchCakes || 0) - 1);
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
                            {cakeConfig.sixInchCakes || 0} cakes
                          </div>
                          <Slider
                            value={[cakeConfig.sixInchCakes || 0]}
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
                            const newCount = Math.min(5, (cakeConfig.sixInchCakes || 0) + 1);
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
                              servings: (cakeConfig.sixInchCakes || 0) * 6 + newCount * 8
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
                                servings: (cakeConfig.sixInchCakes || 0) * 6 + value * 8
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
                              servings: (cakeConfig.sixInchCakes || 0) * 6 + newCount * 8
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
                        {cakeConfig.sixInchCakes || 0} × 6-inch + {cakeConfig.eightInchCakes || 0} × 8-inch cakes
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
                  📞 Continue to Contact Info
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
                  <h2 className="text-3xl font-bold text-neutral-800 mb-4">
                    🎉 Almost Done!
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
                  <h2 className="text-3xl font-bold text-neutral-800 mb-4">
                    📋 Order Summary
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
                              d === 'gold-leaf' ? 'Gold leaf' :
                              d === 'fresh-fruit' ? 'Fresh fruit' :
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
                    {createOrderMutation.isPending ? "🎂 Placing Order..." : "🎉 Confirm & Place Order"}
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
