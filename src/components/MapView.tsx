"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import type { Place, Category } from "@/lib/types";
import FilterPills from "./FilterPills";
import PlaceList from "./PlaceList";
import BottomSheet from "./BottomSheet";
import ThemeToggle from "./ThemeToggle";

const MapComponent = dynamic(() => import("./Map"), { ssr: false });

type CategoryFilter = "all" | Category;
type DietaryFilter = "all" | "Vegan" | "Veg" | "Both";

const CATEGORY_OPTIONS: { value: CategoryFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "rec", label: "Recs" },
  { value: "explore", label: "Explore" },
];

const DIETARY_OPTIONS: { value: DietaryFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "Vegan", label: "Vegan" },
  { value: "Veg", label: "Vegetarian" },
  { value: "Both", label: "Both" },
];

interface MapViewProps {
  places: Place[];
}

export default function MapView({ places }: MapViewProps) {
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [dietaryFilter, setDietaryFilter] = useState<DietaryFilter>("all");
  const [cuisineFilter, setCuisineFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [sheetSnap, setSheetSnap] = useState<"peek" | "half" | "full">("peek");

  const cuisineOptions = useMemo(() => {
    const counts = new Map<string, number>();
    places.forEach((p) => {
      if (p.cuisine) {
        const base = p.cuisine.split("/")[0].split("(")[0].trim();
        counts.set(base, (counts.get(base) || 0) + 1);
      }
    });
    const sorted = Array.from(counts.entries())
      .filter(([, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1])
      .map(([cuisine]) => cuisine);
    return [
      { value: "all", label: "All" },
      ...sorted.map((c) => ({ value: c, label: c })),
    ];
  }, [places]);

  const filtered = useMemo(() => {
    return places.filter((p) => {
      if (categoryFilter !== "all" && p.category !== categoryFilter) return false;
      if (dietaryFilter !== "all" && p.dietary_options !== dietaryFilter) return false;
      if (cuisineFilter !== "all" && !p.cuisine?.toLowerCase().includes(cuisineFilter.toLowerCase())) return false;
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
  }, [places, categoryFilter, dietaryFilter, cuisineFilter, searchQuery]);

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
        <FilterPills options={CATEGORY_OPTIONS} selected={categoryFilter} onChange={setCategoryFilter} />
        <FilterPills options={DIETARY_OPTIONS} selected={dietaryFilter} onChange={setDietaryFilter} />
      </div>

      <ThemeToggle className="absolute top-3 right-3 z-30" />

      {/* Desktop layout */}
      <div className="hidden md:flex h-full">
        {/* Sidebar */}
        <div className="w-[380px] shrink-0 h-full overflow-y-auto bg-background border-r border-card-border p-4 flex flex-col gap-3">
          <div>
            <h1 className="text-xl font-bold text-foreground">SF Recs</h1>
            <p className="text-xs text-muted mt-0.5">Vaidehi&apos;s restaurant picks</p>
          </div>
          <FilterPills label="Show" options={CATEGORY_OPTIONS} selected={categoryFilter} onChange={setCategoryFilter} />
          <FilterPills label="Diet" options={DIETARY_OPTIONS} selected={dietaryFilter} onChange={setDietaryFilter} />
          <FilterPills label="Cuisine" options={cuisineOptions} selected={cuisineFilter} onChange={setCuisineFilter} scrollable />
          <PlaceList
            places={filtered}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedId={selectedId}
            onSelectPlace={(id) => handleSelectPlace(id)}
            onHoverPlace={setHoveredId}
          />
          <p className="text-xs text-muted text-center pb-2">
            {filtered.length} place{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Map */}
        <div className="flex-1 h-full">
          <MapComponent
            places={filtered}
            selectedId={selectedId}
            onSelectPlace={handleSelectPlace}
            hoveredId={hoveredId}
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
        />

        <BottomSheet snap={sheetSnap} onSnapChange={setSheetSnap}>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-bold text-foreground">SF Recs</h1>
              <span className="text-xs text-muted">{filtered.length} places</span>
            </div>
            <FilterPills label="Cuisine" options={cuisineOptions} selected={cuisineFilter} onChange={setCuisineFilter} scrollable />
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
            />
          </div>
        </BottomSheet>
      </div>
    </div>
  );
}
