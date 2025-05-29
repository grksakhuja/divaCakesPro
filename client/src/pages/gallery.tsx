import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";

export default function Gallery() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Our Cake Gallery
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Coming Soon! Browse through our collection of beautiful custom cakes.
          </p>
          
          <Card className="p-12 bg-white/80 backdrop-blur">
            <div className="text-center space-y-4">
              <div className="text-6xl mb-4">🎂</div>
              <h2 className="text-2xl font-semibold text-gray-800">
                Gallery Under Construction
              </h2>
              <p className="text-gray-600 max-w-md mx-auto">
                We're currently working on showcasing our amazing cake creations. 
                Check back soon to see our portfolio of custom cakes!
              </p>
              <div className="pt-4">
                <Link to="/">
                  <Button size="lg">
                    Design Your Cake
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}