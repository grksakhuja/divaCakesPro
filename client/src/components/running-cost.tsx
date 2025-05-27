import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCakeBuilder } from "@/lib/cake-builder-store";
import { apiRequest } from "@/lib/queryClient";

// Accept pricingStructure as a prop
export default function RunningCost({ pricingStructure }: { pricingStructure?: any }) {
  const { cakeConfig, currentStep } = useCakeBuilder();

  // Only show pricing from step 2 onwards
  const { data: pricing, isLoading } = useQuery({
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
        template: cakeConfig.template,
        sixInchCakes: cakeConfig.sixInchCakes,
        eightInchCakes: cakeConfig.eightInchCakes,
      });
      return response.json();
    },
    enabled: currentStep >= 2,
  });

  if (currentStep === 1 || !pricing) {
    return null;
  }

  const formatPrice = (price: number) => `RM ${(price / 100).toFixed(2)}`;

  // Example: Use pricingStructure to show static info (e.g., base prices)
  // You can expand this as needed for your UI
  // if (pricingStructure) {
  //   // Example: Show base prices somewhere
  //   // pricingStructure.basePrices["6inch"]
  // }

  return (
    <Card className="fixed bottom-4 left-4 right-4 shadow-lg border-primary/20 bg-white/95 backdrop-blur-sm z-30 max-w-lg mx-auto max-h-32 overflow-hidden">
      <CardContent className="p-3 overflow-y-auto">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-neutral-900">
              Current Total
            </h3>
            <div className="text-xs text-neutral-500">
              {pricing.cakeQuantity} cake{pricing.cakeQuantity > 1 ? 's' : ''} • 
              {cakeConfig.sixInchCakes > 0 && ` ${cakeConfig.sixInchCakes}×6" (5-7 servings)`}
              {cakeConfig.eightInchCakes > 0 && ` ${cakeConfig.eightInchCakes}×8" (10-13 servings)`}
            </div>
          </div>
          
          <div className="text-right">
            {isLoading ? (
              <div className="text-2xl font-bold text-primary animate-pulse">
                Calculating...
              </div>
            ) : (
              <div className="text-2xl font-bold text-primary">
                {formatPrice(pricing.totalPrice)}
              </div>
            )}
          </div>
        </div>

        {pricing && !isLoading && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <div className="space-y-0.5 text-xs max-h-20 overflow-y-auto">
              <div className="flex justify-between">
                <span className="text-neutral-600 truncate">
                  Base: {cakeConfig.sixInchCakes > 0 && `${cakeConfig.sixInchCakes}×6" `}
                  {cakeConfig.eightInchCakes > 0 && `${cakeConfig.eightInchCakes}×8" `}
                  cake{(cakeConfig.sixInchCakes + cakeConfig.eightInchCakes) > 1 ? 's' : ''}
                </span>
                <span className="font-medium">{formatPrice(pricing.basePrice)}</span>
              </div>
              
              {pricing.layerPrice > 0 && (
                <div className="flex justify-between">
                  <span className="text-neutral-600 truncate">+{cakeConfig.layers - 1} layer{cakeConfig.layers > 2 ? 's' : ''}</span>
                  <span className="font-medium">{formatPrice(pricing.layerPrice)}</span>
                </div>
              )}
              
              {pricing.flavorPrice > 0 && (
                <div className="flex justify-between">
                  <span className="text-neutral-600 truncate">Premium flavors</span>
                  <span className="font-medium">{formatPrice(pricing.flavorPrice)}</span>
                </div>
              )}
              
              {pricing.shapePrice > 0 && (
                <div className="flex justify-between">
                  <span className="text-neutral-600 truncate">{cakeConfig.shape === 'heart' ? 'Heart' : cakeConfig.shape} shape</span>
                  <span className="font-medium">{formatPrice(pricing.shapePrice)}</span>
                </div>
              )}
              
              {pricing.icingPrice > 0 && (
                <div className="flex justify-between">
                  <span className="text-neutral-600 truncate">{cakeConfig.icingType} icing</span>
                  <span className="font-medium">{formatPrice(pricing.icingPrice)}</span>
                </div>
              )}
              
              {pricing.decorationTotal > 0 && (
                <div className="flex justify-between">
                  <span className="text-neutral-600 truncate">{cakeConfig.decorations.length} decoration{cakeConfig.decorations.length > 1 ? 's' : ''}</span>
                  <span className="font-medium">{formatPrice(pricing.decorationTotal)}</span>
                </div>
              )}
              
              {pricing.dietaryUpcharge > 0 && (
                <div className="flex justify-between">
                  <span className="text-neutral-600 truncate">Dietary options</span>
                  <span className="font-medium">{formatPrice(pricing.dietaryUpcharge)}</span>
                </div>
              )}
              
              {pricing.photoPrice > 0 && (
                <div className="flex justify-between">
                  <span className="text-neutral-600 truncate">Photo print</span>
                  <span className="font-medium">{formatPrice(pricing.photoPrice)}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}