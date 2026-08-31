import type { GooglePlaceDetails, Place, PlaceType } from "./types";

/** Google `priceLevel` enum -> the `$`-string stored on `places.price_level`. */
export function derivePriceLevel(details: GooglePlaceDetails): string {
  switch (details.priceLevel) {
    case "PRICE_LEVEL_INEXPENSIVE":
      return "$";
    case "PRICE_LEVEL_MODERATE":
      return "$$";
    case "PRICE_LEVEL_EXPENSIVE":
      return "$$$";
    case "PRICE_LEVEL_VERY_EXPENSIVE":
      return "$$$$";
    default:
      return "";
  }
}

const BAR_TYPES = new Set([
  "bar",
  "pub",
  "wine_bar",
  "bar_and_grill",
  "night_club",
  "liquor_store",
]);

const COFFEE_TYPES = new Set([
  "cafe",
  "coffee_shop",
  "bakery",
  "tea_house",
  "dessert_shop",
  "dessert_restaurant",
  "ice_cream_shop",
  "donut_shop",
  "chocolate_shop",
  "candy_store",
  "juice_shop",
]);

const FOOD_TYPES = new Set(["restaurant", "food", "food_court", "meal_takeaway", "meal_delivery"]);

/**
 * Map Google's type list onto our four place types. Order matters: a wine bar is
 * also tagged `restaurant` by Google, and a bakery is also tagged `food`.
 */
export function derivePlaceType(details: GooglePlaceDetails): PlaceType {
  const types = [details.primaryType, ...(details.types ?? [])].filter(
    (t): t is string => Boolean(t)
  );

  if (types.some((t) => BAR_TYPES.has(t))) return "bar";
  if (types.some((t) => COFFEE_TYPES.has(t))) return "coffee";
  if (types.some((t) => t.endsWith("_restaurant") || FOOD_TYPES.has(t))) {
    return "restaurant";
  }
  return "activity";
}

const CUISINE_BY_TYPE: Record<string, string> = {
  afghani_restaurant: "Afghan",
  african_restaurant: "African",
  american_restaurant: "American",
  asian_restaurant: "Asian",
  bakery: "Bakery",
  bar: "Bar",
  barbecue_restaurant: "Barbecue",
  brazilian_restaurant: "Brazilian",
  breakfast_restaurant: "Breakfast",
  brunch_restaurant: "Brunch",
  buffet_restaurant: "Buffet",
  cafe: "Coffee",
  cafeteria: "Cafeteria",
  candy_store: "Dessert",
  chinese_restaurant: "Chinese",
  chocolate_shop: "Dessert",
  coffee_shop: "Coffee",
  dessert_restaurant: "Dessert",
  dessert_shop: "Dessert",
  donut_shop: "Dessert",
  fast_food_restaurant: "Fast Food",
  fine_dining_restaurant: "Fine Dining",
  french_restaurant: "French",
  greek_restaurant: "Greek",
  hamburger_restaurant: "Burgers",
  ice_cream_shop: "Ice Cream",
  indian_restaurant: "Indian",
  indonesian_restaurant: "Indonesian",
  italian_restaurant: "Italian",
  japanese_restaurant: "Japanese",
  juice_shop: "Juice",
  korean_restaurant: "Korean",
  lebanese_restaurant: "Lebanese",
  mediterranean_restaurant: "Mediterranean",
  mexican_restaurant: "Mexican",
  middle_eastern_restaurant: "Middle Eastern",
  pizza_restaurant: "Pizza",
  pub: "Pub",
  ramen_restaurant: "Ramen",
  sandwich_shop: "Sandwiches",
  seafood_restaurant: "Seafood",
  spanish_restaurant: "Spanish",
  steak_house: "Steakhouse",
  sushi_restaurant: "Sushi",
  tea_house: "Tea",
  thai_restaurant: "Thai",
  turkish_restaurant: "Turkish",
  vegan_restaurant: "Vegan",
  vegetarian_restaurant: "Vegetarian",
  vietnamese_restaurant: "Vietnamese",
  wine_bar: "Wine Bar",
};

/** "Italian Restaurant" -> "Italian", "Ice Cream Shop" -> "Ice Cream". */
function fromDisplayName(displayName?: string): string {
  if (!displayName) return "";
  return displayName
    .replace(/\s+(Restaurant|Shop|Store|Place|House)$/i, "")
    .trim();
}

/**
 * Best-guess cuisine from Google's types, snapped to an existing database
 * spelling when one matches case-insensitively so the cuisine filter stays clean.
 */
export function deriveCuisine(
  details: GooglePlaceDetails,
  existingCuisines: string[]
): string {
  const types = [details.primaryType, ...(details.types ?? [])].filter(
    (t): t is string => Boolean(t)
  );

  let guess = "";
  for (const type of types) {
    if (CUISINE_BY_TYPE[type]) {
      guess = CUISINE_BY_TYPE[type];
      break;
    }
  }
  if (!guess) guess = fromDisplayName(details.primaryTypeDisplayName?.text);
  if (!guess) return "";

  const match = existingCuisines.find(
    (c) => c.toLowerCase() === guess.toLowerCase()
  );
  return match ?? guess;
}

/** Great-circle distance in km. */
export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * Google has no dependable neighborhood field, so: prefer a `neighborhood`
 * address component when it matches a neighborhood already in the database
 * (keeps the spelling consistent for filters), otherwise fall back to the
 * neighborhood of the geographically nearest existing place — right most of the
 * time in a city this dense, and the owner can correct it in one tap.
 */
export function deriveNeighborhood(
  details: GooglePlaceDetails,
  places: Place[]
): string {
  const existing = places
    .map((p) => p.neighborhood)
    .filter((n): n is string => Boolean(n));

  const googleNeighborhood = details.addressComponents?.find((c) =>
    c.types?.includes("neighborhood")
  )?.longText;

  if (googleNeighborhood) {
    const match = existing.find(
      (n) => n.toLowerCase() === googleNeighborhood.toLowerCase()
    );
    if (match) return match;
  }

  const location = details.location;
  if (location) {
    let nearest: { neighborhood: string; km: number } | null = null;
    for (const p of places) {
      if (!p.neighborhood) continue;
      const km = haversineKm(
        { lat: location.latitude, lng: location.longitude },
        { lat: p.latitude, lng: p.longitude }
      );
      if (!nearest || km < nearest.km) {
        nearest = { neighborhood: p.neighborhood, km };
      }
    }
    if (nearest) return nearest.neighborhood;
  }

  return googleNeighborhood ?? "";
}

/** Distinct non-empty values sorted by how often they appear, most common first. */
export function distinctByFrequency(values: (string | null | undefined)[]): string[] {
  const counts = new Map<string, number>();
  for (const value of values) {
    const trimmed = value?.trim();
    if (!trimmed) continue;
    counts.set(trimmed, (counts.get(trimmed) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([value]) => value);
}
