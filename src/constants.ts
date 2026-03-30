export const SECTORS = [
  'Energy',
  'Building Materials',
  'Shipping',
  'Steel',
  'Chemicals',
  'Mining',
  'Agribusiness',
  'Logistics',
  'Industrial AI',
  'Pharmaceuticals'
] as const;

export type Sector = typeof SECTORS[number];

export const COMMODITIES = [
  'Steel',
  'Oil',
  'Natural Gas',
  'Cement',
  'Pharmaceuticals',
  'Copper',
  'Aluminum',
  'Lithium',
  'Nickel',
  'Gold',
  'Silver',
  'Iron Ore',
  'Coal',
  'Chemicals',
  'Fertilizers',
  'Lumber'
] as const;

export type Commodity = typeof COMMODITIES[number];

export const REGIONS = [
  'Latin and Central America',
  'North America',
  'Western Europe',
  'Eastern Europe',
  'Middle East',
  'Africa',
  'India',
  'China',
  'Asia -ex China',
  'Oceania'
] as const;

export type Region = typeof REGIONS[number];

export const NEWS_TOPICS = [
  'Cement',
  'Bulk Shipping',
  'Paper Industry',
  'Energy',
  'Steel',
  'Chemicals',
  'Mining',
  'Logistics',
  'Pharmaceuticals'
] as const;

export type NewsTopic = typeof NEWS_TOPICS[number];
