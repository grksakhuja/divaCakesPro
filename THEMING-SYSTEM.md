# 🎨 CakeCraftPro Theme System Documentation

## Overview

The CakeCraftPro theme system provides a comprehensive, extensible way to switch between color themes site-wide. It supports both the customer-facing website and admin interface with consistent theming.

## 🚀 Quick Start

### Using the Theme Switcher
1. **Customer pages**: Theme switcher available in the main navigation
2. **Admin pages**: Theme switcher available in the admin header
3. **Theme persistence**: Selected theme is saved in localStorage and persists across sessions

### Available Themes
- **Sweet Pink** (`pink`): Warm pink/purple gradient theme (default)
- **Baby Blue** (`blue`): Soft baby blue/aqua gradient theme

## 🏗️ Architecture

### Core Files

1. **`/client/src/lib/theme-system.ts`**
   - Theme definitions and color configurations
   - CSS variable mapping functions
   - Type definitions

2. **`/client/src/lib/theme-context.tsx`**
   - React context for theme state management
   - Theme persistence with localStorage
   - Custom hooks: `useTheme()`, `useThemeClasses()`

3. **`/client/src/components/ui/theme-switcher.tsx`**
   - Theme switcher UI components
   - Multiple variants: default, compact, icon-only
   - Theme preview components

4. **`/client/src/index.css`**
   - CSS variable definitions
   - Theme-specific utility classes

5. **`/tailwind.config.ts`**
   - Extended color palette with theme variables
   - CSS variable integration

## 📋 Implementation Guide

### 1. Theme System Setup

The theme system is already integrated into the main app via the `ThemeProvider`:

```tsx
// App.tsx
<QueryClientProvider client={queryClient}>
  <ThemeProvider>
    <TooltipProvider>
      <Toaster />
      <Router />
    </TooltipProvider>
  </ThemeProvider>
</QueryClientProvider>
```

### 2. Using Themes in Components

#### Basic Theme Hook Usage
```tsx
import { useTheme } from '@/lib/theme-context';

function MyComponent() {
  const { currentTheme, themeId, setTheme } = useTheme();
  
  return (
    <div style={{ color: `hsl(${currentTheme.colors.primary})` }}>
      Current theme: {currentTheme.name}
    </div>
  );
}
```

#### Using Theme Classes Hook
```tsx
import { useThemeClasses } from '@/lib/theme-context';

function MyComponent() {
  const themeClasses = useThemeClasses();
  
  return (
    <div className={themeClasses.primaryGradient}>
      <button className={themeClasses.primaryButton}>
        Themed Button
      </button>
    </div>
  );
}
```

### 3. Available Theme Classes

The `useThemeClasses()` hook provides these pre-built CSS classes:

- `primaryGradient`: Full theme gradient background
- `cardGradient`: Subtle card gradient background  
- `primaryButton`: Themed primary button styles
- `secondaryButton`: Themed secondary button styles
- `linkStyle`: Themed link colors with hover effects
- `primaryBorder`: Primary color border
- `primaryText`: Primary color text
- `primaryBg`: Primary color background

### 4. Adding Theme Switcher to Pages

#### Navigation (Already Added)
```tsx
import { ThemeSwitcher } from '@/components/ui/theme-switcher';

// Compact version for desktop
<ThemeSwitcher variant="compact" />

// Icon-only for mobile
<ThemeSwitcher variant="icon-only" />
```

#### Settings Pages
```tsx
import { CompactThemeSelector } from '@/components/ui/theme-switcher';

<CompactThemeSelector />
```

## 🎨 Adding New Themes

### 1. Define Theme Colors

Add a new theme to `/client/src/lib/theme-system.ts`:

```tsx
export type ThemeId = 'pink' | 'blue' | 'green'; // Add new theme ID

export const themes: Record<ThemeId, ColorTheme> = {
  // ... existing themes
  
  green: {
    id: 'green',
    name: 'Forest Green',
    description: 'Natural green theme',
    colors: {
      primary: '142 76% 36%', // HSL values
      primaryForeground: '0 0% 100%',
      secondary: '120 100% 25%',
      // ... complete color definitions
    }
  }
};
```

### 2. Color Definition Guidelines

All colors should be defined as HSL values without the `hsl()` wrapper:
- ✅ Good: `'142 76% 36%'`
- ❌ Bad: `'hsl(142, 76%, 36%)'`

Required color properties:
- `primary`, `primaryForeground`
- `secondary`, `secondaryForeground`  
- `accent`, `accentForeground`
- `gradientFrom`, `gradientVia`, `gradientTo`
- `cakePrimary`, `cakeSecondary`, `cakeAccent`
- `buttonPrimary`, `buttonSecondary`, `linkColor`
- `cardGradientFrom`, `cardGradientTo`, `shadowColor`

### 3. Test New Themes

1. Add the theme to the system
2. Test theme switching in both customer and admin interfaces
3. Verify all components respect the new theme colors
4. Check localStorage persistence works correctly

## 🔧 Customization

### Custom CSS Variables

Themes automatically inject CSS variables that you can use directly:

```css
/* Available CSS variables */
--primary: /* theme primary color */
--theme-gradient-from: /* gradient start */
--theme-gradient-via: /* gradient middle */
--theme-gradient-to: /* gradient end */
--theme-button-primary: /* primary button color */
--theme-card-from: /* card gradient start */
/* ... etc */
```

Usage in components:
```tsx
<div className="bg-[hsl(var(--theme-gradient-from))]">
  Directly using CSS variables
</div>
```

### Tailwind Integration

The theme system extends Tailwind with theme-aware colors:

```tsx
// Use in Tailwind classes
<div className="bg-theme-primary text-theme-link">
  Using Tailwind theme colors
</div>
```

## 🚦 Migration Guide

### Updating Existing Components

Replace hardcoded colors with theme-aware alternatives:

#### Before:
```tsx
<div className="bg-pink-100 text-pink-600">
  <button className="bg-pink-500 hover:bg-pink-600">
    Button
  </button>
</div>
```

#### After:
```tsx
const themeClasses = useThemeClasses();

<div className={themeClasses.cardGradient}>
  <button className={themeClasses.primaryButton}>
    Button
  </button>
</div>
```

### Common Patterns

1. **Hero sections**: Use `themeClasses.cardGradient`
2. **Primary buttons**: Use `themeClasses.primaryButton`
3. **Links**: Use `themeClasses.linkStyle`
4. **Cards**: Use `themeClasses.cardGradient`
5. **Borders**: Use `themeClasses.primaryBorder`

## 🧪 Testing

### Manual Testing Checklist

- [ ] Theme switcher works in navigation
- [ ] Theme switcher works in admin interface
- [ ] Theme persists after page refresh
- [ ] All primary buttons update with theme
- [ ] All gradients update with theme
- [ ] Admin interface respects theme colors
- [ ] LocalStorage saves theme preference correctly

### Browser Testing

Test theme switching in:
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browsers

## 🔮 Future Enhancements

### Planned Features
1. **Dark mode support**: Add light/dark mode toggle per theme
2. **Custom theme builder**: Allow users to create custom themes
3. **Seasonal themes**: Automatic theme switching based on holidays
4. **User preferences**: Store theme preferences in user accounts
5. **Theme animations**: Smooth color transitions during theme switches

### Adding More Themes

The system is designed to be easily extensible. Simply:
1. Add new theme definition to `theme-system.ts`
2. Update the `ThemeId` type
3. Test the new theme across all components

## 📚 API Reference

### Types

```tsx
type ThemeId = 'pink' | 'blue';

interface ColorTheme {
  id: ThemeId;
  name: string;
  description: string;
  colors: {
    primary: string;
    primaryForeground: string;
    // ... complete interface in theme-system.ts
  };
}
```

### Hooks

```tsx
// Main theme hook
const { currentTheme, themeId, setTheme, isLoading } = useTheme();

// Helper hook for CSS classes
const themeClasses = useThemeClasses();
```

### Components

```tsx
// Theme switcher variants
<ThemeSwitcher variant="default" align="end" />
<ThemeSwitcher variant="compact" />
<ThemeSwitcher variant="icon-only" />

// Settings components
<CompactThemeSelector />
<ThemePreview themeId="pink" isSelected={true} onSelect={setTheme} />
```

---

## 📞 Support

For questions about the theming system:
1. Check this documentation first
2. Review the implementation in the core files listed above
3. Test changes in both customer and admin interfaces
4. Ensure theme persistence works correctly

**Last Updated**: 2025-06-03  
**Version**: 1.0.0