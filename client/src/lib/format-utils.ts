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