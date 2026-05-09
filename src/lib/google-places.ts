import { GooglePlaceDetails } from "./types";

const API_BASE = "https://places.googleapis.com/v1";

function getApiKey(): string {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) throw new Error("GOOGLE_PLACES_API_KEY is not set");
  return key;
}

const DETAIL_FIELDS = [
  "displayName",
  "formattedAddress",
  "location",
  "currentOpeningHours",
  "regularOpeningHours",
  "priceLevel",
  "rating",
  "userRatingCount",
  "photos",
  "googleMapsUri",
  "websiteUri",
  "businessStatus",
].join(",");

export async function searchPlaces(
  query: string,
  locationBias?: { lat: number; lng: number }
): Promise<
  { id: string; displayName: { text: string }; formattedAddress: string }[]
> {
  const body: Record<string, unknown> = { textQuery: query, maxResultCount: 5 };
  if (locationBias) {
    body.locationBias = {
      circle: {
        center: { latitude: locationBias.lat, longitude: locationBias.lng },
        radius: 15000,
      },
    };
  }

  const res = await fetch(`${API_BASE}/places:searchText`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": getApiKey(),
      "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Google Places search failed: ${res.status} ${err}`);
  }

  const data = await res.json();
  return data.places ?? [];
}

export async function getPlaceDetails(
  placeId: string
): Promise<GooglePlaceDetails> {
  const res = await fetch(`${API_BASE}/places/${placeId}`, {
    headers: {
      "X-Goog-Api-Key": getApiKey(),
      "X-Goog-FieldMask": DETAIL_FIELDS,
    },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Google Places details failed: ${res.status} ${err}`);
  }

  return res.json();
}

export function getPhotoUrl(
  photoName: string,
  maxWidth: number = 400
): string {
  return `${API_BASE}/${photoName}/media?maxWidthPx=${maxWidth}&key=${getApiKey()}`;
}
