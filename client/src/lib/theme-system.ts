// Theme System Configuration
// This file defines the color themes and provides utilities for theme management

export type ThemeId = 'pink' | 'blue';

// Future theme IDs can be added here:
// export type ThemeId = 'pink' | 'blue' | 'green' | 'purple' | 'orange';

export interface ColorTheme {
  id: ThemeId;
  name: string;
  description: string;
  colors: {
    // Core semantic colors
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    accent: string;
    accentForeground: string;
    
    // Gradient colors for backgrounds
    gradientFrom: string;
    gradientVia?: string;
    gradientTo: string;
    
    // Cake builder specific colors
    cakePrimary: string;
    cakeSecondary: string;
    cakeAccent: string;
    
    // UI element colors
    buttonPrimary: string;
    buttonSecondary: string;
    linkColor: string;
    
    // Component-specific colors
    cardGradientFrom: string;
    cardGradientTo: string;
    shadowColor: string;
  };
}

export const themes: Record<ThemeId, ColorTheme> = {
  pink: {
    id: 'pink',
    name: 'Sweet Pink',
    description: 'Warm and inviting pink theme',
    colors: {
      // Core semantic colors (HSL values)
      primary: '336 84% 69%', // #FF6B9D
      primaryForeground: '0 0% 100%',
      secondary: '36 100% 60%', // #FFA726
      secondaryForeground: '0 0% 0%',
      accent: '120 50% 70%', // #66BB6A
      accentForeground: '0 0% 0%',
      
      // Gradient colors
      gradientFrom: '336 84% 69%', // pink
      gradientVia: '276 75% 84%', // purple
      gradientTo: '197 71% 73%', // blue
      
      // Cake builder colors
      cakePrimary: '350 100% 88%', // #FFB6C1
      cakeSecondary: '276 75% 84%', // #DDA0DD
      cakeAccent: '197 71% 73%', // #87CEEB
      
      // UI elements
      buttonPrimary: '336 84% 69%',
      buttonSecondary: '36 100% 60%',
      linkColor: '336 84% 69%',
      
      // Component-specific
      cardGradientFrom: '350 100% 95%', // very light pink
      cardGradientTo: '276 75% 95%', // very light purple
      shadowColor: 'rgba(255, 107, 157, 0.2)',
    }
  },
  
  blue: {
    id: 'blue',
    name: 'Baby Blue',
    description: 'Soft and gentle baby blue theme',
    colors: {
      // Core semantic colors (HSL values) - Baby blues
      primary: '197 71% 73%', // #87CEEB (skyblue) - soft baby blue
      primaryForeground: '0 0% 100%',
      secondary: '200 100% 80%', // #87CEFA (lightskyblue) - lighter baby blue
      secondaryForeground: '220 26% 14%', // dark blue text
      accent: '180 100% 75%', // #7FFFD4 (aquamarine) - soft mint
      accentForeground: '220 26% 14%',
      
      // Gradient colors - soft baby blue palette
      gradientFrom: '197 71% 73%', // skyblue
      gradientVia: '200 100% 80%', // lightskyblue  
      gradientTo: '180 100% 85%', // light aquamarine
      
      // Cake builder colors - pastel blues
      cakePrimary: '197 71% 88%', // very light sky blue
      cakeSecondary: '200 100% 88%', // very light baby blue
      cakeAccent: '180 100% 88%', // very light aqua
      
      // UI elements
      buttonPrimary: '197 71% 73%',
      buttonSecondary: '200 100% 80%',
      linkColor: '197 71% 73%',
      
      // Component-specific
      cardGradientFrom: '197 71% 95%', // very light sky blue
      cardGradientTo: '200 100% 95%', // very light baby blue
      shadowColor: 'rgba(135, 206, 235, 0.2)', // skyblue shadow
    }
  }
};

export const defaultTheme: ThemeId = 'pink';

// Utility functions for theme management
export const getTheme = (themeId: ThemeId): ColorTheme => {
  return themes[themeId] || themes[defaultTheme];
};

export const getAllThemes = (): ColorTheme[] => {
  return Object.values(themes);
};

export const isValidThemeId = (themeId: string): themeId is ThemeId => {
  return themeId in themes;
};

// CSS variable mapping
export const getCSSVariables = (theme: ColorTheme): Record<string, string> => {
  return {
    '--primary': theme.colors.primary,
    '--primary-foreground': theme.colors.primaryForeground,
    '--secondary': theme.colors.secondary,
    '--secondary-foreground': theme.colors.secondaryForeground,
    '--accent': theme.colors.accent,
    '--accent-foreground': theme.colors.accentForeground,
    
    // Custom cake builder colors
    '--cake-pink': theme.colors.cakePrimary,
    '--cake-purple': theme.colors.cakeSecondary,
    '--cake-blue': theme.colors.cakeAccent,
    
    // Additional theme-specific variables
    '--theme-gradient-from': theme.colors.gradientFrom,
    '--theme-gradient-via': theme.colors.gradientVia || theme.colors.gradientFrom,
    '--theme-gradient-to': theme.colors.gradientTo,
    '--theme-button-primary': theme.colors.buttonPrimary,
    '--theme-button-secondary': theme.colors.buttonSecondary,
    '--theme-link': theme.colors.linkColor,
    '--theme-card-from': theme.colors.cardGradientFrom,
    '--theme-card-to': theme.colors.cardGradientTo,
    '--theme-shadow': theme.colors.shadowColor,
  };
};