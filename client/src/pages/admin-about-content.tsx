import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save, AlertCircle, Plus, Minus, FileText, Sparkles } from 'lucide-react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { queryClient } from '@/lib/queryClient';
import AdminLayout from '@/components/admin/admin-layout';

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

export default function AdminAboutContent() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading: authLoading, sessionToken } = useAdminAuth();
  const [content, setContent] = useState<AboutContent>({
    title: '',
    subtitle: '',
    story: '',
    mission: '',
    experience: '',
    specialties: [],
    whyChooseUs: [],
    imageUrl: ''
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation('/admin/login');
    }
  }, [isAuthenticated, authLoading, setLocation]);

  // Fetch current content
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'page-content', 'about'],
    queryFn: async () => {
      const response = await fetch('/api/admin/page-content/about', {
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
        story: data.content.story || '',
        mission: data.content.mission || '',
        experience: data.content.experience || '',
        specialties: data.content.specialties || [],
        whyChooseUs: data.content.whyChooseUs || [],
        imageUrl: data.content.imageUrl || ''
      });
    }
  }, [data]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (updatedContent: AboutContent) => {
      const response = await fetch('/api/admin/page-content/about', {
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
      queryClient.invalidateQueries({ queryKey: ['page-content', 'about'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'page-content', 'about'] });
    }
  });

  const handleSave = () => {
    updateMutation.mutate(content);
  };

  const handleSpecialtyChange = (index: number, value: string) => {
    const newSpecialties = [...content.specialties];
    newSpecialties[index] = value;
    setContent({ ...content, specialties: newSpecialties });
  };

  const addSpecialty = () => {
    setContent({ ...content, specialties: [...content.specialties, ''] });
  };

  const removeSpecialty = (index: number) => {
    const newSpecialties = content.specialties.filter((_, i) => i !== index);
    setContent({ ...content, specialties: newSpecialties });
  };

  const handleWhyChooseUsChange = (index: number, value: string) => {
    const newReasons = [...content.whyChooseUs];
    newReasons[index] = value;
    setContent({ ...content, whyChooseUs: newReasons });
  };

  const addReason = () => {
    setContent({ ...content, whyChooseUs: [...content.whyChooseUs, ''] });
  };

  const removeReason = (index: number) => {
    const newReasons = content.whyChooseUs.filter((_, i) => i !== index);
    setContent({ ...content, whyChooseUs: newReasons });
  };

  if (authLoading || isLoading) {
    return (
      <AdminLayout title="About Page Content" description="Update the content displayed on the About page">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading page content...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="About Page Content" description="Update the content displayed on the About page">

      {updateMutation.isSuccess && (
        <Alert className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <Sparkles className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            About page content has been updated successfully!
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

      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <div className="bg-blue-200 p-2 rounded-lg">
              <FileText className="w-5 h-5 text-blue-700" />
            </div>
            Page Content
          </CardTitle>
        </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="title">Page Title</Label>
              <Input
                id="title"
                value={content.title}
                onChange={(e) => setContent({ ...content, title: e.target.value })}
                placeholder="About Us"
              />
            </div>

            <div>
              <Label htmlFor="subtitle">Subtitle</Label>
              <Input
                id="subtitle"
                value={content.subtitle}
                onChange={(e) => setContent({ ...content, subtitle: e.target.value })}
                placeholder="Crafting Sweet Memories Since 2020"
              />
            </div>

            <div>
              <Label htmlFor="story">Our Story</Label>
              <Textarea
                id="story"
                value={content.story}
                onChange={(e) => setContent({ ...content, story: e.target.value })}
                placeholder="Tell your bakery's story..."
                rows={6}
              />
            </div>

            <div>
              <Label htmlFor="mission">Our Mission</Label>
              <Textarea
                id="mission"
                value={content.mission}
                onChange={(e) => setContent({ ...content, mission: e.target.value })}
                placeholder="What drives your business..."
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="experience">Experience</Label>
              <Textarea
                id="experience"
                value={content.experience}
                onChange={(e) => setContent({ ...content, experience: e.target.value })}
                placeholder="Years of experience, achievements..."
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="imageUrl">Hero Image URL (optional)</Label>
              <Input
                id="imageUrl"
                value={content.imageUrl}
                onChange={(e) => setContent({ ...content, imageUrl: e.target.value })}
                placeholder="https://example.com/bakery-image.jpg"
              />
            </div>

            <div>
              <Label>Our Specialties</Label>
              <div className="space-y-2 mt-2">
                {content.specialties.map((specialty, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={specialty}
                      onChange={(e) => handleSpecialtyChange(index, e.target.value)}
                      placeholder="e.g., Wedding Cakes"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeSpecialty(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addSpecialty}
                  className="bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border-green-200"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Specialty
                </Button>
              </div>
            </div>

            <div>
              <Label>Why Choose Us</Label>
              <div className="space-y-2 mt-2">
                {content.whyChooseUs.map((reason, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={reason}
                      onChange={(e) => handleWhyChooseUsChange(index, e.target.value)}
                      placeholder="e.g., 100% Fresh Ingredients"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeReason(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addReason}
                  className="bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border-green-200"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Reason
                </Button>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-6">
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
          </CardContent>
      </Card>

      {data?.updatedAt && (
        <p className="text-sm text-gray-500 mt-6 text-center">
          Last updated: {new Date(data.updatedAt).toLocaleString()} by {data.updatedBy || 'Unknown'}
        </p>
      )}
    </AdminLayout>
  );
}