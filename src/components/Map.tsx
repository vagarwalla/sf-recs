"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import MapGL, { Marker, Popup, NavigationControl, GeolocateControl } from "react-map-gl/mapbox";
import { useTheme } from "next-themes";
import type { Place } from "@/lib/types";
import PlaceCard from "./PlaceCard";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

const SF_CENTER = { latitude: 37.76, longitude: -122.44 };

const CUISINE_ICONS: Record<string, string> = {
  mexican: "🌮",
  oaxacan: "🌮",
  venezuelan: "🫓",
  colombian: "🫓",
  bolivian: "🫓",
  peruvian: "🫓",
  argentine: "🥩",
  italian: "🍝",
  pizza: "🍕",
  japanese: "🍣",
  sushi: "🍣",
  ramen: "🍜",
  chinese: "🥟",
  cantonese: "🥟",
  dumpling: "🥟",
  vietnamese: "🍜",
  indian: "🍛",
  ethiopian: "🍛",
  lebanese: "🧆",
  mediterranean: "🧆",
  israeli: "🧆",
  "middle eastern": "🧆",
  turkish: "🧆",
  dessert: "🍰",
  brunch: "🍳",
  cafe: "☕",
  vegan: "🌱",
  "plant-based": "🌱",
  "ny-style": "🍕",
  "detroit-style": "🍕",
  vegetarian: "🌱",
  californian: "🥗",
  burger: "🍔",
  korean: "🍖",
  thai: "🍜",
  steakhouse: "🥩",
};

function getCuisineIcon(cuisine: string | null): string {
  if (!cuisine) return "🍽️";
  const lower = cuisine.toLowerCase();
  for (const [key, icon] of Object.entries(CUISINE_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return "🍽️";
}

function StarDots({ rating }: { rating: number }) {
  return (
    <span className="flex gap-px">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`w-1.5 h-1.5 rounded-full ${
            i <= rating ? "bg-accent-orange" : "bg-foreground/20"
          }`}
        />
      ))}
    </span>
  );
}

interface MapProps {
  places: Place[];
  selectedId: string | null;
  onSelectPlace: (id: string | null) => void;
  hoveredId: string | null;
}

export default function Map({ places, selectedId, onSelectPlace, hoveredId }: MapProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [zoom, setZoom] = useState(12.5);
  const [hoveredMarkerId, setHoveredMarkerId] = useState<string | null>(null);
  const mapRef = useRef<{ getMap: () => mapboxgl.Map } | null>(null);

  useEffect(() => setMounted(true), []);

  const selectedPlace = places.find((p) => p.id === selectedId);
  const activeHoverId = hoveredId || hoveredMarkerId;
  const hoveredPlace = activeHoverId ? places.find((p) => p.id === activeHoverId) : null;

  const flyToPlace = useCallback(
    (place: Place) => {
      const map = mapRef.current?.getMap();
      if (map) {
        map.flyTo({ center: [place.longitude, place.latitude], zoom: 15, duration: 800 });
      }
    },
    []
  );

  useEffect(() => {
    if (selectedPlace) flyToPlace(selectedPlace);
  }, [selectedPlace, flyToPlace]);

  if (!mounted || !MAPBOX_TOKEN) {
    return <div className="w-full h-full bg-background" />;
  }

  const mapStyle =
    theme === "light"
      ? "mapbox://styles/mapbox/light-v11"
      : "mapbox://styles/mapbox/dark-v11";

  const showLabels = zoom >= 13;

  return (
    <MapGL
      ref={mapRef as React.RefObject<React.ComponentRef<typeof MapGL>>}
      initialViewState={{ ...SF_CENTER, zoom: 12.5 }}
      mapStyle={mapStyle}
      mapboxAccessToken={MAPBOX_TOKEN}
      style={{ width: "100%", height: "100%" }}
      onClick={() => onSelectPlace(null)}
      onZoom={(e) => setZoom(e.viewState.zoom)}
      reuseMaps
    >
      <NavigationControl position="bottom-right" showCompass={false} />
      <GeolocateControl position="bottom-right" />

      {places.map((place) => {
        const isSelected = place.id === selectedId;
        const isHovered = place.id === activeHoverId;
        const isRec = place.category === "rec";
        const icon = getCuisineIcon(place.cuisine);

        return (
          <Marker
            key={place.id}
            latitude={place.latitude}
            longitude={place.longitude}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              onSelectPlace(place.id);
            }}
          >
            <div
              className="flex flex-col items-center cursor-pointer"
              onMouseEnter={() => setHoveredMarkerId(place.id)}
              onMouseLeave={() => setHoveredMarkerId(null)}
            >
              <div
                className={`flex items-center justify-center rounded-full transition-all ${
                  isSelected || isHovered
                    ? "w-9 h-9 shadow-lg ring-2 ring-white/80"
                    : "w-7 h-7"
                } ${isRec ? "bg-badge-rec/90" : "bg-badge-explore/90"}`}
                style={{ fontSize: isSelected || isHovered ? "16px" : "13px" }}
              >
                <span className="leading-none" role="img">{icon}</span>
              </div>
              {(showLabels || isSelected || isHovered) && (
                <span
                  className={`mt-0.5 text-[10px] font-bold leading-tight max-w-[80px] truncate ${
                    isSelected || isHovered ? "text-foreground" : "text-muted"
                  }`}
                  style={{
                    textShadow: "0 1px 3px rgba(0,0,0,0.8), 0 0px 6px rgba(0,0,0,0.5)",
                  }}
                >
                  {place.name.length > 15 ? place.name.slice(0, 14) + "…" : place.name}
                </span>
              )}
            </div>
          </Marker>
        );
      })}

      {/* Hover tooltip */}
      {hoveredPlace && hoveredPlace.id !== selectedId && (
        <Popup
          latitude={hoveredPlace.latitude}
          longitude={hoveredPlace.longitude}
          offset={20}
          closeButton={false}
          closeOnClick={false}
          className="hover-popup"
          anchor="bottom"
        >
          <div className="px-2 py-1.5 max-w-[220px]">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-foreground truncate">{hoveredPlace.name}</span>
              <span
                className={`shrink-0 text-[9px] font-bold uppercase px-1 py-0.5 rounded ${
                  hoveredPlace.category === "rec"
                    ? "bg-badge-rec/20 text-badge-rec"
                    : "bg-badge-explore/20 text-badge-explore"
                }`}
              >
                {hoveredPlace.category}
              </span>
            </div>
            {(hoveredPlace.cuisine || hoveredPlace.rating) && (
              <div className="flex items-center gap-2 mt-1 text-xs text-muted">
                {hoveredPlace.cuisine && (
                  <span>{getCuisineIcon(hoveredPlace.cuisine)} {hoveredPlace.cuisine.split("/")[0].split("(")[0].trim()}</span>
                )}
                {hoveredPlace.rating && <StarDots rating={hoveredPlace.rating} />}
              </div>
            )}
            {hoveredPlace.notes && (
              <p className="mt-1 text-[11px] text-muted/80 italic line-clamp-2 leading-snug">
                &ldquo;{hoveredPlace.notes}&rdquo;
              </p>
            )}
          </div>
        </Popup>
      )}

      {/* Selected popup — full place card */}
      {selectedPlace && (
        <Popup
          latitude={selectedPlace.latitude}
          longitude={selectedPlace.longitude}
          offset={16}
          closeOnClick={false}
          onClose={() => onSelectPlace(null)}
          maxWidth="320px"
          className="place-popup"
        >
          <div className="p-1">
            <PlaceCard place={selectedPlace} />
          </div>
        </Popup>
      )}
    </MapGL>
  );
}
