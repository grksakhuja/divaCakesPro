export const pricingStructure = {
  "basePrices": {
    "6inch": 8000,
    "8inch": 15500
  },
  "layerPrice": 1500,
  "flavorPrices": {
    "chocolate": 0,
    "butter": 0,
    "orange": 0,
    "lemon": 0,
    "orange-poppyseed": 500,
    "lemon-poppyseed": 500
  } as { [key: string]: number },
  "icingTypes": {
    "butter": 0,
    "buttercream": 1000,
    "whipped": 1000,
    "fondant": 1000
  } as { [key: string]: number },
  "decorationPrices": {
    "sprinkles": 500,
    "fresh-fruit": 1200,
    "flowers": 1500,
    "gold-leaf": 1500,
    "happy-birthday": 700,
    "anniversary": 700
  } as { [key: string]: number },
  "dietaryPrices": {
    "halal": 500,
    "eggless": 1000,
    "vegan": 3500
  } as { [key: string]: number },
  "shapePrices": {
    "round": 0,
    "square": 0,
    "heart": 1800
  } as { [key: string]: number }
}; 