import "dotenv/config";
import { Pool } from "pg";
import { PrismaClient, OrderStatus, PaymentStatus } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { faker } from "@faker-js/faker";

// ───────────────────────────────────────────────────────────────
//  Config
// ───────────────────────────────────────────────────────────────

const CONFIG = {
  TOTAL_USERS: 350,
  TOTAL_ORDERS: 1200,
  PRODUCTS_PER_TIER: { budget: 15, mid: 20, premium: 15 },
  PAST_MONTHS: 12,
  BATCH_SIZE: 50,
};

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ───────────────────────────────────────────────────────────────
//  Retail Tier & Category Definitions
// ───────────────────────────────────────────────────────────────

interface ProductTemplate {
  name: string;
  description: string;
  categorySlug: string;
  tags: string[];
}

const tiers = {
  budget: { priceRange: [5.99, 39.99] as [number, number], markup: 1.4 },
  mid: { priceRange: [39.99, 179.99] as [number, number], markup: 1.6 },
  premium: { priceRange: [179.99, 1499.99] as [number, number], markup: 2.0 },
};

const categories = [
  {
    name: "Electronics", slug: "electronics", sortOrder: 1,
    children: [
      { name: "Headphones & Audio", slug: "headphones-audio", sortOrder: 1 },
      { name: "Wearables", slug: "wearables", sortOrder: 2 },
      { name: "Computer Accessories", slug: "computer-accessories", sortOrder: 3 },
      { name: "Mobile Accessories", slug: "mobile-accessories", sortOrder: 4 },
    ],
  },
  {
    name: "Home & Living", slug: "home-living", sortOrder: 2,
    children: [
      { name: "Kitchen & Dining", slug: "kitchen-dining", sortOrder: 1 },
      { name: "Home Office", slug: "home-office", sortOrder: 2 },
      { name: "Decor", slug: "decor", sortOrder: 3 },
    ],
  },
  {
    name: "Fashion", slug: "fashion", sortOrder: 3,
    children: [
      { name: "Accessories", slug: "accessories", sortOrder: 1 },
      { name: "Bags & Luggage", slug: "bags-luggage", sortOrder: 2 },
      { name: "Watches", slug: "watches", sortOrder: 3 },
    ],
  },
  {
    name: "Sports & Outdoors", slug: "sports-outdoors", sortOrder: 4,
    children: [
      { name: "Fitness Equipment", slug: "fitness-equipment", sortOrder: 1 },
      { name: "Outdoor Gear", slug: "outdoor-gear", sortOrder: 2 },
    ],
  },
];

// ─── Product templates per tier ───────────────────────────────

const productTemplates: Record<string, ProductTemplate[]> = {
  budget: [
    { name: "Basic Wireless Earbuds", description: "Affordable Bluetooth 5.3 earbuds with 6hr battery life.", categorySlug: "headphones-audio", tags: ["wireless", "earbuds", "bluetooth", "budget"] },
    { name: "USB-C Hub 7-in-1", description: "Compact USB-C hub with HDMI, SD card reader, and 3 USB-A ports.", categorySlug: "computer-accessories", tags: ["usb-c", "hub", "accessories"] },
    { name: "Slim Wallet Phone Case", description: "Minimalist phone case with 3-card slots and magnetic closure.", categorySlug: "mobile-accessories", tags: ["phone-case", "wallet", "slim"] },
    { name: "LED Desk Lamp", description: "Touch-controlled LED desk lamp with 3 brightness levels.", categorySlug: "home-office", tags: ["lamp", "led", "desk", "budget"] },
    { name: "Fitness Tracker Band", description: "Basic fitness tracker with step count, heart rate, and sleep tracking.", categorySlug: "wearables", tags: ["fitness", "tracker", "wearable", "budget"] },
    { name: "Stainless Steel Water Bottle", description: "Double-walled vacuum insulated, 750ml.", categorySlug: "outdoor-gear", tags: ["water-bottle", "insulated", "stainless"] },
    { name: "Canvas Tote Bag", description: "Everyday canvas tote with reinforced stitching, 15L capacity.", categorySlug: "bags-luggage", tags: ["tote", "canvas", "everyday"] },
    { name: "Bamboo Cutting Board Set", description: "Set of 3 bamboo cutting boards in graduated sizes.", categorySlug: "kitchen-dining", tags: ["cutting-board", "bamboo", "kitchen"] },
    { name: "Cotton Throw Blanket", description: "Lightweight cotton throw, 50x70 inches, machine washable.", categorySlug: "decor", tags: ["blanket", "cotton", "throw"] },
    { name: "Resistance Bands Set", description: "Set of 5 fabric resistance bands with different tensions.", categorySlug: "fitness-equipment", tags: ["resistance-bands", "fitness", "exercise"] },
    { name: "Phone Ring Holder", description: "Adjustable ring grip and stand for phones and cases.", categorySlug: "mobile-accessories", tags: ["phone-grip", "ring-holder", "accessory"] },
    { name: "Mesh Desk Organizer", description: "Multi-compartment mesh organizer for desk supplies.", categorySlug: "home-office", tags: ["organizer", "desk", "mesh"] },
    { name: "Soy Candle Set", description: "Set of 3 hand-poured soy candles, lavender, vanilla, and sandalwood.", categorySlug: "decor", tags: ["candle", "soy", "gift"] },
    { name: "Quick-Dry Beach Towel", description: "Ultra-absorbent microfiber travel towel, 60x30 inches.", categorySlug: "outdoor-gear", tags: ["towel", "microfiber", "travel"] },
    { name: "Bicycle Phone Mount", description: "Universal handlebar phone mount, tool-free installation.", categorySlug: "mobile-accessories", tags: ["bike-mount", "phone", "outdoor"] },
  ],
  mid: [
    { name: "Noise-Cancelling Headphones", description: "Over-ear ANC headphones with 30hr battery and Hi-Res audio.", categorySlug: "headphones-audio", tags: ["headphones", "anc", "noise-cancelling", "mid-range"] },
    { name: "Smart Watch Pro", description: "AMOLED display smartwatch with GPS, heart rate, and 14-day battery.", categorySlug: "wearables", tags: ["smartwatch", "gps", "fitness"] },
    { name: "Mechanical Keyboard RGB", description: "Hot-swappable mechanical keyboard with per-key RGB and PBT keycaps.", categorySlug: "computer-accessories", tags: ["keyboard", "mechanical", "rgb"] },
    { name: "Wireless Charging Station", description: "3-in-1 wireless charger for phone, watch, and earbuds.", categorySlug: "mobile-accessories", tags: ["charger", "wireless", "station"] },
    { name: "Standing Desk Converter", description: "Adjustable height standing desk converter, 36-inch wide.", categorySlug: "home-office", tags: ["standing-desk", "ergonomic", "office"] },
    { name: "Cast Iron Dutch Oven", description: "5.5qt enameled cast iron dutch oven, oven safe to 500°F.", categorySlug: "kitchen-dining", tags: ["cookware", "dutch-oven", "cast-iron"] },
    { name: "Leather Crossbody Bag", description: "Genuine leather crossbody bag with adjustable strap, 8L.", categorySlug: "bags-luggage", tags: ["leather", "crossbody", "bag"] },
    { name: "Yoga Mat Premium", description: "6mm thick TPE yoga mat with alignment lines, non-slip.", categorySlug: "fitness-equipment", tags: ["yoga", "mat", "fitness"] },
    { name: "Tabletop Fire Pit", description: "Mini propane fire pit table, 8,000 BTU, indoor/outdoor safe.", categorySlug: "decor", tags: ["fire-pit", "tabletop", "ambiance"] },
    { name: "Hiking Backpack 35L", description: "35-liter daypack with hydration sleeve and rain cover.", categorySlug: "outdoor-gear", tags: ["backpack", "hiking", "35l"] },
    { name: "Analog Minimalist Watch", description: "Japanese quartz movement, sapphire crystal, 100m water resistant.", categorySlug: "watches", tags: ["watch", "analog", "minimalist"] },
    { name: "Portable Bluetooth Speaker", description: "IPX7 waterproof speaker with 360° sound and 20hr battery.", categorySlug: "headphones-audio", tags: ["speaker", "bluetooth", "portable"] },
    { name: "French Press Coffee Maker", description: "34oz stainless steel double-wall french press, keeps coffee hot.", categorySlug: "kitchen-dining", tags: ["coffee", "french-press", "stainless"] },
    { name: "Silk Pillowcase Set", description: "Set of 2 mulberry silk pillowcases, 22 momme, 600 thread count.", categorySlug: "decor", tags: ["silk", "pillowcase", "luxury"] },
    { name: "Adjustable Dumbbell Set", description: "Adjustable 5-52.5lb dumbbell set with quick-change dial system.", categorySlug: "fitness-equipment", tags: ["dumbbell", "adjustable", "strength"] },
    { name: "Sunglasses Polarized", description: "Polarized UV400 sunglasses with lightweight titanium frame.", categorySlug: "accessories", tags: ["sunglasses", "polarized", "titanium"] },
    { name: "Smart Plug 4-Pack", description: "WiFi smart plugs with energy monitoring and voice control.", categorySlug: "home-office", tags: ["smart-plug", "wifi", "smart-home"] },
    { name: "Electric Wine Opener", description: "Rechargeable electric wine opener with foil cutter and aerator.", categorySlug: "kitchen-dining", tags: ["wine", "electric", "kitchen-gadget"] },
    { name: "Laptop Stand Aluminum", description: "Adjustable aluminum laptop stand with ventilated design.", categorySlug: "computer-accessories", tags: ["laptop-stand", "aluminum", "ergonomic"] },
    { name: "Compostable Phone Case", description: "Plant-based biodegradable phone case with 6ft drop protection.", categorySlug: "mobile-accessories", tags: ["phone-case", "eco", "compostable"] },
  ],
  premium: [
    { name: "Studio Reference Headphones", description: "Professional-grade planar magnetic headphones with balanced cable.", categorySlug: "headphones-audio", tags: ["headphones", "studio", "audiophile"] },
    { name: "Luxury Smartwatch Gold", description: "18K gold-plated smartwatch with sapphire crystal and leather band.", categorySlug: "wearables", tags: ["smartwatch", "luxury", "gold"] },
    { name: "Ergonomic Standing Desk", description: "Motorized dual-motor standing desk with bamboo top, 72x30 inches.", categorySlug: "home-office", tags: ["standing-desk", "motorized", "bamboo"] },
    { name: "Premium Leather Briefcase", description: "Full-grain Italian leather briefcase with padded laptop compartment.", categorySlug: "bags-luggage", tags: ["briefcase", "leather", "premium"] },
    { name: "Mechanical Keyboard Custom", description: "Full custom mechanical keyboard with brass plate and GMK keycaps.", categorySlug: "computer-accessories", tags: ["keyboard", "custom", "mechanical"] },
    { name: "Automatic Chronograph Watch", description: "Swiss automatic movement chronograph with exhibition caseback.", categorySlug: "watches", tags: ["watch", "automatic", "swiss"] },
    { name: "Smart Home Hub Display", description: "10-inch smart display with Matter support and 4K camera.", categorySlug: "computer-accessories", tags: ["smart-display", "smart-home", "hub"] },
    { name: "Italian Wool Scarf", description: "Pure cashmere-wool blend scarf, made in Italy, 180cm length.", categorySlug: "accessories", tags: ["scarf", "wool", "italian"] },
    { name: "Professional Chef Knife Set", description: "7-piece forged German steel knife set with walnut block.", categorySlug: "kitchen-dining", tags: ["knife", "german-steel", "professional"] },
    { name: "Smart Rowing Machine", description: "Magnetic resistance rowing machine with 22-inch HD screen.", categorySlug: "fitness-equipment", tags: ["rowing", "smart", "fitness"] },
    { name: "Designer Desk Lamp", description: "Architect-grade LED desk lamp with wireless charging base.", categorySlug: "home-office", tags: ["lamp", "designer", "led"] },
    { name: "Carbon Fiber Wallet", description: "RFID-blocking carbon fiber wallet with money clip.", categorySlug: "accessories", tags: ["wallet", "carbon-fiber", "rfid"] },
    { name: "Premium Camping Tent", description: "4-season 3-person tent with DAC aluminum poles, 4lbs total.", categorySlug: "outdoor-gear", tags: ["tent", "camping", "lightweight"] },
    { name: "Smart Espresso Machine", description: "WiFi-connected espresso machine with built-in grinder and app control.", categorySlug: "kitchen-dining", tags: ["espresso", "smart", "coffee"] },
    { name: "Diamond-Tipped Earbuds", description: "IEMs with diamond-like carbon drivers and handcrafted resin shells.", categorySlug: "headphones-audio", tags: ["earbuds", "audiophile", "iem"] },
  ],
};

// ───────────────────────────────────────────────────────────────
//  Global Geographic Dataset (real cities with accurate coords)
// ───────────────────────────────────────────────────────────────

interface GeoLocation {
  country: string;
  city: string;
  lat: number;
  lng: number;
  timezone: string;
  weight: number; // relative order distribution weight
}

const geoLocations: GeoLocation[] = [
  // North America (40%)
  { country: "United States", city: "New York", lat: 40.7128, lng: -74.0060, timezone: "America/New_York", weight: 8 },
  { country: "United States", city: "Los Angeles", lat: 34.0522, lng: -118.2437, timezone: "America/Los_Angeles", weight: 6 },
  { country: "United States", city: "Chicago", lat: 41.8781, lng: -87.6298, timezone: "America/Chicago", weight: 5 },
  { country: "United States", city: "Houston", lat: 29.7604, lng: -95.3698, timezone: "America/Chicago", weight: 3 },
  { country: "United States", city: "San Francisco", lat: 37.7749, lng: -122.4194, timezone: "America/Los_Angeles", weight: 4 },
  { country: "United States", city: "Seattle", lat: 47.6062, lng: -122.3321, timezone: "America/Los_Angeles", weight: 3 },
  { country: "United States", city: "Miami", lat: 25.7617, lng: -80.1918, timezone: "America/New_York", weight: 3 },
  { country: "United States", city: "Austin", lat: 30.2672, lng: -97.7431, timezone: "America/Chicago", weight: 2 },
  { country: "Canada", city: "Toronto", lat: 43.6532, lng: -79.3832, timezone: "America/Toronto", weight: 4 },
  { country: "Canada", city: "Vancouver", lat: 49.2827, lng: -123.1207, timezone: "America/Vancouver", weight: 2 },

  // Europe (30%)
  { country: "United Kingdom", city: "London", lat: 51.5074, lng: -0.1278, timezone: "Europe/London", weight: 7 },
  { country: "United Kingdom", city: "Manchester", lat: 53.4808, lng: -2.2426, timezone: "Europe/London", weight: 2 },
  { country: "Germany", city: "Berlin", lat: 52.5200, lng: 13.4050, timezone: "Europe/Berlin", weight: 5 },
  { country: "Germany", city: "Munich", lat: 48.1351, lng: 11.5820, timezone: "Europe/Berlin", weight: 3 },
  { country: "France", city: "Paris", lat: 48.8566, lng: 2.3522, timezone: "Europe/Paris", weight: 5 },
  { country: "France", city: "Lyon", lat: 45.7640, lng: 4.8357, timezone: "Europe/Paris", weight: 2 },
  { country: "Netherlands", city: "Amsterdam", lat: 52.3676, lng: 4.9041, timezone: "Europe/Amsterdam", weight: 3 },
  { country: "Spain", city: "Madrid", lat: 40.4168, lng: -3.7038, timezone: "Europe/Madrid", weight: 3 },
  { country: "Italy", city: "Milan", lat: 45.4642, lng: 9.1900, timezone: "Europe/Rome", weight: 3 },
  { country: "Sweden", city: "Stockholm", lat: 59.3293, lng: 18.0686, timezone: "Europe/Stockholm", weight: 2 },

  // Asia-Pacific (15%)
  { country: "Japan", city: "Tokyo", lat: 35.6762, lng: 139.6503, timezone: "Asia/Tokyo", weight: 5 },
  { country: "Japan", city: "Osaka", lat: 34.6937, lng: 135.5023, timezone: "Asia/Tokyo", weight: 2 },
  { country: "Australia", city: "Sydney", lat: -33.8688, lng: 151.2093, timezone: "Australia/Sydney", weight: 3 },
  { country: "Australia", city: "Melbourne", lat: -37.8136, lng: 144.9631, timezone: "Australia/Melbourne", weight: 2 },
  { country: "Singapore", city: "Singapore", lat: 1.3521, lng: 103.8198, timezone: "Asia/Singapore", weight: 3 },
  { country: "South Korea", city: "Seoul", lat: 37.5665, lng: 126.9780, timezone: "Asia/Seoul", weight: 3 },
  { country: "India", city: "Mumbai", lat: 19.0760, lng: 72.8777, timezone: "Asia/Kolkata", weight: 3 },
  { country: "India", city: "Bangalore", lat: 12.9716, lng: 77.5946, timezone: "Asia/Kolkata", weight: 2 },

  // Latin America (10%)
  { country: "Brazil", city: "São Paulo", lat: -23.5505, lng: -46.6333, timezone: "America/Sao_Paulo", weight: 3 },
  { country: "Brazil", city: "Rio de Janeiro", lat: -22.9068, lng: -43.1729, timezone: "America/Sao_Paulo", weight: 2 },
  { country: "Mexico", city: "Mexico City", lat: 19.4326, lng: -99.1332, timezone: "America/Mexico_City", weight: 3 },
  { country: "Argentina", city: "Buenos Aires", lat: -34.6037, lng: -58.3816, timezone: "America/Argentina/Buenos_Aires", weight: 2 },
  { country: "Colombia", city: "Bogotá", lat: 4.7110, lng: -74.0721, timezone: "America/Bogota", weight: 1 },

  // Middle East & Africa (5%)
  { country: "UAE", city: "Dubai", lat: 25.2048, lng: 55.2708, timezone: "Asia/Dubai", weight: 3 },
  { country: "South Africa", city: "Cape Town", lat: -33.9249, lng: 18.4241, timezone: "Africa/Johannesburg", weight: 2 },
  { country: "Israel", city: "Tel Aviv", lat: 32.0853, lng: 34.7818, timezone: "Asia/Jerusalem", weight: 1 },
  { country: "Nigeria", city: "Lagos", lat: 6.5244, lng: 3.3792, timezone: "Africa/Lagos", weight: 1 },
];

// Weighted random selection from geo locations
function pickGeoLocation(): GeoLocation {
  const totalWeight = geoLocations.reduce((s, l) => s + l.weight, 0);
  let r = Math.random() * totalWeight;
  for (const loc of geoLocations) {
    r -= loc.weight;
    if (r <= 0) return loc;
  }
  return geoLocations[0];
}

// ───────────────────────────────────────────────────────────────
//  Retail Variance Time Distribution Model
// ───────────────────────────────────────────────────────────────

/**
 * Generates an array of timestamps over the past N months that
 * follow authentic retail e-commerce patterns:
 *
 *   - Q4 holiday spike (Nov-Dec):         3.5x baseline
 *   - Black Friday week:                  5.0x baseline
 *   - Back-to-School (Aug-Sep):           1.5x baseline
 *   - Promotional weekends (random):      2.0x baseline
 *   - Summer lull (Jul):                  0.5x baseline
 *   - Weekends vs weekdays:               1.3x vs 1.0x
 *   - Weekday distribution: Tue/Wed peak, Mon/Fri taper
 */
function generateRetailTimestamps(count: number): Date[] {
  const now = new Date();
  const startDate = new Date(now);
  startDate.setMonth(startDate.getMonth() - CONFIG.PAST_MONTHS);
  startDate.setDate(1);
  startDate.setHours(0, 0, 0, 0);

  const timestamps: Date[] = [];

  // Pre-define known promotional periods (Black Friday, Cyber Monday, etc.)
  const promoPeriods = getPromotionalPeriods(now);

  for (let i = 0; i < count; i++) {
    const ts = generateSingleTimestamp(startDate, now, promoPeriods);
    timestamps.push(ts);
  }

  // Sort chronologically so orders feel "real"
  timestamps.sort((a, b) => a.getTime() - b.getTime());
  return timestamps;
}

interface PromoPeriod {
  start: Date;
  end: Date;
  multiplier: number;
  label: string;
}

function getPromotionalPeriods(now: Date): PromoPeriod[] {
  const year = now.getFullYear();
  const periods: PromoPeriod[] = [];

  // Black Friday week (week containing 4th Friday of November)
  const bfDate = new Date(year, 10, 1); // November
  const bfDay = getNthWeekdayDate(year, 10, 4, 5); // 4th Friday
  periods.push({
    start: new Date(bfDay.getTime() - 3 * 86400000),
    end: new Date(bfDay.getTime() + 4 * 86400000),
    multiplier: 5.0,
    label: "black-friday",
  });

  // Cyber Monday (Monday after Black Friday)
  const cmDay = new Date(bfDay.getTime() + 3 * 86400000);
  periods.push({
    start: cmDay,
    end: new Date(cmDay.getTime() + 1 * 86400000),
    multiplier: 4.0,
    label: "cyber-monday",
  });

  // Christmas season (Dec 10 - Dec 23)
  periods.push({
    start: new Date(year, 11, 10),
    end: new Date(year, 11, 23),
    multiplier: 3.5,
    label: "christmas",
  });

  // New Year sales (Dec 26 - Jan 5)
  periods.push({
    start: new Date(year, 11, 26),
    end: new Date(year + (now.getMonth() === 0 ? 0 : 0), 0, 5),
    multiplier: 2.5,
    label: "new-year",
  });

  // Valentine's week (Feb 7-14)
  periods.push({
    start: new Date(year, 1, 7),
    end: new Date(year, 1, 14),
    multiplier: 2.0,
    label: "valentine",
  });

  // Back to School (Aug 1 - Sep 5)
  periods.push({
    start: new Date(year, 7, 1),
    end: new Date(year, 8, 5),
    multiplier: 1.5,
    label: "back-to-school",
  });

  // Prime Day style mid-year (mid-July)
  periods.push({
    start: new Date(year, 6, 10),
    end: new Date(year, 6, 12),
    multiplier: 3.0,
    label: "mid-year-sale",
  });

  return periods;
}

function getNthWeekdayDate(year: number, month: number, n: number, weekday: number): Date {
  // weekday: 0=Sun, 1=Mon, ..., 5=Fri, 6=Sat
  const first = new Date(year, month, 1);
  const dayOfWeek = first.getDay();
  const diff = weekday - dayOfWeek;
  const firstOccurrence = diff >= 0 ? diff + 1 : diff + 8;
  return new Date(year, month, firstOccurrence + (n - 1) * 7);
}

function generateSingleTimestamp(
  startDate: Date,
  endDate: Date,
  promoPeriods: PromoPeriod[]
): Date {
  const rangeMs = endDate.getTime() - startDate.getTime();

  // Step 1: pick a rough position using weighted random
  // We use rejection sampling: pick a time, compute its weight, accept/reject
  let attempts = 0;
  while (attempts < 100) {
    const randomOffset = Math.random() * rangeMs;
    const candidateDate = new Date(startDate.getTime() + randomOffset);

    // Compute weight for this candidate
    const weight = computeTimeWeight(candidateDate, promoPeriods);

    // Accept with probability proportional to weight
    // Base weight is 1.0; max weight is ~5.0
    if (Math.random() < weight / 5.5) {
      // Add random hour within business hours skewed toward afternoon
      const hourBias = Math.random() * Math.random(); // square to bias toward later
      const hour = Math.floor(hourBias * 14) + 8; // 8 AM to 10 PM
      const minute = Math.floor(Math.random() * 60);
      candidateDate.setHours(hour, minute, Math.floor(Math.random() * 60), 0);
      return candidateDate;
    }
    attempts++;
  }

  // Fallback: uniform random
  const fallback = new Date(startDate.getTime() + Math.random() * rangeMs);
  fallback.setHours(10 + Math.floor(Math.random() * 12), Math.floor(Math.random() * 60), 0, 0);
  return fallback;
}

function computeTimeWeight(date: Date, promoPeriods: PromoPeriod[]): number {
  let weight = 1.0;
  const month = date.getMonth();
  const day = date.getDay(); // 0=Sun, 6=Sat
  // ── Monthly seasonality ─────────────────────────────
  const monthlyFactors: Record<number, number> = {
    0: 0.85,  // Jan (post-holiday lull)
    1: 0.75,  // Feb (post-holiday)
    2: 0.90,  // Mar
    3: 0.95,  // Apr
    4: 1.00,  // May
    5: 0.85,  // Jun
    6: 0.50,  // Jul (summer lull)
    7: 1.20,  // Aug (back-to-school ramp)
    8: 1.30,  // Sep (back-to-school peak)
    9: 1.10,  // Oct
    10: 2.50, // Nov (Q4)
    11: 3.00, // Dec (Q4 peak)
  };
  weight *= monthlyFactors[month] ?? 1.0;

  // ── Day of week ─────────────────────────────────────
  const dowFactors: Record<number, number> = {
    0: 0.7,  // Sunday
    1: 1.0,  // Monday
    2: 1.1,  // Tuesday
    3: 1.1,  // Wednesday
    4: 1.0,  // Thursday
    5: 1.2,  // Friday
    6: 1.3,  // Saturday
  };
  weight *= dowFactors[day] ?? 1.0;

  // ── Promotional periods ─────────────────────────────
  for (const period of promoPeriods) {
    if (date >= period.start && date <= period.end) {
      weight *= period.multiplier;
      break;
    }
  }

  // ── Random promotional weekend simulation ───────────
  // ~15% of weekends have a mini-promotion
  if (day === 5 || day === 6) {
    // Use deterministic hash of the date to decide
    const dateSeed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
    if ((dateSeed * 13 + 7) % 100 < 15) {
      weight *= 1.8;
    }
  }

  return weight;
}

// ───────────────────────────────────────────────────────────────
//  Data Generation Helpers
// ───────────────────────────────────────────────────────────────

function generateSKU(tier: string, index: number): string {
  const prefix = tier === "budget" ? "BGT" : tier === "mid" ? "MID" : "PRM";
  return `${prefix}-${String(index + 1).padStart(4, "0")}`;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function randomBetween(min: number, max: number, decimals = 2): number {
  const val = min + Math.random() * (max - min);
  return parseFloat(val.toFixed(decimals));
}

function weightedRandomOrderStatus(): string {
  const r = Math.random();
  if (r < 0.40) return "DELIVERED";
  if (r < 0.55) return "SHIPPED";
  if (r < 0.70) return "PROCESSING";
  if (r < 0.80) return "CONFIRMED";
  if (r < 0.88) return "PENDING";
  if (r < 0.94) return "CANCELLED";
  return "REFUNDED";
}

function weightedRandomPaymentStatus(orderStatus: string): string {
  if (orderStatus === "CANCELLED" || orderStatus === "REFUNDED") {
    return Math.random() < 0.5 ? "REFUNDED" : "PARTIALLY_REFUNDED";
  }
  if (orderStatus === "DELIVERED" || orderStatus === "SHIPPED") {
    return "PAID";
  }
  const r = Math.random();
  if (r < 0.60) return "PAID";
  if (r < 0.80) return "AUTHORIZED";
  if (r < 0.95) return "PENDING";
  return "FAILED";
}

function pickCurrencyForCountry(country: string): string {
  const currencyMap: Record<string, string> = {
    "United States": "USD", "Canada": "CAD", "United Kingdom": "GBP",
    "Germany": "EUR", "France": "EUR", "Netherlands": "EUR",
    "Spain": "EUR", "Italy": "EUR", "Japan": "JPY",
    "Australia": "AUD", "Brazil": "BRL",
  };
  return currencyMap[country] ?? "USD";
}

// ───────────────────────────────────────────────────────────────
//  Main Seed Function
// ───────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Starting seed...\n");

  // ── 1. Clean existing data ──────────────────────────
  console.log("  Cleaning existing data...");
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.productCategory.deleteMany();
  await prisma.user.deleteMany();

  // ── 2. Create categories ────────────────────────────
  console.log("  Creating categories...");
  const categoryMap = new Map<string, string>();

  for (const parentCat of categories) {
    const parent = await prisma.productCategory.create({
      data: {
        name: parentCat.name,
        slug: parentCat.slug,
        description: `${parentCat.name} category`,
        sortOrder: parentCat.sortOrder,
      },
    });
    categoryMap.set(parentCat.slug, parent.id);

    for (const childCat of parentCat.children) {
      const child = await prisma.productCategory.create({
        data: {
          name: childCat.name,
          slug: childCat.slug,
          description: `${childCat.name} subcategory`,
          parentId: parent.id,
          sortOrder: childCat.sortOrder,
        },
      });
      categoryMap.set(childCat.slug, child.id);
    }
  }

  // ── 3. Create 50 products across tiers ──────────────
  console.log("  Creating 50 products across retail tiers...");
  const productIds: string[] = [];
  const productPriceMap = new Map<string, number>();
  let productIndex = 0;

  for (const [tier, templates] of Object.entries(productTemplates)) {
    const { priceRange, markup } = tiers[tier as keyof typeof tiers];

    for (const template of templates) {
      productIndex++;
      const categoryId = categoryMap.get(template.categorySlug);
      const basePrice = randomBetween(priceRange[0], priceRange[1]);
      const costPrice = parseFloat((basePrice / markup).toFixed(2));
      const stockLevel = tier === "premium"
        ? faker.number.int({ min: 5, max: 50 })
        : tier === "mid"
          ? faker.number.int({ min: 20, max: 200 })
          : faker.number.int({ min: 50, max: 500 });
      const hasCompare = Math.random() < 0.3;
      const imageCount = tier === "premium" ? 5 : tier === "mid" ? 4 : 3;

      const product = await prisma.product.create({
        data: {
          sku: generateSKU(tier, productIndex),
          name: template.name,
          description: template.description,
          categoryId,
          basePrice,
          compareAtPrice: hasCompare ? parseFloat((basePrice * (1 + randomBetween(0.1, 0.4))).toFixed(2)) : null,
          costPrice,
          currency: "USD",
          stockLevel,
          lowStockThreshold: tier === "premium" ? 5 : 10,
          isLowStock: stockLevel <= (tier === "premium" ? 5 : 10),
          weightGrams: randomBetween(50, 2000, 0),
          widthMm: randomBetween(50, 400, 0),
          heightMm: randomBetween(10, 300, 0),
          depthMm: randomBetween(10, 300, 0),
          images: Array.from({ length: imageCount }, (_, i) => ({
            url: `https://picsum.photos/seed/${productIndex}-${i}/800/800`,
            alt: `${template.name} - view ${i + 1}`,
            width: 800,
            height: 800,
            sortOrder: i,
            isPrimary: i === 0,
          })),
          status: "ACTIVE",
          tags: template.tags,
          metadata: { tier, source: "seed", season: tier === "premium" ? "all-year" : "core" },
          ratingAvg: parseFloat(faker.number.float({ min: 3.0, max: 5.0, fractionDigits: 2 }).toFixed(2)),
          reviewCount: faker.number.int({ min: 5, max: 300 }),
        },
      });
      productIds.push(product.id);
      productPriceMap.set(product.id, Number(basePrice));
    }
  }

  console.log(`  ✓ ${productIds.length} products created`);

  // ── 4. Create users ─────────────────────────────────
  console.log("  Creating users...");
  const userIds: string[] = [];

  for (let i = 0; i < CONFIG.TOTAL_USERS; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const geo = pickGeoLocation();

    const user = await prisma.user.create({
      data: {
        email: faker.internet.email({ firstName, lastName }).toLowerCase(),
        firstName,
        lastName,
        phone: faker.phone.number(),
        avatarUrl: faker.image.avatar(),
        isActive: Math.random() < 0.92,
        lastLoginAt: faker.date.recent({ days: Math.random() < 0.6 ? 7 : 60 }),
        metadata: {
          signupSource: pickRandom(["organic", "referral", "instagram", "google", "facebook"]),
          preferredLanguage: "en",
          marketingOptIn: Math.random() < 0.7,
          accountTier: Math.random() < 0.05 ? "vip" : "standard",
        },
      },
    });
    userIds.push(user.id);
  }

  console.log(`  ✓ ${userIds.length} users created`);

  // ── 5. Generate order timestamps with retail variance ─
  console.log("  Generating order timestamps (retail variance model)...");
  const orderTimestamps = generateRetailTimestamps(CONFIG.TOTAL_ORDERS);

  // ── 6. Create orders with items ─────────────────────
  console.log("  Creating orders with items...");
  let orderCount = 0;

  // Process in batches for memory efficiency
  for (let batchStart = 0; batchStart < CONFIG.TOTAL_ORDERS; batchStart += CONFIG.BATCH_SIZE) {
    const batchEnd = Math.min(batchStart + CONFIG.BATCH_SIZE, CONFIG.TOTAL_ORDERS);
    const batchData: Array<{
      order: any;
      items: any[];
    }> = [];

    for (let i = batchStart; i < batchEnd; i++) {
      const placedAt = orderTimestamps[i];
      const userId = pickRandom(userIds);
      const geo = pickGeoLocation();
      const currencyCode = pickCurrencyForCountry(geo.country);
      const orderStatus = weightedRandomOrderStatus() as OrderStatus;
      const paymentStatus = weightedRandomPaymentStatus(orderStatus) as PaymentStatus;

      // Generate 1-5 items per order
      const itemCount = Math.random() < 0.6
        ? faker.number.int({ min: 1, max: 3 })
        : faker.number.int({ min: 3, max: 5 });

      const selectedProducts = pickN(productIds, itemCount);
      let subtotal = 0;
      const items: any[] = [];

      for (const productId of selectedProducts) {
        const quantity = faker.number.int({ min: 1, max: 3 });
        const unitPrice = productPriceMap.get(productId) ?? randomBetween(10, 100);
        const localizedPrice = parseFloat((unitPrice * (currencyCode === "USD" ? 1 : randomBetween(0.7, 1.5))).toFixed(2));
        const taxRate = parseFloat(randomBetween(0.05, 0.22, 4).toFixed(4));
        const total = parseFloat((localizedPrice * quantity).toFixed(2));
        subtotal += total;

        items.push({
          productId,
          quantity,
          unitPrice,
          localizedPrice,
          currency: currencyCode,
          taxRate,
          total,
          metadata: { currencyAdjusted: currencyCode !== "USD" },
          placedAt,
        });
      }

      const shippingCost = subtotal > 100 ? 0 : parseFloat(randomBetween(4.99, 15.99).toFixed(2));
      const taxAmount = parseFloat((subtotal * 0.08).toFixed(2));
      const discountPercent = Math.random() < 0.2 ? randomBetween(0.05, 0.25) : 0;
      const discountAmount = parseFloat((subtotal * discountPercent).toFixed(2));
      const total = parseFloat((subtotal + shippingCost + taxAmount - discountAmount).toFixed(2));

      batchData.push({
        order: {
          orderNumber: `ORD-${String(242000 + i + 1).padStart(6, "0")}`,
          userId,
          status: orderStatus,
          paymentStatus,
          subtotal: parseFloat(subtotal.toFixed(2)),
          shippingCost,
          taxAmount,
          discountAmount,
          total,
          currency: "USD",
          country: geo.country,
          city: geo.city,
          lat: geo.lat,
          lng: geo.lng,
          postalCode: faker.location.zipCode(),
          timezone: geo.timezone,
          metadata: {
            device: pickRandom(["desktop", "desktop", "desktop", "mobile", "mobile", "tablet"]),
            browser: pickRandom(["Chrome", "Firefox", "Safari", "Edge"]),
            platform: pickRandom(["Windows", "macOS", "iOS", "Android", "Linux"]),
          },
          shippingAddress: {
            line1: faker.location.streetAddress(),
            line2: Math.random() < 0.3 ? faker.location.secondaryAddress() : null,
            city: geo.city,
            state: faker.location.state(),
            postalCode: faker.location.zipCode(),
            country: geo.country,
          },
          billingAddress: {
            line1: faker.location.streetAddress(),
            city: geo.city,
            state: faker.location.state(),
            postalCode: faker.location.zipCode(),
            country: geo.country,
          },
          notes: Math.random() < 0.15 ? faker.lorem.sentence() : null,
          placedAt,
          createdAt: placedAt,
        },
        items,
      });
    }

    // Insert batch
    for (const { order, items } of batchData) {
      const createdOrder = await prisma.order.create({ data: order });
      for (const item of items) {
        await prisma.orderItem.create({
          data: { ...item, orderId: createdOrder.id },
        });
      }
      orderCount++;
    }

    const pct = Math.round((orderCount / CONFIG.TOTAL_ORDERS) * 100);
    process.stdout.write(`\r  Progress: ${orderCount}/${CONFIG.TOTAL_ORDERS} orders (${pct}%)`);
  }

  console.log(`\n  ✓ ${orderCount} orders created with items`);

  // ── Summary ──────────────────────────────────────────
  const userTotal = await prisma.user.count();
  const productTotal = await prisma.product.count();
  const categoryTotal = await prisma.productCategory.count();
  const orderTotal = await prisma.order.count();
  const orderItemTotal = await prisma.orderItem.count();

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  Seed Complete!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`  Categories:    ${categoryTotal}`);
  console.log(`  Products:      ${productTotal}`);
  console.log(`  Users:         ${userTotal}`);
  console.log(`  Orders:        ${orderTotal}`);
  console.log(`  Order Items:   ${orderItemTotal}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (e) => {
    console.error("❌ Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
