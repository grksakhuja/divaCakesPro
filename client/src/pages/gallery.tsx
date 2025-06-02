import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Instagram, Loader2 } from "lucide-react";

interface GalleryImage {
  id: number;
  instagramUrl: string;
  embedHtml: string;
  thumbnailUrl: string;
  caption: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

const CATEGORY_LABELS = {
  general: 'General',
  wedding: 'Wedding',
  birthday: 'Birthday',
  specialty: 'Specialty',
  custom: 'Custom',
  seasonal: 'Seasonal'
};

export default function Gallery() {
  // Just fetch all gallery images - no filtering to avoid re-render issues
  const { data: images = [], isLoading, error } = useQuery({
    queryKey: ['gallery'],
    queryFn: async () => {
      const response = await fetch('/api/gallery');
      
      if (!response.ok) {
        throw new Error('Failed to fetch gallery images');
      }
      
      return response.json();
    }
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Load Instagram embed script when images are loaded - simplified approach
  useEffect(() => {
    if (images.length === 0) return;

    // Remove any existing Instagram script to force fresh load
    const existingScript = document.querySelector('script[src*="instagram.com/embed.js"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Create fresh Instagram script exactly like in test HTML
    const script = document.createElement('script');
    script.src = 'https://www.instagram.com/embed.js';
    script.async = true;
    
    // Add to document head
    document.head.appendChild(script);

    // Clean up on unmount
    return () => {
      const scriptToRemove = document.querySelector('script[src*="instagram.com/embed.js"]');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [images]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Cake Gallery
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Explore our curated Instagram gallery showcasing our most stunning custom cake creations. From elegant wedding cakes to playful birthday designs, let these masterpieces inspire your next sweet celebration!
            </p>

          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-gray-400" />
              <p className="mt-4 text-gray-600">Loading gallery...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <Card className="p-12 bg-white/80 backdrop-blur text-center">
              <div className="text-red-500 mb-4">⚠️</div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                Unable to Load Gallery
              </h2>
              <p className="text-gray-600 mb-4">
                We're having trouble loading our gallery right now. Please try again later.
              </p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </Card>
          )}

          {/* Empty State */}
          {!isLoading && !error && images.length === 0 && (
            <Card className="p-12 bg-white/80 backdrop-blur text-center">
              <div className="text-6xl mb-4">🎂</div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                Gallery Coming Soon
              </h2>
              <p className="text-gray-600 mb-4 max-w-md mx-auto">
                We're building our gallery showcase. In the meantime, start designing your perfect cake!
              </p>
              <Link to="/order">
                <Button size="lg">
                  Design Your Cake
                </Button>
              </Link>
            </Card>
          )}

          {/* Clean Instagram Gallery */}
          {!isLoading && !error && images.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 mb-12">
                {images.map((image: GalleryImage) => (
                  <div key={image.id} className="overflow-hidden">
                    {/* Just the Instagram post - no frame */}
                    <div 
                      className="instagram-post-mobile"
                      style={{
                        transform: 'scale(0.9)',
                        transformOrigin: 'top center'
                      }}
                      dangerouslySetInnerHTML={{ __html: image.embedHtml }} 
                    />
                  </div>
                ))}
              </div>

              {/* Call to Action */}
              <div className="text-center">
                <Card className="p-8 bg-white/80 backdrop-blur">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                    Inspired by What You See?
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Create your own custom cake with our interactive designer!
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Link to="/order">
                      <Button size="lg">
                        Design Your Cake
                      </Button>
                    </Link>
                    <Link to="/cakes">
                      <Button variant="outline" size="lg">
                        Browse Specialties
                      </Button>
                    </Link>
                  </div>
                </Card>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}