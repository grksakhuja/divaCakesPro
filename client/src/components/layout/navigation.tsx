import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, ShoppingCart, Cake } from "lucide-react";
import { cn } from "@/lib/utils";
import { CartIcon } from "@/components/cart/cart-icon";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/order", label: "Order Now" },
  { href: "/cakes", label: "Our Cakes" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navigation() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <nav className="container mx-auto flex h-16 items-center px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 mr-6">
          <div className="w-10 h-10 bg-pink-400 rounded-full flex items-center justify-center">
            <Cake className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-800">Sugar Art Diva</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center flex-1">
          <div className="flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-pink-500",
                  location === item.href
                    ? "text-pink-500"
                    : "text-muted-foreground"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
          
          <div className="ml-auto flex items-center space-x-3">
            <CartIcon />
            <Link href="/order">
              <Button className="bg-pink-500 hover:bg-pink-600">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Order Now
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden ml-auto items-center space-x-2">
          <CartIcon />
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <div className="flex flex-col space-y-4 mt-8">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "text-lg font-medium transition-colors hover:text-pink-500 py-2",
                      location === item.href
                        ? "text-pink-500"
                        : "text-muted-foreground"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
                <Link href="/order" onClick={() => setIsOpen(false)}>
                  <Button className="w-full bg-pink-500 hover:bg-pink-600 mt-4">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Order Now
                  </Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}