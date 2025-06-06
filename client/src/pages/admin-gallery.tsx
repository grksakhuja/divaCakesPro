import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Trash2, Edit3, Plus, Instagram, Eye, EyeOff, ArrowLeft, Sparkles, Image, Upload } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLocation } from "wouter";
import AdminLayout from "@/components/admin/admin-layout";

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
  uploadedBy: string;
  fetchedAt: string;
  createdAt: string;
  updatedAt: string;
}

interface AddImageForm {
  instagramUrl: string;
  title: string;
  description: string;
  category: string;
}

const DEFAULT_CATEGORIES = [
  { value: 'general', label: 'General' },
  { value: 'wedding', label: 'Wedding' },
  { value: 'birthday', label: 'Birthday' },
  { value: 'specialty', label: 'Specialty' },
  { value: 'custom', label: 'Custom' },
  { value: 'seasonal', label: 'Seasonal' }
];

export default function AdminGallery() {
  const { isAuthenticated, isLoading, sessionToken } = useAdminAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [addForm, setAddForm] = useState<AddImageForm>({
    instagramUrl: '',
    title: '',
    description: '',
    category: 'general'
  });
  
  // Category management
  const [newCategory, setNewCategory] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);

  // Fetch gallery images
  const { data: images = [], isLoading: imagesLoading, error } = useQuery({
    queryKey: ['admin-gallery'],
    queryFn: async () => {
      const response = await fetch('/api/admin/gallery', {
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'X-Admin-Session': sessionToken
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch gallery images');
      }
      
      return response.json();
    },
    enabled: isAuthenticated && !!sessionToken
  });

  // Generate categories from existing images + defaults
  const existingCategories = Array.from(new Set(images.map(img => img.category)));
  const allCategoryValues = Array.from(new Set([
    ...DEFAULT_CATEGORIES.map(cat => cat.value),
    ...existingCategories
  ]));
  
  const categories = allCategoryValues.map(value => {
    const defaultCat = DEFAULT_CATEGORIES.find(cat => cat.value === value);
    return defaultCat || { 
      value, 
      label: value.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    };
  });

  // Add image mutation
  const addImageMutation = useMutation({
    mutationFn: async (formData: AddImageForm) => {
      const response = await fetch('/api/admin/gallery/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
          'X-Admin-Session': sessionToken
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add image');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-gallery'] });
      setShowAddDialog(false);
      setAddForm({ instagramUrl: '', title: '', description: '', category: 'general' });
      toast({ title: "Success", description: "Instagram post added to gallery" });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Error", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  // Update image mutation
  const updateImageMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number, updates: Partial<GalleryImage> }) => {
      const response = await fetch(`/api/admin/gallery/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
          'X-Admin-Session': sessionToken
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update image');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-gallery'] });
      setEditingImage(null);
      toast({ title: "Success", description: "Gallery image updated" });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Error", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  // Delete image mutation
  const deleteImageMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/gallery/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'X-Admin-Session': sessionToken
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete image');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-gallery'] });
      toast({ title: "Success", description: "Gallery image deleted" });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Error", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!addForm.instagramUrl || !addForm.title) {
      toast({ 
        title: "Error", 
        description: "Instagram URL and title are required",
        variant: "destructive" 
      });
      return;
    }

    // Validate Instagram URL
    if (!addForm.instagramUrl.includes('instagram.com/p/') && !addForm.instagramUrl.includes('instagram.com/reel/')) {
      toast({ 
        title: "Error", 
        description: "Please enter a valid Instagram post or reel URL",
        variant: "destructive" 
      });
      return;
    }

    addImageMutation.mutate(addForm);
  };

  const handleToggleActive = (image: GalleryImage) => {
    updateImageMutation.mutate({
      id: image.id,
      updates: { isActive: !image.isActive }
    });
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this gallery image? This action cannot be undone.')) {
      deleteImageMutation.mutate(id);
    }
  };

  const handleAddCategory = () => {
    if (!newCategory.trim()) {
      toast({ 
        title: "Error", 
        description: "Please enter a category name",
        variant: "destructive" 
      });
      return;
    }

    const categoryValue = newCategory.toLowerCase().replace(/\s+/g, '-');
    const categoryExists = categories.some(cat => cat.value === categoryValue);
    
    if (categoryExists) {
      toast({ 
        title: "Error", 
        description: "This category already exists",
        variant: "destructive" 
      });
      return;
    }

    // Set the new category in the form - it will be saved when the image is created
    setAddForm(prev => ({ ...prev, category: categoryValue }));
    setNewCategory('');
    setShowAddCategory(false);
    
    toast({ 
      title: "Success", 
      description: `Category "${newCategory}" ready to use. It will be saved when you add an image.`,
      variant: "default" 
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <AdminLayout title="Gallery Management" description="Manage Instagram posts displayed in your gallery">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading gallery images...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <AdminLayout title="Gallery Management" description="Manage Instagram posts displayed in your gallery">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Total Images</p>
                <p className="text-3xl font-bold text-purple-900 mt-1">{images.length}</p>
              </div>
              <div className="bg-purple-200 p-3 rounded-xl">
                <Image className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-emerald-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-600 text-sm font-medium">Active Images</p>
                <p className="text-3xl font-bold text-emerald-900 mt-1">
                  {images.filter(img => img.isActive).length}
                </p>
              </div>
              <div className="bg-emerald-200 p-3 rounded-xl">
                <Eye className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-600 text-sm font-medium">Categories</p>
                <p className="text-3xl font-bold text-indigo-900 mt-1">{categories.length}</p>
              </div>
              <div className="bg-indigo-200 p-3 rounded-xl">
                <Sparkles className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header Actions */}
      <div className="flex justify-end mb-6">
          
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Instagram Post
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add Instagram Post</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="instagramUrl">Instagram URL *</Label>
                  <Input
                    id="instagramUrl"
                    placeholder="https://www.instagram.com/p/..."
                    value={addForm.instagramUrl}
                    onChange={(e) => setAddForm(prev => ({ ...prev, instagramUrl: e.target.value }))}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Paste the URL of an Instagram post or reel
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="Beautiful Wedding Cake"
                    value={addForm.title}
                    onChange={(e) => setAddForm(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Optional description of this cake..."
                    value={addForm.description}
                    onChange={(e) => setAddForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="category">Category</Label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShowAddCategory(true)}
                      className="text-xs gap-1"
                    >
                      <Plus className="h-3 w-3" />
                      Add New
                    </Button>
                  </div>
                  
                  {showAddCategory && (
                    <div className="flex gap-2 mb-2">
                      <Input
                        placeholder="New category name"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="text-sm"
                      />
                      <Button 
                        type="button" 
                        size="sm" 
                        onClick={handleAddCategory}
                        className="px-3"
                      >
                        Add
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          setShowAddCategory(false);
                          setNewCategory('');
                        }}
                        className="px-3"
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                  
                  <Select value={addForm.category} onValueChange={(value) => setAddForm(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={addImageMutation.isPending} className="flex-1">
                    {addImageMutation.isPending ? 'Adding...' : 'Add Post'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Error State */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>
              Failed to load gallery images. Please try refreshing the page.
            </AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {imagesLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading gallery images...</p>
          </div>
        )}

        {/* Empty State */}
        {!imagesLoading && images.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Instagram className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Gallery Images Yet</h3>
              <p className="text-gray-600 mb-4">
                Start building your gallery by adding Instagram posts
              </p>
              <Button onClick={() => setShowAddDialog(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Your First Post
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Gallery Grid */}
        {!imagesLoading && images.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((image: GalleryImage) => (
              <Card key={image.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{image.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={image.isActive ? "default" : "secondary"}>
                          {image.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant="outline">{image.category}</Badge>
                      </div>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(image)}
                        disabled={updateImageMutation.isPending}
                      >
                        {image.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingImage(image)}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(image.id)}
                        disabled={deleteImageMutation.isPending}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  {image.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">{image.description}</p>
                  )}
                  
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>Added: {formatDate(image.createdAt)}</p>
                    <p>By: {image.uploadedBy}</p>
                  </div>
                  
                  <div className="pt-2">
                    <a 
                      href={image.instagramUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <Instagram className="h-3 w-3" />
                      View on Instagram
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        {editingImage && (
          <Dialog open={!!editingImage} onOpenChange={() => setEditingImage(null)}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Edit Gallery Image</DialogTitle>
              </DialogHeader>
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  updateImageMutation.mutate({
                    id: editingImage.id,
                    updates: {
                      title: formData.get('title') as string,
                      description: formData.get('description') as string,
                      category: formData.get('category') as string,
                    }
                  });
                }} 
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="edit-title">Title</Label>
                  <Input
                    id="edit-title"
                    name="title"
                    defaultValue={editingImage.title}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    name="description"
                    defaultValue={editingImage.description}
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-category">Category</Label>
                  <Select name="category" defaultValue={editingImage.category}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={updateImageMutation.isPending} className="flex-1">
                    {updateImageMutation.isPending ? 'Updating...' : 'Update'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setEditingImage(null)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
    </AdminLayout>
  );
}