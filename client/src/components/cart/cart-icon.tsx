import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCakeBuilder } from "@/lib/cake-builder-store";
import { CartSidebar } from "./cart-sidebar";

interface CartIconProps {
  className?: string;
}

export function CartIcon({ className }: CartIconProps) {
  const { getCartItemCount } = useCakeBuilder();
  const itemCount = getCartItemCount();

  return (
    <CartSidebar
      trigger={
        <Button
          variant="ghost"
          size="icon"
          className={`relative ${className}`}
        >
          <ShoppingCart className="h-5 w-5" />
          {itemCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {itemCount}
            </Badge>
          )}
        </Button>
      }
    />
  );
}