"use client";

import { MapPin, Globe, ExternalLink, Clock } from "lucide-react";
import type { Place } from "@/lib/types";

interface PlaceCardProps {
  place: Place;
  compact?: boolean;
  onSelect?: () => void;
  isSelected?: boolean;
}

export default function PlaceCard({
  place,
  compact = false,
  onSelect,
  isSelected = false,
}: PlaceCardProps) {
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`;

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
            <h3 className="font-semibold text-foreground truncate">{place.name}</h3>
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
          </div>
        </div>
      </div>

      {!compact && (
        <>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-muted">
            {place.neighborhood && (
              <span className="flex items-center gap-1">
                <MapPin size={12} />
                {place.neighborhood}
              </span>
            )}
            {place.dietary_options && (
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {place.dietary_options}
              </span>
            )}
          </div>

          {place.notes && (
            <p className="mt-2 text-sm text-muted italic line-clamp-2">
              {place.notes}
            </p>
          )}

          <div className="flex gap-2 mt-3">
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-accent text-white hover:bg-accent-hover transition-colors"
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
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-pill-bg text-foreground hover:bg-card-border transition-colors"
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
