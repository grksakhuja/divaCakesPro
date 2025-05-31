import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
            About CakeCraft Pro
          </h1>
          
          <div className="space-y-6">
            <Card className="p-8 bg-white/80 backdrop-blur">
              <h2 className="text-2xl font-semibold mb-4">Our Story</h2>
              <p className="text-gray-600 leading-relaxed">
                Welcome to CakeCraft Pro! We're passionate about creating custom cakes 
                that make your special moments even more memorable. Our team of skilled 
                bakers and decorators work tirelessly to bring your cake dreams to life.
              </p>
            </Card>
            
            <Card className="p-8 bg-white/80 backdrop-blur">
              <h2 className="text-2xl font-semibold mb-4">What We Do</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We specialize in custom cake design and creation for all occasions:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Birthday Cakes</li>
                <li>Wedding Cakes</li>
                <li>Anniversary Cakes</li>
                <li>Corporate Events</li>
                <li>Special Occasions</li>
              </ul>
            </Card>
            
            <Card className="p-8 bg-white/80 backdrop-blur">
              <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
              <p className="text-gray-600 leading-relaxed">
                Have questions or special requests? We'd love to hear from you!
              </p>
              <div className="mt-6 text-center">
                <Link to="/">
                  <Button size="lg">
                    Start Your Order
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