import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save, AlertCircle, Phone, Mail, MapPin, Clock, Share2, FileText, Sparkles, MessageSquare } from 'lucide-react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { queryClient } from '@/lib/queryClient';
import AdminLayout from '@/components/admin/admin-layout';

interface ContactContent {
  title: string;
  subtitle: string;
  description: string;
  phone: string;
  email: string;
  whatsapp?: string;
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

export default function AdminContactContent() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading: authLoading, sessionToken } = useAdminAuth();
  const [content, setContent] = useState<ContactContent>({
    title: '',
    subtitle: '',
    description: '',
    phone: '',
    email: '',
    whatsapp: '',
    address: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      zip: ''
    },
    hours: {
      weekdays: '',
      saturday: '',
      sunday: ''
    },
    socialMedia: {
      facebook: '',
      instagram: '',
      twitter: ''
    }
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation('/admin/login');
    }
  }, [isAuthenticated, authLoading, setLocation]);

  // Fetch current content
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'page-content', 'contact'],
    queryFn: async () => {
      const response = await fetch('/api/admin/page-content/contact', {
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'X-Admin-Session': sessionToken || ''
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch page content');
      }

      return response.json();
    },
    enabled: !!sessionToken
  });

  // Update local state when data is fetched
  useEffect(() => {
    if (data?.content) {
      setContent({
        title: data.content.title || '',
        subtitle: data.content.subtitle || '',
        description: data.content.description || '',
        phone: data.content.phone || '',
        email: data.content.email || '',
        whatsapp: data.content.whatsapp || '',
        address: data.content.address || {
          line1: '',
          line2: '',
          city: '',
          state: '',
          zip: ''
        },
        hours: data.content.hours || {
          weekdays: '',
          saturday: '',
          sunday: ''
        },
        socialMedia: data.content.socialMedia || {
          facebook: '',
          instagram: '',
          twitter: ''
        }
      });
    }
  }, [data]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (updatedContent: ContactContent) => {
      const response = await fetch('/api/admin/page-content/contact', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
          'X-Admin-Session': sessionToken || ''
        },
        body: JSON.stringify({ content: updatedContent })
      });

      if (!response.ok) {
        throw new Error('Failed to update page content');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['page-content', 'contact'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'page-content', 'contact'] });
    }
  });

  const handleSave = () => {
    updateMutation.mutate(content);
  };

  if (authLoading || isLoading) {
    return (
      <AdminLayout title="Contact Page Content" description="Update the content displayed on the Contact page">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading contact content...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Contact Page Content" description="Update the content displayed on the Contact page">

      {updateMutation.isSuccess && (
        <Alert className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <Sparkles className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Contact page content has been updated successfully!
          </AlertDescription>
        </Alert>
      )}

      {(error || updateMutation.isError) && (
        <Alert className="mb-6" variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error?.message || updateMutation.error?.message || 'An error occurred'}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <div className="bg-blue-200 p-2 rounded-lg">
                <FileText className="w-5 h-5 text-blue-700" />
              </div>
              Page Header
            </CardTitle>
          </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Page Title</Label>
                <Input
                  id="title"
                  value={content.title}
                  onChange={(e) => setContent({ ...content, title: e.target.value })}
                  placeholder="Contact Us"
                />
              </div>

              <div>
                <Label htmlFor="subtitle">Subtitle</Label>
                <Input
                  id="subtitle"
                  value={content.subtitle}
                  onChange={(e) => setContent({ ...content, subtitle: e.target.value })}
                  placeholder="We'd love to hear from you!"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={content.description}
                  onChange={(e) => setContent({ ...content, description: e.target.value })}
                  placeholder="A brief description about contacting your bakery..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-emerald-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-900">
              <div className="bg-emerald-200 p-2 rounded-lg">
                <Phone className="w-5 h-5 text-emerald-700" />
              </div>
              Contact Information
            </CardTitle>
          </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={content.phone}
                  onChange={(e) => setContent({ ...content, phone: e.target.value })}
                  placeholder="(555) 123-4567"
                />
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={content.email}
                  onChange={(e) => setContent({ ...content, email: e.target.value })}
                  placeholder="info@yourbakery.com"
                />
              </div>

              <div>
                <Label htmlFor="whatsapp">WhatsApp Number (optional)</Label>
                <Input
                  id="whatsapp"
                  type="tel"
                  value={content.whatsapp || ''}
                  onChange={(e) => setContent({ ...content, whatsapp: e.target.value })}
                  placeholder="+60123456789"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Include country code (e.g., +60 for Malaysia, +1 for US)
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-emerald-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-900">
              <div className="bg-emerald-200 p-2 rounded-lg">
                <MessageSquare className="w-5 h-5 text-emerald-700" />
              </div>
              WhatsApp Integration
            </CardTitle>
          </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white p-4 rounded-lg border border-emerald-100">
                <h4 className="font-medium text-emerald-900 mb-2">How WhatsApp Integration Works</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• When customers click "WhatsApp Us", it opens WhatsApp with a pre-written message</li>
                  <li>• The default message: "Hi! I'm interested in ordering a custom cake. Can you help me?"</li>
                  <li>• WhatsApp number should include country code (e.g., +60123456789)</li>
                  <li>• Leave the WhatsApp field empty to hide the WhatsApp button</li>
                </ul>
              </div>
            </CardContent>
          </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-900">
              <div className="bg-purple-200 p-2 rounded-lg">
                <MapPin className="w-5 h-5 text-purple-700" />
              </div>
              Address
            </CardTitle>
          </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="address1">Address Line 1</Label>
                <Input
                  id="address1"
                  value={content.address.line1}
                  onChange={(e) => setContent({ 
                    ...content, 
                    address: { ...content.address, line1: e.target.value }
                  })}
                  placeholder="123 Main Street"
                />
              </div>

              <div>
                <Label htmlFor="address2">Address Line 2 (optional)</Label>
                <Input
                  id="address2"
                  value={content.address.line2 || ''}
                  onChange={(e) => setContent({ 
                    ...content, 
                    address: { ...content.address, line2: e.target.value }
                  })}
                  placeholder="Suite 100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={content.address.city}
                    onChange={(e) => setContent({ 
                      ...content, 
                      address: { ...content.address, city: e.target.value }
                    })}
                    placeholder="New York"
                  />
                </div>

                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={content.address.state}
                    onChange={(e) => setContent({ 
                      ...content, 
                      address: { ...content.address, state: e.target.value }
                    })}
                    placeholder="NY"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="zip">ZIP Code</Label>
                <Input
                  id="zip"
                  value={content.address.zip}
                  onChange={(e) => setContent({ 
                    ...content, 
                    address: { ...content.address, zip: e.target.value }
                  })}
                  placeholder="10001"
                />
              </div>
            </CardContent>
          </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-900">
              <div className="bg-orange-200 p-2 rounded-lg">
                <Clock className="w-5 h-5 text-orange-700" />
              </div>
              Business Hours
            </CardTitle>
          </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="weekdays">Weekdays (Mon-Fri)</Label>
                <Input
                  id="weekdays"
                  value={content.hours.weekdays}
                  onChange={(e) => setContent({ 
                    ...content, 
                    hours: { ...content.hours, weekdays: e.target.value }
                  })}
                  placeholder="9:00 AM - 6:00 PM"
                />
              </div>

              <div>
                <Label htmlFor="saturday">Saturday</Label>
                <Input
                  id="saturday"
                  value={content.hours.saturday}
                  onChange={(e) => setContent({ 
                    ...content, 
                    hours: { ...content.hours, saturday: e.target.value }
                  })}
                  placeholder="10:00 AM - 4:00 PM"
                />
              </div>

              <div>
                <Label htmlFor="sunday">Sunday</Label>
                <Input
                  id="sunday"
                  value={content.hours.sunday}
                  onChange={(e) => setContent({ 
                    ...content, 
                    hours: { ...content.hours, sunday: e.target.value }
                  })}
                  placeholder="Closed"
                />
              </div>
            </CardContent>
          </Card>

        <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-900">
              <div className="bg-indigo-200 p-2 rounded-lg">
                <Share2 className="w-5 h-5 text-indigo-700" />
              </div>
              Social Media Links (optional)
            </CardTitle>
          </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="facebook">Facebook URL</Label>
                <Input
                  id="facebook"
                  value={content.socialMedia.facebook || ''}
                  onChange={(e) => setContent({ 
                    ...content, 
                    socialMedia: { ...content.socialMedia, facebook: e.target.value }
                  })}
                  placeholder="https://facebook.com/yourbakery"
                />
              </div>

              <div>
                <Label htmlFor="instagram">Instagram URL</Label>
                <Input
                  id="instagram"
                  value={content.socialMedia.instagram || ''}
                  onChange={(e) => setContent({ 
                    ...content, 
                    socialMedia: { ...content.socialMedia, instagram: e.target.value }
                  })}
                  placeholder="https://instagram.com/yourbakery"
                />
              </div>

              <div>
                <Label htmlFor="twitter">Twitter URL</Label>
                <Input
                  id="twitter"
                  value={content.socialMedia.twitter || ''}
                  onChange={(e) => setContent({ 
                    ...content, 
                    socialMedia: { ...content.socialMedia, twitter: e.target.value }
                  })}
                  placeholder="https://twitter.com/yourbakery"
                />
              </div>
            </CardContent>
          </Card>

        <div className="flex justify-end gap-4">
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg"
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {data?.updatedAt && (
        <p className="text-sm text-gray-500 mt-6 text-center">
          Last updated: {new Date(data.updatedAt).toLocaleString()} by {data.updatedBy || 'Unknown'}
        </p>
      )}
    </AdminLayout>
  );
}