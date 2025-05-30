// Currency formatting utility
export const formatPrice = (price: number): string => {
  return `RM ${(price / 100).toFixed(2)}`;
};

// Format price range
export const formatPriceRange = (minPrice: number, maxPrice?: number): string => {
  if (!maxPrice || minPrice === maxPrice) {
    return formatPrice(minPrice);
  }
  return `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
};

// Format section name from kebab-case to Title Case
export const formatSectionName = (key: string): string => {
  return key.split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};