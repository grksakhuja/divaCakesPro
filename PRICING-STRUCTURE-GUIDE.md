# Pricing Structure Guide

## How to Update Cake Options

The `server/pricing-structure.json` file controls all cake options and pricing. You can easily add or modify options by editing this file.

### Structure Overview

```json
{
  "basePrices": {
    "size_id": price_in_cents
  },
  "layerPrice": price_per_layer,
  "flavorPrices": {
    "flavor_id": additional_price
  },
  "icingTypes": {
    "icing_id": additional_price
  },
  "decorationPrices": {
    "decoration_id": additional_price
  },
  "dietaryPrices": {
    "dietary_id": additional_price
  },
  "shapePrices": {
    "shape_id": additional_price
  },
  "templatePrices": {
    "template_id": additional_price
  }
}
```

### Adding New Options

1. **New Size**: Add to `basePrices`
   ```json
   "10inch": 25000
   ```

2. **New Flavor**: Add to `flavorPrices`
   ```json
   "red-velvet": 1000
   ```

3. **New Decoration**: Add to `decorationPrices`
   ```json
   "edible-photo": 2000
   ```

### Updating the UI

After modifying `pricing-structure.json`, you'll need to update the corresponding TypeScript types and UI components:

1. Update `shared/schema.ts` with new option types
2. Update `client/src/pages/cake-builder.tsx` to include new options in the UI
3. Restart the server for changes to take effect

### Price Format

All prices are in cents (e.g., 9000 = $90.00)