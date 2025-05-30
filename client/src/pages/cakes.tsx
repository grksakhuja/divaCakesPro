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
import { formatSectionName } from "@/lib/format-utils";
import { Plus } from "lucide-react";

export default function Cakes() {
  const { addToCart } = useCakeBuilder();
  const { toast } = useToast();
  
  // Fetch dynamic cakes
  const { data: dynamicCakes, isLoading: isLoadingCakes } = useQuery({
    queryKey: ["/api/cakes"],
    queryFn: async () => {
      const response = await apiRequest("/api/cakes", "GET");
      return response.json();
    },
  });

  const handleAddToCart = (item: any) => {
    let itemType: 'specialty' | 'slice' | 'candy' = 'specialty';
    
    // Determine type based on item category
    if (item.category === 'Coconut Candy' || item.id.includes('candy')) {
      itemType = 'candy';
    } else if (item.category === 'Cake Slices' || item.id.includes('slice')) {
      itemType = 'slice';
    } else {
      itemType = 'specialty';
    }
    
    const cartItem = createSpecialtyCartItem(
      item.id,
      item.name,
      item.price, // Already in cents from API
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

        {/* Dynamic Cake Sections */}
        {dynamicCakes && Object.keys(dynamicCakes).map((subsectionKey) => {
          const subsection = dynamicCakes[subsectionKey];
          
          return (
            <section key={subsectionKey} className="mb-16">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">{subsection.sectionName}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subsection.items.map((item) => (
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
                          {isLoadingCakes ? (
                            <Skeleton className="h-8 w-20" />
                          ) : (
                            `RM ${(item.price / 100).toFixed(2)}`
                          )}
                        </span>
                        <Button 
                          size="sm" 
                          onClick={() => handleAddToCart(item)}
                          disabled={isLoadingCakes}
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
          );
        })}
      </div>
    </div>
  );
}