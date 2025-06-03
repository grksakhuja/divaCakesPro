import React from 'react';
import { Palette, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/lib/theme-context';
import { getAllThemes, ThemeId } from '@/lib/theme-system';

interface ThemeSwitcherProps {
  variant?: 'default' | 'compact' | 'icon-only';
  align?: 'start' | 'center' | 'end';
}

export function ThemeSwitcher({ 
  variant = 'default', 
  align = 'end' 
}: ThemeSwitcherProps) {
  const { currentTheme, themeId, setTheme } = useTheme();
  const allThemes = getAllThemes();

  const handleThemeChange = (newThemeId: ThemeId) => {
    setTheme(newThemeId);
  };

  // Render different variants
  const renderTrigger = () => {
    switch (variant) {
      case 'icon-only':
        return (
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Palette className="h-4 w-4" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        );
      
      case 'compact':
        return (
          <Button variant="outline" size="sm" className="gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">{currentTheme.name}</span>
          </Button>
        );
      
      default:
        return (
          <Button variant="outline" className="gap-2">
            <Palette className="h-4 w-4" />
            Theme: {currentTheme.name}
          </Button>
        );
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {renderTrigger()}
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align={align} className="w-56">
        <DropdownMenuLabel>Choose Theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {allThemes.map((theme) => (
          <DropdownMenuItem
            key={theme.id}
            onClick={() => handleThemeChange(theme.id)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-3">
              {/* Theme color preview */}
              <div 
                className="w-4 h-4 rounded-full border border-gray-300"
                style={{ 
                  background: `hsl(${theme.colors.primary})` 
                }}
              />
              
              <div>
                <div className="font-medium">{theme.name}</div>
                <div className="text-xs text-muted-foreground">
                  {theme.description}
                </div>
              </div>
            </div>
            
            {themeId === theme.id && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        
        <div className="px-2 py-1.5 text-xs text-muted-foreground">
          Theme persists across sessions
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Theme preview component for settings pages
interface ThemePreviewProps {
  themeId: ThemeId;
  isSelected: boolean;
  onSelect: (themeId: ThemeId) => void;
}

export function ThemePreview({ themeId, isSelected, onSelect }: ThemePreviewProps) {
  const theme = getAllThemes().find(t => t.id === themeId);
  
  if (!theme) return null;

  return (
    <div
      className={`
        relative cursor-pointer rounded-lg border-2 p-4 transition-all hover:shadow-lg
        ${isSelected 
          ? 'border-primary bg-primary/5' 
          : 'border-gray-200 hover:border-gray-300'
        }
      `}
      onClick={() => onSelect(themeId)}
    >
      {/* Theme preview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{theme.name}</h3>
          {isSelected && <Check className="h-5 w-5 text-primary" />}
        </div>
        
        <p className="text-sm text-muted-foreground">
          {theme.description}
        </p>
        
        {/* Color palette preview */}
        <div className="flex gap-2">
          <div 
            className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
            style={{ background: `hsl(${theme.colors.primary})` }}
            title="Primary color"
          />
          <div 
            className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
            style={{ background: `hsl(${theme.colors.secondary})` }}
            title="Secondary color"
          />
          <div 
            className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
            style={{ background: `hsl(${theme.colors.accent})` }}
            title="Accent color"
          />
        </div>
        
        {/* Gradient preview */}
        <div 
          className="h-12 rounded-md"
          style={{
            background: `linear-gradient(135deg, 
              hsl(${theme.colors.gradientFrom}) 0%, 
              hsl(${theme.colors.gradientVia || theme.colors.gradientFrom}) 50%, 
              hsl(${theme.colors.gradientTo}) 100%
            )`
          }}
        />
      </div>
    </div>
  );
}

// Compact theme selector for admin settings
export function CompactThemeSelector() {
  const { themeId, setTheme } = useTheme();
  const allThemes = getAllThemes();

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Color Theme</label>
      <div className="grid grid-cols-2 gap-3">
        {allThemes.map((theme) => (
          <ThemePreview
            key={theme.id}
            themeId={theme.id}
            isSelected={themeId === theme.id}
            onSelect={setTheme}
          />
        ))}
      </div>
    </div>
  );
}