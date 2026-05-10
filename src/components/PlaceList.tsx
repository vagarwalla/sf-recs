"use client";

import type { Place } from "@/lib/types";
import PlaceCard from "./PlaceCard";
import { Search } from "lucide-react";

interface PlaceListProps {
  places: Place[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedId: string | null;
  onSelectPlace: (id: string) => void;
  onHoverPlace: (id: string | null) => void;
  isAdmin?: boolean;
  onPlaceUpdated?: (place: Place) => void;
}

export default function PlaceList({
  places,
  searchQuery,
  onSearchChange,
  selectedId,
  onSelectPlace,
  onHoverPlace,
  isAdmin,
  onPlaceUpdated,
}: PlaceListProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="text"
          placeholder="Search places..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-3 py-2 rounded-lg bg-input-bg border border-input-border text-foreground text-sm placeholder:text-muted focus:outline-none focus:border-accent"
        />
      </div>

      {places.length === 0 ? (
        <p className="text-sm text-muted text-center py-8">No places match your filters.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {places.map((place) => (
            <div
              key={place.id}
              onMouseEnter={() => onHoverPlace(place.id)}
              onMouseLeave={() => onHoverPlace(null)}
            >
              <PlaceCard
                place={place}
                compact={false}
                isSelected={place.id === selectedId}
                onSelect={() => onSelectPlace(place.id)}
                isAdmin={isAdmin}
                onPlaceUpdated={onPlaceUpdated}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
