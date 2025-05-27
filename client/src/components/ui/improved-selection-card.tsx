import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { ReactNode } from "react";

interface SelectionItem {
  id: string;
  name: string;
  image?: string;
  icon?: string | ReactNode;
  price?: number;
  description?: string;
  premium?: boolean;
}

interface ImprovedSelectionCardProps {
  title: string;
  items: SelectionItem[];
  selectedItems: string | string[];
  onSelectionChange: (itemId: string) => void;
  multiple?: boolean;
  columns?: 1 | 2 | 3;
}

export default function ImprovedSelectionCard({
  title,
  items,
  selectedItems,
  onSelectionChange,
  multiple = false,
  columns = 2
}: ImprovedSelectionCardProps) {
  const isSelected = (itemId: string) => {
    return multiple 
      ? (selectedItems as string[]).includes(itemId)
      : selectedItems === itemId;
  };

  const gridClass = columns === 1 
    ? "grid grid-cols-1 gap-4" 
    : columns === 3 
    ? "grid grid-cols-3 gap-4" 
    : "grid grid-cols-2 gap-4";

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="font-semibold mb-6 text-xl">{title}</h3>
        
        <div className={gridClass}>
          {items.map((item) => {
            const selected = isSelected(item.id);
            const isPremium = item.premium || item.name.includes("Premium") || item.name.includes("⭐");
            
            return (
              <Button
                key={item.id}
                variant={selected ? "default" : "outline"}
                className={`h-auto p-4 flex-col relative transition-all duration-200 ${
                  selected && isPremium ? "border-pink-400 bg-pink-500 hover:bg-pink-600" : ""
                } ${selected ? "ring-2 ring-offset-2 ring-blue-500" : ""}`}
                onClick={() => onSelectionChange(item.id)}
              >
                {item.image ? (
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-full h-16 object-cover rounded-lg mb-3"
                  />
                ) : item.icon ? (
                  <div className="mb-3">
                    {typeof item.icon === 'string' ? (
                      <span className="text-3xl">{item.icon}</span>
                    ) : (
                      item.icon
                    )}
                  </div>
                ) : null}
                
                <div className="text-center space-y-2">
                  <span className="text-sm font-medium leading-tight block">
                    {item.name.replace(" ⭐ Premium", "").replace(" (Premium)", "")}
                  </span>
                  
                  <div className="flex flex-col gap-1">
                    {isPremium && (
                      <span className="inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        ⭐ Premium
                      </span>
                    )}
                    {item.price && (
                      <span className="inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        +RM {(item.price / 100).toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
                
                {selected && (
                  <div className="absolute top-2 right-2">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                )}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
} 