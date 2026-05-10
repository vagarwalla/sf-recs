export type Category = "rec" | "explore";

export type PlaceType = "restaurant" | "bar" | "coffee" | "activity";

export type DietaryOption = "Vegan" | "Veg" | "Both";

export interface Place {
  id: string;
  google_place_id: string | null;
  name: string;
  category: Category;
  place_type: PlaceType;
  cuisine: string | null;
  neighborhood: string | null;
  dietary_options: DietaryOption | null;
  notes: string | null;
  rating: number | null;
  tags: string[];
  latitude: number;
  longitude: number;
  website: string | null;
  price_level: string | null;
  created_at: string;
  updated_at: string;
  cached_data?: GooglePlaceDetails | null;
}

export interface CachedMetadata {
  google_place_id: string;
  data: GooglePlaceDetails;
  fetched_at: string;
}

export interface GooglePlaceDetails {
  displayName?: { text: string };
  formattedAddress?: string;
  location?: { latitude: number; longitude: number };
  currentOpeningHours?: {
    openNow?: boolean;
    weekdayDescriptions?: string[];
  };
  regularOpeningHours?: {
    openNow?: boolean;
    weekdayDescriptions?: string[];
  };
  priceLevel?:
    | "PRICE_LEVEL_FREE"
    | "PRICE_LEVEL_INEXPENSIVE"
    | "PRICE_LEVEL_MODERATE"
    | "PRICE_LEVEL_EXPENSIVE"
    | "PRICE_LEVEL_VERY_EXPENSIVE";
  rating?: number;
  userRatingCount?: number;
  photos?: { name: string; widthPx: number; heightPx: number }[];
  googleMapsUri?: string;
  websiteUri?: string;
  businessStatus?: string;
}

export interface PlaceWithMetadata extends Place {
  cached_metadata: CachedMetadata | null;
}
