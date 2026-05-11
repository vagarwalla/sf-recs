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
  isAdmin?: boolean;
  onPlaceUpdated?: (place: Place) => void;
  fitTrigger?: number;
}

export default function Map({ places, selectedId, onSelectPlace, hoveredId, isAdmin, onPlaceUpdated, fitTrigger }: MapProps) {
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
        map.flyTo({ center: [place.longitude, place.latitude], zoom: 14, duration: 800 });
      }
    },
    []
  );

  const fitAll = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map || places.length === 0) return;
    const lngs = places.map((p) => p.longitude);
    const lats = places.map((p) => p.latitude);
    const bounds: [[number, number], [number, number]] = [
      [Math.min(...lngs), Math.min(...lats)],
      [Math.max(...lngs), Math.max(...lats)],
    ];
    map.fitBounds(bounds, { padding: 60, duration: 800 });
    onSelectPlace(null);
  }, [places, onSelectPlace]);

  useEffect(() => {
    if (selectedPlace) flyToPlace(selectedPlace);
  }, [selectedPlace, flyToPlace]);

  useEffect(() => {
    if (fitTrigger && places.length > 0) {
      fitAll();
    }
  }, [fitTrigger, fitAll, places.length]);

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

      <div className="absolute bottom-[140px] right-[10px] z-10">
        <button
          onClick={(e) => { e.stopPropagation(); fitAll(); }}
          title="Fit all places"
          className="w-[29px] h-[29px] flex items-center justify-center rounded-md bg-white text-[#333] shadow hover:bg-gray-100 transition-colors"
          style={{ fontSize: "14px", lineHeight: 1 }}
        >
          ⊞
        </button>
      </div>

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
                className={`flex items-center justify-center rounded-full w-8 h-8 transition-shadow ${
                  isSelected || isHovered
                    ? "shadow-lg ring-2 ring-white/80"
                    : ""
                } ${isRec ? "bg-badge-rec/90" : "bg-badge-explore/90"}`}
                style={{ fontSize: "22px" }}
              >
                <span className="leading-none" role="img">{icon}</span>
              </div>
              {(showLabels || isSelected || hoveredId === place.id) && (
                <span
                  className={`mt-1 text-xs font-bold leading-tight max-w-[100px] truncate px-1.5 py-0.5 rounded-md pointer-events-none ${
                    isSelected || isHovered
                      ? "text-foreground bg-background/80"
                      : "text-foreground/90 bg-background/60"
                  }`}
                  style={{
                    backdropFilter: "blur(4px)",
                    WebkitBackdropFilter: "blur(4px)",
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
            <PlaceCard place={selectedPlace} isAdmin={isAdmin} onPlaceUpdated={onPlaceUpdated} />
          </div>
        </Popup>
      )}
    </MapGL>
  );
}
