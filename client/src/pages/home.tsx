import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Palette, Leaf, Truck, Heart, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useThemeClasses } from "@/lib/theme-context";
import { apiRequest } from "@/lib/queryClient";
import { formatPrice } from "@/lib/format-utils";
import { cn } from "@/lib/utils";

export default function Home() {
  const themeClasses = useThemeClasses();
  
  // Fetch pricing for featured cakes
  const { data: birthdayPrice } = useQuery({
    queryKey: ["/api/calculate-price", "birthday"],
    queryFn: async () => {
      const response = await apiRequest("/api/calculate-price", "POST", {
        layers: 1,
        shape: "round",
        flavors: ["butter"],
        icingType: "butter",
        decorations: [],
        dietaryRestrictions: [],
        sixInchCakes: 1,
        eightInchCakes: 0,
      });
      return response.json();
    },
  });

  const { data: weddingPrice } = useQuery({
    queryKey: ["/api/calculate-price", "wedding"],
    queryFn: async () => {
      const response = await apiRequest("/api/calculate-price", "POST", {
        layers: 1,
        shape: "round",
        flavors: ["butter"],
        icingType: "fondant",
        decorations: ["flowers"],
        dietaryRestrictions: [],
        sixInchCakes: 1,
        eightInchCakes: 2,
      });
      return response.json();
    },
  });

  return (
    <>
      {/* Hero Section */}
      <section className={cn("relative py-20 md:py-32", themeClasses.cardGradient)}>
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Custom Cakes
                <br />
                <span className="text-pink-500">Made with Love</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                From birthdays to weddings, we craft the perfect cake for your special moments
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/order">
                  <Button size="lg" className={themeClasses.primaryButton}>
                    Order Your Cake
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/gallery">
                  <Button size="lg" variant="outline">
                    View Gallery
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1557925923-cd4648e211a0?w=600&h=600&fit=crop"
                alt="Beautiful custom cake"
                className="rounded-lg shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-lg shadow-lg">
                <p className="text-sm font-semibold text-gray-600">⭐ 5.0 Rating</p>
                <p className="text-xs text-gray-500">500+ Happy Customers</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Why Choose Sugar Art Diva?
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Palette className="h-10 w-10 text-pink-500" />
              </div>
              <h3 className="font-semibold text-xl mb-2">Custom Designs</h3>
              <p className="text-gray-600">
                Every cake is uniquely designed to match your vision
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="h-10 w-10 text-orange-500" />
              </div>
              <h3 className="font-semibold text-xl mb-2">Fresh Ingredients</h3>
              <p className="text-gray-600">
                Premium quality ingredients for the best taste
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="h-10 w-10 text-green-500" />
              </div>
              <h3 className="font-semibold text-xl mb-2">Fast Delivery</h3>
              <p className="text-gray-600">
                On-time delivery for your special occasions
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-10 w-10 text-purple-500" />
              </div>
              <h3 className="font-semibold text-xl mb-2">Made with Love</h3>
              <p className="text-gray-600">
                Every cake is crafted with care and passion
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Cakes */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Featured Cakes
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="overflow-hidden hover:shadow-xl transition-shadow">
              <img
                src="https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=400&h=300&fit=crop"
                alt="Birthday cake"
                className="w-full h-48 object-cover"
              />
              <CardContent className="p-6">
                <h3 className="font-semibold text-xl mb-2">Birthday Celebration</h3>
                <p className="text-gray-600 mb-4">
                  Perfect for making birthdays extra special
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-pink-500">
                    {birthdayPrice ? `From ${formatPrice(birthdayPrice.totalPrice)}` : "Loading..."}
                  </span>
                  <Link href="/order">
                    <Button size="sm" className="bg-pink-500 hover:bg-pink-600">
                      Order Now
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden hover:shadow-xl transition-shadow">
              <img
                src="https://images.unsplash.com/photo-1558301211-0d8c8ddee6ec?w=400&h=300&fit=crop"
                alt="Wedding cake"
                className="w-full h-48 object-cover"
              />
              <CardContent className="p-6">
                <h3 className="font-semibold text-xl mb-2">Wedding Elegance</h3>
                <p className="text-gray-600 mb-4">
                  Stunning multi-tier cakes for your big day
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-pink-500">
                    {weddingPrice ? `From ${formatPrice(weddingPrice.totalPrice)}` : "Loading..."}
                  </span>
                  <Link href="/order">
                    <Button size="sm" className="bg-pink-500 hover:bg-pink-600">
                      Order Now
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden hover:shadow-xl transition-shadow">
              <img
                src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop"
                alt="Custom cake"
                className="w-full h-48 object-cover"
              />
              <CardContent className="p-6">
                <h3 className="font-semibold text-xl mb-2">Custom Creation</h3>
                <p className="text-gray-600 mb-4">
                  Your imagination, our expertise
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-pink-500">Get Quote</span>
                  <Link href="/order">
                    <Button size="sm" className="bg-pink-500 hover:bg-pink-600">
                      Design Now
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-pink-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-4xl font-bold text-pink-500">1</span>
              </div>
              <h3 className="font-semibold text-xl mb-2">Choose Your Base</h3>
              <p className="text-gray-600">Select size, flavor, and shape</p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-4xl font-bold text-pink-500">2</span>
              </div>
              <h3 className="font-semibold text-xl mb-2">Customize Design</h3>
              <p className="text-gray-600">
                Add decorations, colors, and personal touches
              </p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-4xl font-bold text-pink-500">3</span>
              </div>
              <h3 className="font-semibold text-xl mb-2">Enjoy Your Cake</h3>
              <p className="text-gray-600">We deliver fresh to your celebration</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            What Our Customers Say
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "Birthday Party",
                review:
                  "The cake was absolutely perfect! Everyone at the party loved it. Will definitely order again!",
              },
              {
                name: "Emily Chen",
                role: "Wedding",
                review:
                  "Amazing attention to detail! They created exactly what I envisioned for my wedding.",
              },
              {
                name: "Mike Davis",
                role: "Anniversary",
                review:
                  "Best cake I've ever had! Fresh, delicious, and beautifully decorated. Highly recommend!",
              },
            ].map((testimonial, index) => (
              <Card key={index} className="p-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">"{testimonial.review}"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-300 rounded-full mr-4" />
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-pink-500 to-orange-400 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Order Your Dream Cake?
          </h2>
          <p className="text-xl mb-8">
            Use our easy cake builder to create your perfect custom cake
          </p>
          <Link href="/order">
            <Button
              size="lg"
              className="bg-white text-pink-500 hover:bg-gray-100"
            >
              Start Building Your Cake
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}