import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, ShoppingCart, Cake } from "lucide-react";
import { cn } from "@/lib/utils";
import { CartIcon } from "@/components/cart/cart-icon";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";
import { useThemeClasses } from "@/lib/theme-context";

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
  const themeClasses = useThemeClasses();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <nav className="container mx-auto flex h-16 items-center px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 mr-6">
          <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", themeClasses.primaryBg)}>
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
                  "text-sm font-medium transition-colors",
                  themeClasses.linkStyle,
                  location === item.href
                    ? themeClasses.primaryText
                    : "text-muted-foreground"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
          
          <div className="ml-auto flex items-center space-x-3">
            <ThemeSwitcher variant="compact" />
            <CartIcon />
            <Link href="/order">
              <Button className={themeClasses.primaryButton}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Order Now
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden ml-auto items-center space-x-2">
          <ThemeSwitcher variant="icon-only" />
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
                      "text-lg font-medium transition-colors py-2",
                      themeClasses.linkStyle,
                      location === item.href
                        ? themeClasses.primaryText
                        : "text-muted-foreground"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
                <Link href="/order" onClick={() => setIsOpen(false)}>
                  <Button className={cn("w-full mt-4", themeClasses.primaryButton)}>
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