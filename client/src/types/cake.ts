export interface CakeConfig {
  // Step 1: Template or scratch
  template?: string;
  
  // Step 2: Layers
  layers: number;
  shape: "round" | "square" | "heart" | "custom";
  
  // Step 3: Flavors
  flavors: string[];
  
  // Step 4: Icing & Decorations
  icingColor: string;
  icingType: "butter" | "buttercream" | "fondant" | "whipped" | "chocolate";
  decorations: string[];
  
  // Step 5: Message
  message?: string;
  messageFont: "classic" | "script" | "modern";
  photoUpload?: File;
  
  // Step 6: Dietary
  dietaryRestrictions: string[];
  
  // Step 7: Size
  servings: number;
  sixInchCakes: number;
  eightInchCakes: number;
  
  // Step 8: Delivery
  deliveryMethod: "pickup" | "delivery";
  
  // Customer information
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  deliveryAddress?: string;
  specialInstructions?: string;
  
  // Pricing
  totalPrice?: number;
  priceBreakdown?: {
    base: number;
    decorations: number;
    icing: number;
    dietary: number;
  };
}

export interface FlavorOption {
  id: string;
  name: string;
  image: string;
  description?: string;
}

export interface DecorationOption {
  id: string;
  name: string;
  image: string;
  premium?: boolean;
}

export interface ColorOption {
  id: string;
  name: string;
  hex: string;
}

export const FLAVOR_OPTIONS: FlavorOption[] = [
  {
    id: "butter",
    name: "Butter",
    image: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=60",
  },
  {
    id: "chocolate",
    name: "Chocolate ⭐ Premium",
    image: "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=60",
  },
  {
    id: "orange",
    name: "Orange",
    image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=60",
  },
  {
    id: "orange-poppyseed",
    name: "Orange + Poppyseed ⭐ Premium",
    image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=60",
    description: "Premium option with extra cost"
  },
  {
    id: "lemon",
    name: "Lemon",
    image: "https://images.unsplash.com/photo-1621303837174-89787a7d4729?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=60",
  },
  {
    id: "lemon-poppyseed",
    name: "Lemon + Poppyseed ⭐ Premium",
    image: "https://images.unsplash.com/photo-1621303837174-89787a7d4729?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=60",
    description: "Premium option with extra cost"
  },
];

export const DECORATION_OPTIONS: DecorationOption[] = [
  {
    id: "sprinkles",
    name: "Sprinkles",
    image: "https://images.unsplash.com/photo-1599785209707-a456fc1337bb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=60",
  },
  {
    id: "flowers",
    name: "Flowers",
    image: "https://images.unsplash.com/photo-1557925923-cd4648e211a0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=60",
    premium: true,
  },
  {
    id: "fresh-fruit",
    name: "Fresh Fruit",
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=60",
    premium: true,
  },
  {
    id: "gold-leaf",
    name: "Gold Leaf",
    image: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&h=60",
    premium: true,
  },
  {
    id: "happy-birthday",
    name: "Happy Birthday Topper",
    image: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&h=60",
  },
  {
    id: "anniversary",
    name: "Anniversary Topper", 
    image: "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&h=60",
  },
];

export const COLOR_PALETTE: ColorOption[] = [
  { id: "sky-blue", name: "Sky Blue", hex: "#87CEEB" },
  { id: "light-pink", name: "Light Pink", hex: "#FFB6C1" },
  { id: "hot-pink", name: "Hot Pink", hex: "#FF69B4" },
  { id: "lavender", name: "Lavender", hex: "#DDA0DD" },
  { id: "mint-green", name: "Mint Green", hex: "#98FB98" },
  { id: "lemon-yellow", name: "Lemon Yellow", hex: "#F0E68C" },
  { id: "peach", name: "Peach", hex: "#FFA07A" },
  { id: "white", name: "White", hex: "#FFFFFF" },
  { id: "cream", name: "Cream", hex: "#F5DEB3" },
  { id: "tan", name: "Tan", hex: "#DEB887" },
  { id: "brown", name: "Brown", hex: "#D2691E" },
  { id: "gray", name: "Gray", hex: "#696969" },
];

export const DIETARY_OPTIONS = [
  { id: "eggless", name: "Eggless", description: "No eggs or egg products", icon: "🥚" },
  { id: "vegan", name: "Vegan", description: "No animal products", icon: "🌱" },
];

export const DIETARY_NOTE = "All cakes are nut-free but may contain dairy and gluten";

// Helper function to enhance decoration options with pricing
export const getDecorationOptionsWithPricing = (pricingStructure: any): (DecorationOption & { price: number })[] => {
  if (!pricingStructure?.decorationPrices) {
    return DECORATION_OPTIONS.map(option => ({ ...option, price: 0 }));
  }
  
  return DECORATION_OPTIONS.map(option => ({
    ...option,
    price: pricingStructure.decorationPrices[option.id] || 0
  }));
};
