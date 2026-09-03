import type { Place } from "./types";

/**
 * Food vs attractions — the same cut the Food/Attractions filter makes.
 * `activity` is the only non-food place type; bars and coffee are still
 * somewhere you eat and drink, so they stay on the food side.
 */
export function isAttraction(place: Pick<Place, "place_type">): boolean {
  return place.place_type === "activity";
}

type Styled = Pick<Place, "category" | "place_type">;

/**
 * Marker and chip styling runs on two independent axes, so either can be read
 * without decoding the other:
 *
 *   colour = category — green for a rec, violet for explore (unchanged)
 *   fill   = kind     — solid for food, outlined-and-square for an attraction
 *
 * Shape survives what colour alone does not: a small marker, a busy map
 * underneath, and a reader who has not learnt the colour code yet.
 *
 * Every class is spelled out rather than composed from a colour variable —
 * Tailwind scans source text, so `border-${colour}` would never be generated.
 */
export function markerClasses(place: Styled): string {
  if (isAttraction(place)) {
    return place.category === "rec"
      ? "rounded-[10px] border-[2.5px] border-badge-rec bg-background shadow-md"
      : "rounded-[10px] border-[2.5px] border-badge-explore bg-background shadow-md";
  }
  return place.category === "rec" ? "rounded-full bg-badge-rec/90" : "rounded-full bg-badge-explore/90";
}

/** The category chip, in the same solid/outlined language as the markers. */
export function chipClasses(place: Styled): string {
  if (isAttraction(place)) {
    return place.category === "rec"
      ? "border border-badge-rec text-badge-rec"
      : "border border-badge-explore text-badge-explore";
  }
  return place.category === "rec"
    ? "bg-badge-rec/20 text-badge-rec"
    : "bg-badge-explore/20 text-badge-explore";
}
