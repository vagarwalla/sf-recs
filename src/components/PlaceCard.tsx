"use client";

import { MapPin, Globe, ExternalLink, Leaf, Star } from "lucide-react";
import type { Place } from "@/lib/types";

interface PlaceCardProps {
  place: Place;
  compact?: boolean;
  onSelect?: () => void;
  isSelected?: boolean;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={12}
          className={i <= rating ? "text-accent-orange fill-accent-orange" : "text-muted/30"}
        />
      ))}
    </span>
  );
}

export default function PlaceCard({
  place,
  compact = false,
  onSelect,
  isSelected = false,
}: PlaceCardProps) {
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`;

  const metadata = place.cached_data;
  const openNow = metadata?.currentOpeningHours?.openNow;
  const weekdayDescriptions = metadata?.currentOpeningHours?.weekdayDescriptions;
  const todayHours = weekdayDescriptions?.[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

  return (
    <div
      onClick={onSelect}
      className={`p-3 rounded-xl border transition-colors ${
        isSelected
          ? "border-accent bg-accent/10"
          : "border-card-border bg-card hover:border-accent/50"
      } ${onSelect ? "cursor-pointer" : ""}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-foreground truncate">{place.name}</h3>
            {place.rating && <StarRating rating={place.rating} />}
            <span
              className={`shrink-0 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                place.category === "rec"
                  ? "bg-badge-rec/20 text-badge-rec"
                  : "bg-badge-explore/20 text-badge-explore"
              }`}
            >
              {place.category === "rec" ? "rec" : "explore"}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-sm text-muted">
            {place.cuisine && <span>{place.cuisine}</span>}
            {place.cuisine && place.price_level && place.price_level !== "—" && (
              <span>·</span>
            )}
            {place.price_level && place.price_level !== "—" && (
              <span>{place.price_level}</span>
            )}
            {place.neighborhood && (
              <>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <MapPin size={11} />
                  {place.neighborhood}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {!compact && (
        <>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-muted">
            {openNow !== undefined && (
              <span className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${openNow ? "bg-badge-rec" : "bg-red-500"}`} />
                <span className={openNow ? "text-badge-rec" : "text-red-400"}>
                  {openNow ? "Open now" : "Closed"}
                </span>
              </span>
            )}
            {todayHours && (
              <span className="text-muted/80">
                {todayHours.replace(/^[^:]+:\s*/, "")}
              </span>
            )}
            {place.dietary_options && (
              <span className="flex items-center gap-1">
                <Leaf size={11} />
                {place.dietary_options}
              </span>
            )}
          </div>

          {place.notes && (
            <div className="mt-2 pl-3 border-l-2 border-accent/40">
              <p className="text-sm text-muted italic leading-relaxed">
                &ldquo;{place.notes}&rdquo;
              </p>
            </div>
          )}

          <div className="flex gap-2 mt-3">
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-full bg-accent text-pill-active-text hover:bg-accent-hover transition-colors"
            >
              <MapPin size={12} />
              Directions
            </a>
            {place.website && (
              <a
                href={place.website}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-full bg-pill-bg text-foreground hover:bg-card-border transition-colors"
              >
                <Globe size={12} />
                Website
                <ExternalLink size={10} />
              </a>
            )}
          </div>
        </>
      )}
    </div>
  );
}
