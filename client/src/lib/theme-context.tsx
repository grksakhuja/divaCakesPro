import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ThemeId, ColorTheme, getTheme, defaultTheme, getCSSVariables, isValidThemeId } from './theme-system';

interface ThemeContextType {
  currentTheme: ColorTheme;
  themeId: ThemeId;
  setTheme: (themeId: ThemeId) => void;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'cakecraft-theme';

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [themeId, setThemeId] = useState<ThemeId>(defaultTheme);
  const [isLoading, setIsLoading] = useState(true);

  // Load theme from localStorage on mount
  useEffect(() => {
    const loadTheme = () => {
      try {
        const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme && isValidThemeId(savedTheme)) {
          setThemeId(savedTheme);
        }
      } catch (error) {
        console.warn('Failed to load theme from localStorage:', error);
        // Fallback to default theme
        setThemeId(defaultTheme);
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();
  }, []);

  // Apply CSS variables whenever theme changes
  useEffect(() => {
    if (isLoading) return;

    const theme = getTheme(themeId);
    const cssVariables = getCSSVariables(theme);
    
    // Apply CSS variables to the document root
    const root = document.documentElement;
    Object.entries(cssVariables).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });

    // Add theme class to body for additional styling if needed
    document.body.classList.remove('theme-pink', 'theme-blue');
    document.body.classList.add(`theme-${themeId}`);

    // Also set a data attribute for CSS selectors
    document.documentElement.setAttribute('data-theme', themeId);

  }, [themeId, isLoading]);

  const setTheme = (newThemeId: ThemeId) => {
    setThemeId(newThemeId);
    
    // Persist to localStorage
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newThemeId);
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error);
    }
  };

  const currentTheme = getTheme(themeId);

  const value: ThemeContextType = {
    currentTheme,
    themeId,
    setTheme,
    isLoading,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook to use theme context
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Utility hook for getting theme-aware CSS classes
export function useThemeClasses() {
  const { themeId } = useTheme();
  
  return {
    // Primary gradient backgrounds
    primaryGradient: `bg-gradient-to-r from-[hsl(var(--theme-gradient-from))] via-[hsl(var(--theme-gradient-via))] to-[hsl(var(--theme-gradient-to))]`,
    
    // Card gradients
    cardGradient: `bg-gradient-to-br from-[hsl(var(--theme-card-from))] to-[hsl(var(--theme-card-to))]`,
    
    // Button styles
    primaryButton: `bg-[hsl(var(--theme-button-primary))] hover:bg-[hsl(var(--theme-button-primary))]/90 text-white`,
    secondaryButton: `bg-[hsl(var(--theme-button-secondary))] hover:bg-[hsl(var(--theme-button-secondary))]/90 text-white`,
    
    // Link styles
    linkStyle: `text-[hsl(var(--theme-link))] hover:text-[hsl(var(--theme-link))]/80`,
    
    // Theme-specific classes
    themeClass: `theme-${themeId}`,
    
    // Border and accent colors
    primaryBorder: `border-[hsl(var(--primary))]`,
    primaryText: `text-[hsl(var(--primary))]`,
    primaryBg: `bg-[hsl(var(--primary))]`,
  };
}

// Utility component for theme-aware styling
interface ThemeAwareProps {
  children: (classes: ReturnType<typeof useThemeClasses>) => ReactNode;
}

export function ThemeAware({ children }: ThemeAwareProps) {
  const classes = useThemeClasses();
  return <>{children(classes)}</>;
}