import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";

interface AboutContent {
  title: string;
  subtitle: string;
  story: string;
  mission: string;
  experience: string;
  specialties: string[];
  whyChooseUs: string[];
  imageUrl?: string;
}

export default function About() {
  // Fetch page content
  const { data, isLoading, error } = useQuery({
    queryKey: ['page-content', 'about'],
    queryFn: async () => {
      const response = await fetch('/api/page-content/about');
      
      if (!response.ok) {
        if (response.status === 404) {
          // Return default content if not found
          return null;
        }
        throw new Error('Failed to fetch page content');
      }
      
      return response.json();
    }
  });

  const content: AboutContent = data?.content || {
    title: "About CakeCraft Pro",
    subtitle: "Crafting Sweet Memories Since 2020",
    story: "Welcome to CakeCraft Pro! We're passionate about creating custom cakes that make your special moments even more memorable. Our team of skilled bakers and decorators work tirelessly to bring your cake dreams to life.",
    mission: "Our mission is to deliver exceptional custom cakes that not only taste amazing but also serve as the centerpiece of your celebrations. We believe every cake should tell a story and create lasting memories.",
    experience: "With over 10 years of combined experience in the baking industry, our team has created thousands of custom cakes for happy customers across the region.",
    specialties: [
      "Wedding Cakes",
      "Birthday Cakes",
      "Anniversary Cakes",
      "Corporate Events",
      "Special Occasions"
    ],
    whyChooseUs: [
      "100% Fresh, High-Quality Ingredients",
      "Custom Designs Tailored to Your Vision",
      "Professional Decorators with Artistic Expertise",
      "On-Time Delivery Guaranteed",
      "Competitive Pricing with No Hidden Fees"
    ]
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Unable to Load Content</h2>
            <p className="text-gray-600">Please try again later.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      {content.imageUrl && (
        <div className="w-full h-64 md:h-96 overflow-hidden">
          <img 
            src={content.imageUrl} 
            alt="About CakeCraft Pro"
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 text-center">
            {content.title}
          </h1>
          
          {content.subtitle && (
            <p className="text-xl text-gray-600 mb-8 text-center">
              {content.subtitle}
            </p>
          )}
          
          <div className="space-y-6">
            {content.story && (
              <Card className="p-8 bg-white/80 backdrop-blur">
                <h2 className="text-2xl font-semibold mb-4">Our Story</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {content.story}
                </p>
              </Card>
            )}
            
            {content.mission && (
              <Card className="p-8 bg-white/80 backdrop-blur">
                <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {content.mission}
                </p>
              </Card>
            )}
            
            {content.experience && (
              <Card className="p-8 bg-white/80 backdrop-blur">
                <h2 className="text-2xl font-semibold mb-4">Our Experience</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {content.experience}
                </p>
              </Card>
            )}
            
            {content.specialties && content.specialties.length > 0 && (
              <Card className="p-8 bg-white/80 backdrop-blur">
                <h2 className="text-2xl font-semibold mb-4">Our Specialties</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {content.specialties.map((specialty, index) => (
                    <div key={index} className="flex items-center text-gray-600">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>{specialty}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
            
            {content.whyChooseUs && content.whyChooseUs.length > 0 && (
              <Card className="p-8 bg-white/80 backdrop-blur">
                <h2 className="text-2xl font-semibold mb-4">Why Choose Us</h2>
                <div className="space-y-3">
                  {content.whyChooseUs.map((reason, index) => (
                    <div key={index} className="flex items-start text-gray-600">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
            
            <Card className="p-8 bg-white/80 backdrop-blur">
              <h2 className="text-2xl font-semibold mb-4">Ready to Order?</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                Let us create the perfect custom cake for your special occasion!
              </p>
              <div className="flex gap-4 justify-center">
                <Link to="/order">
                  <Button size="lg">
                    Design Your Cake
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button size="lg" variant="outline">
                    Contact Us
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}