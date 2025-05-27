import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { ReactNode } from "react";

interface GridItem {
  id: string;
  children: ReactNode;
  onClick: () => void;
  selected?: boolean;
  className?: string;
}

interface ImprovedButtonGridProps {
  items: GridItem[];
  columns?: 1 | 2;
  className?: string;
}

export default function ImprovedButtonGrid({ 
  items, 
  columns = 2, 
  className = "" 
}: ImprovedButtonGridProps) {
  const gridClass = columns === 1 ? "grid grid-cols-1 gap-4" : "grid grid-cols-2 gap-4";
  
  return (
    <div className={`${gridClass} ${className}`}>
      {items.map((item) => (
        <Button
          key={item.id}
          variant={item.selected ? "default" : "outline"}
          className={`h-auto py-4 px-4 flex-col space-y-2 relative transition-all duration-200 ${item.className || ""}`}
          onClick={item.onClick}
        >
          {item.children}
          {item.selected && (
            <div className="absolute top-2 right-2">
              <Check className="h-4 w-4" />
            </div>
          )}
        </Button>
      ))}
    </div>
  );
} 