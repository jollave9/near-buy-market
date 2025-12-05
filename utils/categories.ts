export const CATEGORIES = [
  'Electronics',
  'Furniture',
  'Clothing',
  'Books',
  'Sports',
  'Toys',
  'Home & Garden',
  'Vehicles',
  'Other',
] as const;

export type Category = typeof CATEGORIES[number];
