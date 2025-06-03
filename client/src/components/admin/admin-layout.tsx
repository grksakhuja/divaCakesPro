import React from 'react';
import { Link, useLocation } from 'wouter';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Button } from '@/components/ui/button';
import { ThemeSwitcher } from '@/components/ui/theme-switcher';
import { useThemeClasses } from '@/lib/theme-context';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Package,
  DollarSign,
  Instagram,
  FileText,
  Phone,
  LogOut,
  ChefHat,
  Sparkles,
  Menu,
  X
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  color: string;
}

const navItems: NavItem[] = [
  {
    href: '/admin/orders',
    label: 'Orders',
    icon: Package,
    color: 'text-pink-600'
  },
  {
    href: '/admin/pricing',
    label: 'Pricing',
    icon: DollarSign,
    color: 'text-green-600'
  },
  {
    href: '/admin/gallery',
    label: 'Gallery',
    icon: Instagram,
    color: 'text-purple-600'
  },
  {
    href: '/admin/about-content',
    label: 'About Page',
    icon: FileText,
    color: 'text-blue-600'
  },
  {
    href: '/admin/contact-content',
    label: 'Contact Page',
    icon: Phone,
    color: 'text-orange-600'
  }
];

export default function AdminLayout({ children, title, description }: AdminLayoutProps) {
  const [location, setLocation] = useLocation();
  const { logout, isAuthenticated } = useAdminAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const themeClasses = useThemeClasses();

  const handleLogout = () => {
    logout();
    setLocation('/admin/login');
  };

  // Get admin name from localStorage or use default
  const getAdminName = () => {
    const sessionData = localStorage.getItem('admin_auth_session');
    if (sessionData) {
      try {
        const { username } = JSON.parse(sessionData);
        return username || 'Admin';
      } catch {
        return 'Admin';
      }
    }
    return 'Admin';
  };

  return (
    <div className={cn("min-h-screen", themeClasses.cardGradient)}>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 z-40 h-screen w-64 bg-white shadow-xl transform transition-transform duration-300",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-xl", themeClasses.primaryGradient)}>
              <ChefHat className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className={cn("font-bold text-lg bg-gradient-to-r bg-clip-text text-transparent", 
                "from-[hsl(var(--theme-gradient-from))] to-[hsl(var(--theme-gradient-to))]")}>
                Sugar Art Diva
              </h2>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-pink-100">
          <div className="flex items-center gap-2 text-sm">
            <Sparkles className="w-4 h-4 text-pink-500" />
            <span className="text-gray-600">Welcome back,</span>
            <span className="font-semibold text-gray-800">{getAdminName()}</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <Link key={item.href} href={item.href}>
                <a
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                    isActive
                      ? cn("shadow-sm", themeClasses.cardGradient)
                      : "hover:bg-gray-50"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className={cn("w-5 h-5", item.color)} />
                  <span className={cn(
                    "font-medium",
                    isActive ? "text-gray-900" : "text-gray-600"
                  )}>
                    {item.label}
                  </span>
                  {isActive && (
                    <div className={cn("ml-auto w-1.5 h-1.5 rounded-full", themeClasses.primaryBg)} />
                  )}
                </a>
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start gap-3 text-gray-600 hover:text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Header */}
        <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-30">
          <div className="px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  {title}
                </h1>
                {description && (
                  <p className="text-gray-600 mt-1">{description}</p>
                )}
              </div>
              
              {/* Quick Stats or Actions could go here */}
              <div className="hidden lg:flex items-center gap-3">
                <ThemeSwitcher variant="compact" />
                <div className={cn("px-4 py-2 rounded-lg text-sm font-medium", themeClasses.cardGradient, themeClasses.primaryText)}>
                  <Sparkles className="w-4 h-4 inline mr-1" />
                  Admin Mode
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-auto p-6 lg:p-8 text-center text-sm text-gray-500">
          <p>© 2024 Sugar Art Diva. Made with 🎂 and ❤️</p>
        </footer>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}