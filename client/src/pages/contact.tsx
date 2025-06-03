import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MapPin, Phone, Mail, Clock, MessageCircle, Send, Facebook, Instagram as InstagramIcon, Twitter, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ContactContent {
  title: string;
  subtitle: string;
  description: string;
  phone: string;
  email: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zip: string;
  };
  hours: {
    weekdays: string;
    saturday: string;
    sunday: string;
  };
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
}

export default function Contact() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch page content
  const { data, isLoading, error } = useQuery({
    queryKey: ['page-content', 'contact'],
    queryFn: async () => {
      const response = await fetch('/api/page-content/contact');
      
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

  const content: ContactContent = data?.content || {
    title: "Contact Us",
    subtitle: "We'd love to hear from you!",
    description: "Have questions about our cakes or need help with your order? We're here to help!",
    phone: "+60 3-1234 5678",
    email: "info@cakecraftpro.com",
    address: {
      line1: "123 Sweet Street",
      city: "Kuala Lumpur",
      state: "Malaysia",
      zip: "50450"
    },
    hours: {
      weekdays: "9:00 AM - 7:00 PM",
      saturday: "9:00 AM - 6:00 PM",
      sunday: "10:00 AM - 5:00 PM"
    },
    socialMedia: {}
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Message Sent! 📧",
          description: result.message || "Thank you for contacting us. We'll get back to you within 24 hours.",
        });

        // Reset form
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: ""
        });
      } else {
        throw new Error(result.message || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending contact message:", error);
      toast({
        title: "Error Sending Message",
        description: error instanceof Error ? error.message : "Failed to send message. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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

  // Format address for display
  const formatAddress = () => {
    const parts = [
      content.address.line1,
      content.address.line2,
      `${content.address.city}, ${content.address.state} ${content.address.zip}`
    ].filter(Boolean);
    return parts;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{content.title}</h1>
            {content.subtitle && (
              <p className="text-xl text-gray-600 mb-2">{content.subtitle}</p>
            )}
            {content.description && (
              <p className="text-gray-600 max-w-2xl mx-auto">{content.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Get in Touch
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-start gap-4">
                    <MapPin className="h-5 w-5 text-pink-600 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Visit Our Bakery</h3>
                      <div className="text-gray-600">
                        {formatAddress().map((line, index) => (
                          <p key={index}>{line}</p>
                        ))}
                      </div>
                    </div>
                  </div>

                  {content.phone && (
                    <div className="flex items-start gap-4">
                      <Phone className="h-5 w-5 text-pink-600 mt-1" />
                      <div>
                        <h3 className="font-semibold text-gray-900">Call Us</h3>
                        <p className="text-gray-600">{content.phone}</p>
                      </div>
                    </div>
                  )}

                  {content.email && (
                    <div className="flex items-start gap-4">
                      <Mail className="h-5 w-5 text-pink-600 mt-1" />
                      <div>
                        <h3 className="font-semibold text-gray-900">Email Us</h3>
                        <p className="text-gray-600">{content.email}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-4">
                    <Clock className="h-5 w-5 text-pink-600 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Business Hours</h3>
                      <div className="text-gray-600">
                        {content.hours.weekdays && (
                          <p>Monday - Friday: {content.hours.weekdays}</p>
                        )}
                        {content.hours.saturday && (
                          <p>Saturday: {content.hours.saturday}</p>
                        )}
                        {content.hours.sunday && (
                          <p>Sunday: {content.hours.sunday}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Social Media */}
              {(content.socialMedia.facebook || content.socialMedia.instagram || content.socialMedia.twitter) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Follow Us</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-4">
                      {content.socialMedia.facebook && (
                        <Button variant="outline" size="icon" asChild>
                          <a href={content.socialMedia.facebook} target="_blank" rel="noopener noreferrer">
                            <Facebook className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      {content.socialMedia.instagram && (
                        <Button variant="outline" size="icon" asChild>
                          <a href={content.socialMedia.instagram} target="_blank" rel="noopener noreferrer">
                            <InstagramIcon className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      {content.socialMedia.twitter && (
                        <Button variant="outline" size="icon" asChild>
                          <a href={content.socialMedia.twitter} target="_blank" rel="noopener noreferrer">
                            <Twitter className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* FAQ Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">How far in advance should I order?</h3>
                    <p className="text-gray-600 text-sm">
                      We recommend ordering at least 3-5 days in advance for custom cakes. 
                      For specialty items, 2-3 days notice is usually sufficient.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Do you offer delivery?</h3>
                    <p className="text-gray-600 text-sm">
                      Yes! We offer delivery within the local area. 
                      Delivery fees are calculated based on distance.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Can I customize any cake?</h3>
                    <p className="text-gray-600 text-sm">
                      Absolutely! Use our cake builder to customize flavors, decorations, 
                      messages, and more. We love bringing your vision to life.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="h-5 w-5" />
                    Send us a Message
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          placeholder="Your full name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder={content.phone || "+1 234-567-8900"}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="your.email@example.com"
                      />
                    </div>

                    <div>
                      <Label htmlFor="subject">Subject *</Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        placeholder="What's this about?"
                      />
                    </div>

                    <div>
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        placeholder="Tell us more about your inquiry..."
                        rows={6}
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full" 
                      size="lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>Sending...</>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="mt-6">
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    {content.phone && (
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <a href={`tel:${content.phone.replace(/\s/g, '')}`}>
                          <Phone className="h-4 w-4 mr-2" />
                          Call Us Now
                        </a>
                      </Button>
                    )}
                    {content.email && (
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <a href={`mailto:${content.email}`}>
                          <Mail className="h-4 w-4 mr-2" />
                          Email Us
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}