"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import MapGL, { Marker, Popup, NavigationControl, GeolocateControl } from "react-map-gl/mapbox";
import { useTheme } from "next-themes";
import type { Place } from "@/lib/types";
import PlaceCard from "./PlaceCard";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

const SF_CENTER = { latitude: 37.76, longitude: -122.44 };

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
  const mapRef = useRef<{ getMap: () => mapboxgl.Map } | null>(null);

  useEffect(() => setMounted(true), []);

  const selectedPlace = places.find((p) => p.id === selectedId);

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
        const isHovered = place.id === hoveredId;
        const isRec = place.category === "rec";

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
            <div className="flex flex-col items-center cursor-pointer">
              <div
                className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${
                  isSelected || isHovered
                    ? "scale-150 border-white shadow-lg"
                    : "border-transparent"
                } ${isRec ? "bg-badge-rec" : "bg-badge-explore"}`}
              />
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
