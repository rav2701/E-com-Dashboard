/**
 * Shared product image mapping and resolver.
 * Uses real Amazon product photos from the FakeStore API.
 * All 20 FakeStore images are distributed across product cards.
 */

const PRODUCT_IMAGE_MAP: Record<string, string> = {
  // ── Audio (no good FakeStore match — use local) ──────
  "studio monitor headphones": "/jonas-jacobsson-VSYq9nS-fY0-unsplash.jpg",
  "noise-cancelling earbuds": "/jonas-jacobsson-VSYq9nS-fY0-unsplash.jpg",
  "wireless headphones": "/jonas-jacobsson-VSYq9nS-fY0-unsplash.jpg",
  "bluetooth speaker": "/jonas-jacobsson-VSYq9nS-fY0-unsplash.jpg",

  // ── Wearables ────────────────────────────────────────
  "luxury smartwatch": "https://fakestoreapi.com/img/71pWzhdJNwL._AC_UL640_QL65_ML3_.jpg",
  "fitness tracker band": "https://fakestoreapi.com/img/61sbMiUnoGL._AC_UL640_QL65_ML3_.jpg",
  "smart watch": "https://fakestoreapi.com/img/71YAIFU48IL._AC_UL640_QL65_ML3_.jpg",

  // ── Gaming ───────────────────────────────────────────
  "custom mechanical keyboard": "https://fakestoreapi.com/img/61mtL65D4cL._AC_SX679_.jpg",
  "mechanical keyboard": "https://fakestoreapi.com/img/61mtL65D4cL._AC_SX679_.jpg",
  "rgb mouse pad": "https://fakestoreapi.com/img/61mtL65D4cL._AC_SX679_.jpg",
  "mouse pad": "https://fakestoreapi.com/img/61mtL65D4cL._AC_SX679_.jpg",
  "gaming mouse": "https://fakestoreapi.com/img/61mtL65D4cL._AC_SX679_.jpg",

  // ── Monitors ─────────────────────────────────────────
  "portable monitor": "https://fakestoreapi.com/img/61IBBVJvSDL._AC_SY879_.jpg",
  "ultrawide": "https://fakestoreapi.com/img/81Zt42ioCgL._AC_SX679_.jpg",
  "4k monitor": "https://fakestoreapi.com/img/81QpkIctqPL._AC_SX679_.jpg",

  // ── Accessories ──────────────────────────────────────
  "usb-c hub": "https://fakestoreapi.com/img/61IBBVJvSDL._AC_SY879_.jpg",
  "wireless charging station": "https://fakestoreapi.com/img/61U7T1koQqL._AC_SX679_.jpg",
  "laptop stand": "https://fakestoreapi.com/img/61U7T1koQqL._AC_SX679_.jpg",
  "smart plug": "https://fakestoreapi.com/img/71kWymZ+c+L._AC_SX679_.jpg",

  // ── Home & Kitchen (no good FakeStore match — use local) ─
  "french press": "/jonas-jacobsson-VSYq9nS-fY0-unsplash.jpg",
  "dutch oven": "/jonas-jacobsson-VSYq9nS-fY0-unsplash.jpg",
  "wine opener": "/jonas-jacobsson-VSYq9nS-fY0-unsplash.jpg",
  "cutting board": "/jonas-jacobsson-VSYq9nS-fY0-unsplash.jpg",
  "soy candle": "https://fakestoreapi.com/img/71z3kpMAYsL._AC_UY879_.jpg",
  "cotton throw": "https://fakestoreapi.com/img/61pHAEJ4NML._AC_UX679_.jpg",
  "espresso machine": "/jonas-jacobsson-VSYq9nS-fY0-unsplash.jpg",

  // ── Sports & Fitness ─────────────────────────────────
  "yoga mat": "https://fakestoreapi.com/img/51Y5NI-I5jL._AC_UX679_.jpg",
  "dumbbell": "https://fakestoreapi.com/img/51eg55uWmdL._AC_UX679_.jpg",
  "resistance band": "https://fakestoreapi.com/img/51Y5NI-I5jL._AC_UX679_.jpg",
  "rowing machine": "https://fakestoreapi.com/img/51eg55uWmdL._AC_UX679_.jpg",
  "beach towel": "https://fakestoreapi.com/img/71HblAHs5xL._AC_UY879_-2t.jpg",

  // ── Fashion ──────────────────────────────────────────
  "leather briefcase": "https://fakestoreapi.com/img/81XH0e8fefL._AC_UY879_.jpg",
  "wool scarf": "https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_.jpg",
  "polarized sunglasses": "https://fakestoreapi.com/img/51UDEzMJVpL._AC_UL640_QL65_ML3_.jpg",
  "canvas tote": "https://fakestoreapi.com/img/71YXzeOuslL._AC_UY879_.jpg",
  "carbon fiber wallet": "https://fakestoreapi.com/img/61pHAEJ4NML._AC_UX679_.jpg",

  // ── Outdoors ─────────────────────────────────────────
  "camping tent": "https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_.jpg",
  "hiking backpack": "https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg",
  "water bottle": "https://fakestoreapi.com/img/71HblAHs5xL._AC_UY879_-2t.jpg",
  "tabletop fire pit": "https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_.jpg",
  "bicycle phone mount": "https://fakestoreapi.com/img/71HblAHs5xL._AC_UY879_-2t.jpg",

  // ── Category-level fallbacks ─────────────────────────
  audio: "/jonas-jacobsson-VSYq9nS-fY0-unsplash.jpg",
  wearables: "https://fakestoreapi.com/img/71YAIFU48IL._AC_UL640_QL65_ML3_.jpg",
  gaming: "https://fakestoreapi.com/img/61mtL65D4cL._AC_SX679_.jpg",
  monitors: "https://fakestoreapi.com/img/81QpkIctqPL._AC_SX679_.jpg",
  accessories: "/lasse-jensen-a5-AlNgVNZw-unsplash.jpg",
  "home & kitchen": "/jonas-jacobsson-VSYq9nS-fY0-unsplash.jpg",
  "sports & fitness": "https://fakestoreapi.com/img/51Y5NI-I5jL._AC_UX679_.jpg",
  fashion: "https://fakestoreapi.com/img/81XH0e8fefL._AC_UY879_.jpg",
  outdoors: "https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg",
};

export function resolveProductImage(
  name: string,
  category: string,
  dbImageUrl?: string | null
): string {
  if (dbImageUrl) return dbImageUrl;

  const nameLower = name.toLowerCase();
  const catLower = category.toLowerCase();

  for (const [keyword, url] of Object.entries(PRODUCT_IMAGE_MAP)) {
    if (nameLower.includes(keyword)) {
      return url;
    }
  }

  return PRODUCT_IMAGE_MAP[catLower] ?? PRODUCT_IMAGE_MAP.accessories;
}
