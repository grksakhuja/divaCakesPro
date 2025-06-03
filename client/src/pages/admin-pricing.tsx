import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Save, RotateCcw, History, DollarSign, Cake, ShoppingBag, Sparkles, Palette, Clock } from "lucide-react";
import { formatCurrency } from "@/lib/format-utils";
import { queryClient } from "@/lib/queryClient";
import AdminLayout from "@/components/admin/admin-layout";

export default function AdminPricing() {
  const { isAuthenticated, isLoading, sessionToken } = useAdminAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [pricingData, setPricingData] = useState<any>(null);
  const [originalData, setOriginalData] = useState<any>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [backups, setBackups] = useState<any[]>([]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/admin/login");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  useEffect(() => {
    if (isAuthenticated && sessionToken) {
      fetchPricingData();
      fetchBackups();
    }
  }, [isAuthenticated, sessionToken]);

  const fetchPricingData = async () => {
    try {
      const response = await fetch("/api/admin/pricing", {
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
        },
      });
      
      if (!response.ok) throw new Error("Failed to fetch pricing data");
      
      const data = await response.json();
      setPricingData(data);
      setOriginalData(JSON.parse(JSON.stringify(data))); // Deep clone
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load pricing data",
        variant: "destructive",
      });
    }
  };

  const fetchBackups = async () => {
    try {
      const response = await fetch("/api/admin/pricing/backups", {
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setBackups(data);
      }
    } catch (error) {
      console.error("Failed to fetch backups:", error);
    }
  };

  const handlePriceChange = (path: string[], value: string) => {
    const numValue = parseFloat(value) || 0;
    const newData = { ...pricingData };
    
    // Navigate to the nested property and update it
    let current = newData;
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    current[path[path.length - 1]] = Math.round(numValue * 100); // Convert to cents
    
    setPricingData(newData);
    setHasChanges(JSON.stringify(newData) !== JSON.stringify(originalData));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/pricing", {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
        },
        body: JSON.stringify(pricingData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save pricing data");
      }
      
      toast({
        title: "Success",
        description: "Pricing structure updated successfully",
      });
      
      // Invalidate all pricing-related queries to ensure fresh data
      await queryClient.invalidateQueries({ queryKey: ["/api/pricing-structure"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/calculate-price"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/cakes"] });
      
      setOriginalData(JSON.parse(JSON.stringify(pricingData)));
      setHasChanges(false);
      fetchBackups(); // Refresh backup list
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save pricing data",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setPricingData(JSON.parse(JSON.stringify(originalData)));
    setHasChanges(false);
  };

  if (isLoading || !pricingData) {
    return (
      <AdminLayout title="Pricing Management" description="Update your cake prices">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading pricing data...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const renderPriceInput = (label: string, path: string[], helperText?: string) => (
    <div className="space-y-2">
      <Label htmlFor={path.join('-')} className="text-sm font-medium text-gray-700">{label}</Label>
      <div className="flex items-center space-x-2">
        <div className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm font-medium">RM</div>
        <Input
          id={path.join('-')}
          type="number"
          step="0.01"
          min="0"
          value={(path.reduce((obj, key) => obj[key], pricingData) / 100).toFixed(2)}
          onChange={(e) => handlePriceChange(path, e.target.value)}
          className="max-w-[150px] border-gray-300 focus:border-pink-400 focus:ring-pink-400"
        />
      </div>
      {helperText && <p className="text-sm text-gray-500 italic">{helperText}</p>}
    </div>
  );

  const renderSpecialtyItem = (key: string, item: any, category: string) => (
    <Card key={key} className="p-4 hover:shadow-lg transition-shadow bg-gradient-to-br from-white to-pink-50 border-pink-100">
      <div className="space-y-4">
        <h4 className="font-semibold text-lg text-gray-800">{item.name}</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Price</Label>
            <div className="flex items-center space-x-2">
              <div className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm font-medium">RM</div>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={(item.price / 100).toFixed(2)}
                onChange={(e) => {
                  const numValue = parseFloat(e.target.value) || 0;
                  const newData = { ...pricingData };
                  newData.cakes[category][key].price = Math.round(numValue * 100);
                  setPricingData(newData);
                  setHasChanges(JSON.stringify(newData) !== JSON.stringify(originalData));
                }}
                className="max-w-[150px] border-gray-300 focus:border-pink-400 focus:ring-pink-400"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Category</Label>
            <div className="bg-purple-100 text-purple-700 px-3 py-1 rounded text-sm font-medium inline-block">
              {item.category}
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Description</Label>
          <p className="text-sm text-gray-600 bg-white/50 p-2 rounded">{item.description}</p>
        </div>
      </div>
    </Card>
  );

  return (
    <AdminLayout title="Pricing Management" description="Update your cake prices and specialty items">
      <div className="mb-8">
        {hasChanges && (
          <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200 mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-600" />
                  <p className="text-sm font-medium text-yellow-800">You have unsaved changes</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                    disabled={isSaving}
                    className="border-yellow-300 hover:bg-yellow-100"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reset Changes
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        disabled={isSaving}
                        size="sm"
                        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                      >
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </Button>
                    </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Price Update</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to update the pricing structure? This will affect all future orders immediately.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleSave}>
                      Update Prices
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Tabs defaultValue="custom-cakes" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-pink-100 to-purple-100 p-1 rounded-lg">
          <TabsTrigger value="custom-cakes" className="data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2">
            <Cake className="w-4 h-4" />
            Custom Cakes
          </TabsTrigger>
          <TabsTrigger value="specialty-items" className="data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" />
            Specialty Items
          </TabsTrigger>
          <TabsTrigger value="extras" className="data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Extras & Add-ons
          </TabsTrigger>
          <TabsTrigger value="backups" className="data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2">
            <History className="w-4 h-4" />
            Backup History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="custom-cakes" className="space-y-6">
          <Card className="bg-gradient-to-br from-pink-50 to-purple-50 border-pink-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="bg-pink-200 p-1 rounded">
                  <DollarSign className="w-5 h-5 text-pink-700" />
                </div>
                Base Cake Prices
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-6">
              {renderPriceInput("6-inch Cake", ["basePrices", "6inch"], "Base price for 6-inch cakes")}
              {renderPriceInput("8-inch Cake", ["basePrices", "8inch"], "Base price for 8-inch cakes")}
              {renderPriceInput("Additional Layer", ["layerPrice"], "Price per additional layer")}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="bg-orange-200 p-1 rounded">
                  <Cake className="w-5 h-5 text-orange-700" />
                </div>
                Flavor Upcharges
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-6">
              {Object.entries(pricingData.flavorPrices).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">{key.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</Label>
                  <div className="flex items-center space-x-2">
                    <div className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm font-medium">RM</div>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={((value as number) / 100).toFixed(2)}
                      onChange={(e) => handlePriceChange(["flavorPrices", key], e.target.value)}
                      className="max-w-[150px] border-gray-300 focus:border-orange-400 focus:ring-orange-400"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shape Upcharges</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-6">
              {Object.entries(pricingData.shapePrices).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <Label>{key.charAt(0).toUpperCase() + key.slice(1)} Shape</Label>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">RM</span>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={((value as number) / 100).toFixed(2)}
                      onChange={(e) => handlePriceChange(["shapePrices", key], e.target.value)}
                      className="max-w-[150px]"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="specialty-items" className="space-y-6">
          {pricingData.cakes && Object.entries(pricingData.cakes).map(([category, items]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle>{category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4">
                {Object.entries(items as any).map(([key, item]) => 
                  renderSpecialtyItem(key, item, category)
                )}
              </CardContent>
            </Card>
          ))}

          {/* Legacy specialty items if they exist */}
          {pricingData.specialtyItems && (
            <Card>
              <CardHeader>
                <CardTitle>Legacy Specialty Items</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-6">
                {Object.entries(pricingData.specialtyItems).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <Label>{key.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</Label>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">RM</span>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={((value as number) / 100).toFixed(2)}
                        onChange={(e) => handlePriceChange(["specialtyItems", key], e.target.value)}
                        className="max-w-[150px]"
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="extras" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Icing Types</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-6">
              {Object.entries(pricingData.icingTypes).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <Label>{key.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</Label>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">RM</span>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={((value as number) / 100).toFixed(2)}
                      onChange={(e) => handlePriceChange(["icingTypes", key], e.target.value)}
                      className="max-w-[150px]"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Decorations</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-6">
              {Object.entries(pricingData.decorationPrices).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <Label>{key.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</Label>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">RM</span>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={((value as number) / 100).toFixed(2)}
                      onChange={(e) => handlePriceChange(["decorationPrices", key], e.target.value)}
                      className="max-w-[150px]"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dietary Options</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-6">
              {Object.entries(pricingData.dietaryPrices).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <Label>{key.charAt(0).toUpperCase() + key.slice(1)}</Label>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">RM</span>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={((value as number) / 100).toFixed(2)}
                      onChange={(e) => handlePriceChange(["dietaryPrices", key], e.target.value)}
                      className="max-w-[150px]"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {pricingData.templatePrices && (
            <Card>
              <CardHeader>
                <CardTitle>Template Prices</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-6">
                {Object.entries(pricingData.templatePrices).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <Label>{key.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</Label>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">RM</span>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={((value as number) / 100).toFixed(2)}
                        onChange={(e) => handlePriceChange(["templatePrices", key], e.target.value)}
                        className="max-w-[150px]"
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="backups" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Pricing Backup History
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {backups.length === 0 ? (
                <p className="text-muted-foreground">No backups found</p>
              ) : (
                <div className="space-y-2">
                  {backups.map((backup) => (
                    <div key={backup.filename} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{new Date(backup.timestamp).toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">Size: {(backup.size / 1024).toFixed(2)} KB</p>
                      </div>
                      <p className="text-sm text-muted-foreground">{backup.filename}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}