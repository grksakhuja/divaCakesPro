import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { useCakeBuilder } from "@/lib/cake-builder-store";
import { createSpecialtyCartItem } from "@/types/cart";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

const specialtyItems = [
  {
    id: "cheesecake-whole",
    name: "Classic Cheesecake",
    description: "Rich and creamy New York style cheesecake",
    price: 85.00,
    category: "Whole Cakes",
    image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400&h=300&fit=crop"
  },
  {
    id: "pavlova",
    name: "Classic Pavlova",
    description: "Light meringue dessert topped with fresh cream and fruits",
    price: 21.00,
    category: "Desserts",
    image: "https://images.unsplash.com/photo-1464219551459-ac14ae01fbe0?w=400&h=300&fit=crop"
  },
  {
    id: "matcha-pavlova",
    name: "Matcha Pavlova",
    description: "Japanese-inspired pavlova with matcha flavor",
    price: 21.00,
    category: "Desserts",
    image: "https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=400&h=300&fit=crop"
  }
];

const slicedCakes = [
  {
    id: "orange-poppyseed",
    name: "Orange Poppy Seed",
    description: "A slice of our lightened up orange poppy seed pound cake. Glazed with orange syrup",
    price: 7.00,
    image: "https://images.unsplash.com/photo-1536599524557-5f784dd53282?w=400&h=300&fit=crop"
  },
  {
    id: "butter-cake",
    name: "Mum's Old School Butter",
    description: "A slice of our butter cake made from finest ingredients. Best served with coffee or tea",
    price: 7.00,
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop"
  },
  {
    id: "chocolate-fudge",
    name: "Chocolate Fudge Cake",
    description: "A slice of our chocolate cake topped with homemade rich ganache",
    price: 7.00,
    image: "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=400&h=300&fit=crop"
  }
];

const coconutCandy = [
  {
    id: "coconut-candy-og",
    name: "The OG Coconut",
    description: "The original coconut candy (16 pcs, 3cm x 3cm)",
    price: 42.00,
    image: "https://images.unsplash.com/photo-1548848221-0c2e497ed557?w=400&h=300&fit=crop"
  },
  {
    id: "coconut-candy-pandan",
    name: "Pandan Gula Melaka",
    description: "Pandan Gula Melaka coconut candy (16pcs, 3cm x 3cm)",
    price: 42.00,
    image: "https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=400&h=300&fit=crop"
  },
  {
    id: "coconut-candy-raspberry",
    name: "Love O' not Raspberry",
    description: "Raspberry flavored coconut candy (16pcs)",
    price: 42.00,
    image: "https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=400&h=300&fit=crop"
  }
];

export default function Cakes() {
  const { addToCart } = useCakeBuilder();
  const { toast } = useToast();
  
  // Fetch pricing structure
  const { data: pricingStructure, isLoading } = useQuery({
    queryKey: ["/api/pricing-structure"],
    queryFn: async () => {
      const response = await apiRequest("/api/pricing-structure", "GET");
      return response.json();
    },
  });

  const handleAddToCart = (item: typeof specialtyItems[0] | typeof slicedCakes[0] | typeof coconutCandy[0]) => {
    if (!pricingStructure) return;
    
    let price = 0;
    let itemType: 'specialty' | 'slice' | 'candy' = 'specialty';
    
    // Determine price and type based on item ID
    if (pricingStructure.specialtyItems?.[item.id]) {
      price = pricingStructure.specialtyItems[item.id];
      itemType = item.id.includes('candy') ? 'candy' : 'specialty';
    } else if (pricingStructure.slicedCakes?.[item.id]) {
      price = pricingStructure.slicedCakes[item.id];
      itemType = 'slice';
    } else {
      // Fallback to hardcoded price if not in API
      price = item.price * 100; // convert to cents
    }
    
    const cartItem = createSpecialtyCartItem(
      item.id,
      item.name,
      price,
      item.description,
      item.image
    );
    
    // Override type for specific items
    cartItem.type = itemType;
    
    addToCart(cartItem);
    
    toast({
      title: "Added to Cart",
      description: `${item.name} has been added to your cart.`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="container mx-auto py-12 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Our Specialty Cakes & Treats
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our selection of ready-made cakes, desserts, and sweet treats. 
            For custom cakes, please use our cake builder.
          </p>
          <Link to="/order" className="inline-block mt-4">
            <Button size="lg" variant="outline">
              Design Custom Cake →
            </Button>
          </Link>
        </div>

        {/* Specialty Items */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Specialty Cakes & Desserts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {specialtyItems.map((item) => (
              <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gray-200 relative">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  <Badge className="absolute top-2 right-2">{item.category}</Badge>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
                  <p className="text-gray-600 mb-4 text-sm">{item.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-primary">
                      {isLoading ? (
                        <Skeleton className="h-8 w-20" />
                      ) : (
                        `RM ${((pricingStructure?.specialtyItems?.[item.id] || item.price * 100) / 100).toFixed(2)}`
                      )}
                    </span>
                    <Button 
                      size="sm" 
                      onClick={() => handleAddToCart(item)}
                      disabled={isLoading}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Sliced Cakes */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Cake Slices</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {slicedCakes.map((cake) => (
              <Card key={cake.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gray-200">
                  <img 
                    src={cake.image} 
                    alt={cake.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{cake.name}</h3>
                  <p className="text-gray-600 mb-4 text-sm">{cake.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-primary">
                      {isLoading ? (
                        <Skeleton className="h-8 w-20" />
                      ) : (
                        `RM ${((pricingStructure?.slicedCakes?.[cake.id] || cake.price * 100) / 100).toFixed(2)}`
                      )}
                    </span>
                    <Button 
                      size="sm" 
                      onClick={() => handleAddToCart(cake)}
                      disabled={isLoading}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Coconut Candy */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Coconut Candy</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coconutCandy.map((candy) => (
              <Card key={candy.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gray-200">
                  <img 
                    src={candy.image} 
                    alt={candy.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{candy.name}</h3>
                  <p className="text-gray-600 mb-4 text-sm">{candy.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-primary">
                      {isLoading ? (
                        <Skeleton className="h-8 w-20" />
                      ) : (
                        `RM ${((pricingStructure?.specialtyItems?.[candy.id] || candy.price * 100) / 100).toFixed(2)}`
                      )}
                    </span>
                    <Button 
                      size="sm" 
                      onClick={() => handleAddToCart(candy)}
                      disabled={isLoading}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}