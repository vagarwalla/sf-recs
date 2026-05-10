"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import type { Place, Category } from "@/lib/types";
import MultiSelectDropdown from "./MultiSelectDropdown";
import PlaceList from "./PlaceList";
import BottomSheet from "./BottomSheet";
import ThemeToggle from "./ThemeToggle";
import LoginModal from "./LoginModal";
import { Lock, LogOut } from "lucide-react";

const MapComponent = dynamic(() => import("./Map"), { ssr: false });

const CATEGORY_OPTIONS: { value: string; label: string }[] = [
  { value: "rec", label: "Recs" },
  { value: "explore", label: "Explore" },
];

const DIETARY_OPTIONS: { value: string; label: string }[] = [
  { value: "Vegan", label: "Vegan" },
  { value: "Veg", label: "Vegetarian" },
  { value: "Both", label: "Both" },
];

interface MapViewProps {
  places: Place[];
}

export default function MapView({ places: initialPlaces }: MapViewProps) {
  const [places, setPlaces] = useState(initialPlaces);
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [dietaryFilter, setDietaryFilter] = useState<string[]>([]);
  const [cuisineFilter, setCuisineFilter] = useState<string[]>([]);
  const [neighborhoodFilter, setNeighborhoodFilter] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [sheetSnap, setSheetSnap] = useState<"peek" | "half" | "full">("peek");

  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    fetch("/api/auth")
      .then((r) => r.json())
      .then((d) => setIsAdmin(d.authenticated))
      .catch(() => {});
  }, []);

  const handlePlaceUpdated = useCallback((updated: Place) => {
    setPlaces((prev) => prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)));
  }, []);

  const cuisineOptions = useMemo(() => {
    const counts = new Map<string, number>();
    places.forEach((p) => {
      if (p.cuisine) {
        const base = p.cuisine.split("/")[0].split("(")[0].trim();
        counts.set(base, (counts.get(base) || 0) + 1);
      }
    });
    return Array.from(counts.entries())
      .filter(([, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1])
      .map(([cuisine]) => ({ value: cuisine, label: cuisine }));
  }, [places]);

  const neighborhoodOptions = useMemo(() => {
    const counts = new Map<string, number>();
    places.forEach((p) => {
      if (p.neighborhood) {
        counts.set(p.neighborhood, (counts.get(p.neighborhood) || 0) + 1);
      }
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([n]) => ({ value: n, label: n }));
  }, [places]);

  const filtered = useMemo(() => {
    return places.filter((p) => {
      if (categoryFilter.length > 0 && !categoryFilter.includes(p.category)) return false;
      if (dietaryFilter.length > 0 && p.dietary_options && !dietaryFilter.includes(p.dietary_options)) return false;
      if (cuisineFilter.length > 0) {
        const base = p.cuisine?.split("/")[0].split("(")[0].trim().toLowerCase() ?? "";
        if (!cuisineFilter.some((c) => base.includes(c.toLowerCase()))) return false;
      }
      if (neighborhoodFilter.length > 0 && (!p.neighborhood || !neighborhoodFilter.includes(p.neighborhood))) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const match =
          p.name.toLowerCase().includes(q) ||
          p.cuisine?.toLowerCase().includes(q) ||
          p.neighborhood?.toLowerCase().includes(q) ||
          p.notes?.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [places, categoryFilter, dietaryFilter, cuisineFilter, neighborhoodFilter, searchQuery]);

  const handleSelectPlace = (id: string | null) => {
    setSelectedId(id);
    if (id && sheetSnap === "full") {
      setSheetSnap("peek");
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden relative">
      {/* Filters — floating on mobile */}
      <div className="absolute top-3 left-3 right-14 z-30 flex flex-col gap-1.5 md:hidden">
        <div className="flex gap-1.5">
          <div className="flex-1"><MultiSelectDropdown label="Show" options={CATEGORY_OPTIONS} selected={categoryFilter} onChange={setCategoryFilter} /></div>
          <div className="flex-1"><MultiSelectDropdown label="Diet" options={DIETARY_OPTIONS} selected={dietaryFilter} onChange={setDietaryFilter} /></div>
        </div>
        <div className="flex gap-1.5">
          <div className="flex-1"><MultiSelectDropdown label="Area" options={neighborhoodOptions} selected={neighborhoodFilter} onChange={setNeighborhoodFilter} /></div>
        </div>
      </div>

      <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
        {isAdmin ? (
          <button
            onClick={() => setIsAdmin(false)}
            className="p-2 rounded-full bg-accent/20 text-accent hover:bg-accent/30 transition-colors"
            title="Editing enabled — click to lock"
          >
            <LogOut size={16} />
          </button>
        ) : (
          <button
            onClick={() => setShowLogin(true)}
            className="p-2 rounded-full bg-card/80 text-muted hover:text-foreground hover:bg-card transition-colors backdrop-blur"
            title="Admin login"
          >
            <Lock size={16} />
          </button>
        )}
        <ThemeToggle />
      </div>

      {/* Desktop layout */}
      <div className="hidden md:flex h-full">
        <div className="w-[380px] shrink-0 h-full overflow-y-auto bg-background border-r border-card-border p-4 flex flex-col gap-3">
          <div>
            <h1 className="text-xl font-bold text-foreground">Vaidehi&apos;s SF Recs</h1>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <div className="flex-1"><MultiSelectDropdown label="Show" options={CATEGORY_OPTIONS} selected={categoryFilter} onChange={setCategoryFilter} /></div>
              <div className="flex-1"><MultiSelectDropdown label="Diet" options={DIETARY_OPTIONS} selected={dietaryFilter} onChange={setDietaryFilter} /></div>
            </div>
            <div className="flex gap-2">
              <div className="flex-1"><MultiSelectDropdown label="Cuisine" options={cuisineOptions} selected={cuisineFilter} onChange={setCuisineFilter} /></div>
              <div className="flex-1"><MultiSelectDropdown label="Area" options={neighborhoodOptions} selected={neighborhoodFilter} onChange={setNeighborhoodFilter} /></div>
            </div>
          </div>
          <PlaceList
            places={filtered}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedId={selectedId}
            onSelectPlace={(id) => handleSelectPlace(id)}
            onHoverPlace={setHoveredId}
            isAdmin={isAdmin}
            onPlaceUpdated={handlePlaceUpdated}
          />
          <p className="text-xs text-muted text-center pb-2">
            {filtered.length} place{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex-1 h-full">
          <MapComponent
            places={filtered}
            selectedId={selectedId}
            onSelectPlace={handleSelectPlace}
            hoveredId={hoveredId}
            isAdmin={isAdmin}
            onPlaceUpdated={handlePlaceUpdated}
          />
        </div>
      </div>

      {/* Mobile layout */}
      <div className="md:hidden h-full">
        <MapComponent
          places={filtered}
          selectedId={selectedId}
          onSelectPlace={handleSelectPlace}
          hoveredId={null}
          isAdmin={isAdmin}
          onPlaceUpdated={handlePlaceUpdated}
        />

        <BottomSheet snap={sheetSnap} onSnapChange={setSheetSnap}>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-bold text-foreground">Vaidehi&apos;s SF Recs</h1>
              <span className="text-xs text-muted">{filtered.length} places</span>
            </div>
            <MultiSelectDropdown label="Cuisine" options={cuisineOptions} selected={cuisineFilter} onChange={setCuisineFilter} />
            <PlaceList
              places={filtered}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedId={selectedId}
              onSelectPlace={(id) => {
                handleSelectPlace(id);
                setSheetSnap("peek");
              }}
              onHoverPlace={() => {}}
              isAdmin={isAdmin}
              onPlaceUpdated={handlePlaceUpdated}
            />
          </div>
        </BottomSheet>
      </div>

      <LoginModal
        open={showLogin}
        onClose={() => setShowLogin(false)}
        onSuccess={() => {
          setIsAdmin(true);
          setShowLogin(false);
        }}
      />
    </div>
  );
}
