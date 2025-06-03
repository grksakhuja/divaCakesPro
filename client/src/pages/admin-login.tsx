import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useLocation } from "wouter";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useToast } from "@/hooks/use-toast";
import { ChefHat, Lock, User, Sparkles, Eye, EyeOff } from "lucide-react";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, login, loginLoading, loginError } = useAdminAuth();

  // Redirect to orders if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/admin/orders");
    }
  }, [isAuthenticated, setLocation]);

  // Show error toast when login fails
  useEffect(() => {
    if (loginError) {
      toast({
        title: "Login failed",
        description: "Invalid username or password",
        variant: "destructive",
      });
    }
  }, [loginError, toast]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
      login({ username, password });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center p-4">
      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 text-pink-200">
        <Sparkles className="w-8 h-8 animate-pulse" />
      </div>
      <div className="absolute bottom-10 right-10 text-purple-200">
        <Sparkles className="w-12 h-12 animate-pulse" />
      </div>
      <div className="absolute top-1/4 right-1/4 text-blue-200">
        <ChefHat className="w-6 h-6 animate-bounce" />
      </div>
      
      <Card className="w-full max-w-md shadow-2xl bg-white/95 backdrop-blur border-pink-100">
        <CardHeader className="text-center pb-8 bg-gradient-to-r from-pink-50 to-purple-50 rounded-t-lg">
          <div className="mx-auto mb-4">
            <div className="bg-gradient-to-br from-pink-400 to-purple-500 p-4 rounded-2xl inline-block shadow-lg">
              <ChefHat className="w-12 h-12 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Sugar Art Diva
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Welcome back! Please login to your admin account
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-gray-700 font-medium flex items-center gap-2">
                <User className="w-4 h-4 text-pink-500" />
                Username
              </Label>
              <div className="relative">
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                  className="pl-10 border-pink-200 focus:border-pink-400 focus:ring-pink-400"
                />
                <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium flex items-center gap-2">
                <Lock className="w-4 h-4 text-purple-500" />
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="pl-10 pr-10 border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                />
                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold py-6 rounded-lg shadow-lg transform transition-all duration-200 hover:scale-[1.02]"
              disabled={loginLoading}
            >
              {loginLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Signing in...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Sign In to Admin Panel
                </>
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Protected area • Authorized personnel only
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}