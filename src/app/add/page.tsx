"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Loader2, Lock, MapPin, Search, X } from "lucide-react";
import type {
  Category,
  DietaryOption,
  GooglePlaceDetails,
  Place,
  PlaceType,
} from "@/lib/types";
import StarInput from "@/components/StarInput";
import ThemeToggle from "@/components/ThemeToggle";
import {
  deriveCuisine,
  deriveNeighborhood,
  derivePlaceType,
  derivePriceLevel,
  distinctByFrequency,
} from "@/lib/derive-place";

interface SearchResult {
  id: string;
  displayName: { text: string };
  formattedAddress: string;
}

interface FormState {
  google_place_id: string;
  name: string;
  category: Category;
  place_type: PlaceType;
  cuisine: string;
  neighborhood: string;
  dietary_options: DietaryOption;
  gluten_free: boolean;
  notes: string;
  rating: number | null;
  price_level: string;
  website: string;
  latitude: number | null;
  longitude: number | null;
  address: string;
}

const FIELD_CLASS =
  "w-full min-h-[44px] px-3 py-2 rounded-xl bg-input-bg border border-input-border text-foreground text-sm placeholder:text-muted focus:outline-none focus:border-accent";

const LABEL_CLASS = "text-xs font-bold text-muted uppercase tracking-wide";

function buildForm(
  result: SearchResult,
  details: GooglePlaceDetails,
  places: Place[],
  cuisines: string[]
): FormState {
  return {
    google_place_id: result.id,
    name: details.displayName?.text || result.displayName?.text || "",
    // Deliberately 'rec': from /add the owner is almost always adding a
    // recommendation, unlike /admin which defaulted to 'explore'.
    category: "rec",
    place_type: derivePlaceType(details),
    cuisine: deriveCuisine(details, cuisines),
    neighborhood: deriveNeighborhood(details, places),
    dietary_options: "Both",
    gluten_free: false,
    notes: "",
    rating: null,
    price_level: derivePriceLevel(details),
    website: details.websiteUri ?? "",
    latitude: details.location?.latitude ?? null,
    longitude: details.location?.longitude ?? null,
    address:
      details.shortFormattedAddress ||
      details.formattedAddress ||
      result.formattedAddress ||
      "",
  };
}

export default function AddPage() {
  const [authState, setAuthState] = useState<"checking" | "locked" | "ready">(
    "checking"
  );
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  const [places, setPlaces] = useState<Place[]>([]);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  const [form, setForm] = useState<FormState | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [duplicate, setDuplicate] = useState<Place | null>(null);
  const [addedName, setAddedName] = useState("");

  const requestId = useRef(0);
  const wantSearchFocus = useRef(false);

  // The search input unmounts while the form is open, so focus is handed to it
  // as it mounts rather than at the moment the reset is requested.
  const searchRef = useCallback((node: HTMLInputElement | null) => {
    if (node && wantSearchFocus.current) {
      wantSearchFocus.current = false;
      node.focus();
    }
  }, []);

  const cuisineOptions = distinctByFrequency(places.map((p) => p.cuisine));
  const neighborhoodOptions = distinctByFrequency(
    places.map((p) => p.neighborhood)
  );

  const loadPlaces = useCallback(() => {
    return fetch("/api/places")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Place[]) => setPlaces(data))
      .catch(() => {});
  }, []);

  // Password up front: if the 30-day cookie is still good (usually it is) the
  // form opens straight away and the owner is never asked.
  useEffect(() => {
    fetch("/api/auth")
      .then((r) => r.json())
      .then((d) => {
        if (d.authenticated) {
          setAuthState("ready");
          loadPlaces();
        } else {
          setAuthState("locked");
        }
      })
      .catch(() => setAuthState("locked"));
  }, [loadPlaces]);

  // Debounced Google Places text search.
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) return;

    const timer = setTimeout(() => {
      const id = ++requestId.current;
      setSearching(true);
      fetch(`/api/places/search?q=${encodeURIComponent(q)}`)
        .then(async (r) => {
          const body = await r.json();
          if (!r.ok) throw new Error(body.error || "Search failed");
          return body as SearchResult[];
        })
        .then((data) => {
          if (id !== requestId.current) return;
          setResults(data.slice(0, 5));
          setSearchError(data.length === 0 ? "No results found" : "");
        })
        .catch((err: Error) => {
          if (id !== requestId.current) return;
          setResults([]);
          setSearchError(err.message);
        })
        .finally(() => {
          if (id === requestId.current) setSearching(false);
        });
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError("");
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setPassword("");
        setAuthState("ready");
        loadPlaces();
      } else {
        setLoginError("Wrong password");
      }
    } catch {
      setLoginError("Something went wrong");
    } finally {
      setLoggingIn(false);
    }
  };

  const handleSelect = async (result: SearchResult) => {
    requestId.current++;
    setLoadingDetails(true);
    setSearchError("");
    setAddedName("");
    try {
      const res = await fetch(
        `/api/places/details?placeId=${encodeURIComponent(result.id)}`
      );
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Could not load place details");
      setForm(buildForm(result, body as GooglePlaceDetails, places, cuisineOptions));
      setResults([]);
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : "Could not load details");
    } finally {
      setLoadingDetails(false);
    }
  };

  // Any edit invalidates a standing duplicate confirmation.
  const patch = (changes: Partial<FormState>) => {
    setForm((f) => (f ? { ...f, ...changes } : f));
    setDuplicate(null);
    setSubmitError("");
  };

  const resetToSearch = (justAdded: string) => {
    requestId.current++;
    wantSearchFocus.current = true;
    setForm(null);
    setQuery("");
    setResults([]);
    setSearchError("");
    setSubmitError("");
    setDuplicate(null);
    setAddedName(justAdded);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form || submitting) return;

    if (form.latitude === null || form.longitude === null) {
      setSubmitError(
        "Google didn't return coordinates for this place. Search for it again."
      );
      return;
    }
    if (!form.name.trim()) {
      setSubmitError("Name is required.");
      return;
    }

    const existing = places.find(
      (p) =>
        (form.google_place_id && p.google_place_id === form.google_place_id) ||
        p.name.trim().toLowerCase() === form.name.trim().toLowerCase()
    );
    // First click on a duplicate only warns; a second click goes through.
    if (existing && !duplicate) {
      setDuplicate(existing);
      return;
    }

    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/places", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          google_place_id: form.google_place_id,
          name: form.name.trim(),
          category: form.category,
          place_type: form.place_type,
          cuisine: form.cuisine.trim() || null,
          neighborhood: form.neighborhood.trim() || null,
          dietary_options: form.dietary_options,
          gluten_free: form.gluten_free,
          notes: form.notes.trim() || null,
          rating: form.rating,
          price_level: form.price_level || null,
          website: form.website || null,
          latitude: form.latitude,
          longitude: form.longitude,
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Could not add place");
      setPlaces((prev) => [...prev, body as Place]);
      resetToSearch((body as Place).name);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Could not add place");
    } finally {
      setSubmitting(false);
    }
  };

  if (authState === "checking") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 size={20} className="animate-spin text-muted" />
      </div>
    );
  }

  if (authState === "locked") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="w-full max-w-sm flex flex-col gap-3">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Lock size={18} className="text-accent" />
            <h1 className="text-xl font-bold text-foreground">Add a place</h1>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
            className={FIELD_CLASS}
          />
          {loginError && (
            <p className="text-sm text-accent-orange text-center">{loginError}</p>
          )}
          <button
            type="submit"
            disabled={loggingIn || !password}
            className="min-h-[44px] px-4 rounded-full bg-accent text-pill-active-text font-bold hover:bg-accent-hover transition-colors disabled:opacity-50"
          >
            {loggingIn ? "Unlocking…" : "Unlock"}
          </button>
          <p className="text-[11px] text-muted/60 text-center">
            Stays unlocked for 30 days on this device
          </p>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm font-bold text-muted hover:text-foreground transition-colors min-h-[44px]"
          >
            <ArrowLeft size={16} />
            Map
          </Link>
          <ThemeToggle />
        </div>

        {addedName && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-accent/15 border border-accent/40 text-sm text-foreground">
            <Check size={16} className="text-accent shrink-0" />
            <span>
              Added <strong>{addedName}</strong> — search for the next one.
            </span>
          </div>
        )}

        {!form ? (
          <>
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                ref={searchRef}
                type="text"
                inputMode="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for a place…"
                autoFocus
                className={`${FIELD_CLASS} pl-9 pr-9 text-base`}
              />
              {(searching || loadingDetails) && (
                <Loader2
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted animate-spin"
                />
              )}
            </div>

            {searchError && (
              <p className="text-sm text-accent-orange px-1">{searchError}</p>
            )}

            <div className="flex flex-col gap-1.5">
              {results.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handleSelect(r)}
                  disabled={loadingDetails}
                  className="text-left min-h-[56px] px-4 py-3 rounded-xl bg-card border border-card-border hover:border-accent active:border-accent transition-colors disabled:opacity-50"
                >
                  <div className="font-bold text-foreground text-sm">
                    {r.displayName?.text ?? "Unnamed place"}
                  </div>
                  <div className="text-xs text-muted truncate">
                    {r.formattedAddress ?? ""}
                  </div>
                </button>
              ))}
            </div>

            {query.trim().length < 2 && results.length === 0 && (
              <p className="text-xs text-muted/70 px-1">
                Type a name, tap the right result, then hit Enter. {places.length}{" "}
                places so far.
              </p>
            )}
          </>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-1.5 min-w-0">
                <MapPin size={14} className="text-accent shrink-0 mt-1" />
                <p className="text-xs text-muted truncate">{form.address}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  wantSearchFocus.current = true;
                  setForm(null);
                  setDuplicate(null);
                  setSubmitError("");
                }}
                className="shrink-0 p-2 -m-1 rounded-full text-muted hover:text-foreground"
                aria-label="Cancel and search again"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-1">
              <label className={LABEL_CLASS} htmlFor="name">
                Name
              </label>
              <input
                id="name"
                value={form.name}
                onChange={(e) => patch({ name: e.target.value })}
                className={`${FIELD_CLASS} font-bold text-base`}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className={LABEL_CLASS} htmlFor="category">
                  Category
                </label>
                <select
                  id="category"
                  value={form.category}
                  onChange={(e) => patch({ category: e.target.value as Category })}
                  className={FIELD_CLASS}
                >
                  <option value="rec">Rec</option>
                  <option value="explore">Explore</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className={LABEL_CLASS} htmlFor="place_type">
                  Type
                </label>
                <select
                  id="place_type"
                  value={form.place_type}
                  onChange={(e) =>
                    patch({ place_type: e.target.value as PlaceType })
                  }
                  className={FIELD_CLASS}
                >
                  <option value="restaurant">Restaurant</option>
                  <option value="bar">Bar</option>
                  <option value="coffee">Coffee</option>
                  <option value="activity">Activity</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className={LABEL_CLASS} htmlFor="cuisine">
                  Cuisine
                </label>
                <input
                  id="cuisine"
                  list="cuisine-options"
                  value={form.cuisine}
                  onChange={(e) => patch({ cuisine: e.target.value })}
                  placeholder="Pick or type"
                  className={FIELD_CLASS}
                />
                <datalist id="cuisine-options">
                  {cuisineOptions.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>

              <div className="flex flex-col gap-1">
                <label className={LABEL_CLASS} htmlFor="neighborhood">
                  Neighborhood
                </label>
                <input
                  id="neighborhood"
                  list="neighborhood-options"
                  value={form.neighborhood}
                  onChange={(e) => patch({ neighborhood: e.target.value })}
                  placeholder="Pick or type"
                  className={FIELD_CLASS}
                />
                <datalist id="neighborhood-options">
                  {neighborhoodOptions.map((n) => (
                    <option key={n} value={n} />
                  ))}
                </datalist>
              </div>

              <div className="flex flex-col gap-1">
                <label className={LABEL_CLASS} htmlFor="dietary_options">
                  Diet
                </label>
                <select
                  id="dietary_options"
                  value={form.dietary_options}
                  onChange={(e) =>
                    patch({ dietary_options: e.target.value as DietaryOption })
                  }
                  className={FIELD_CLASS}
                >
                  <option value="Both">Both</option>
                  <option value="Vegan">Vegan</option>
                  <option value="Veg">Vegetarian</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className={LABEL_CLASS} htmlFor="price_level">
                  Price
                </label>
                <select
                  id="price_level"
                  value={form.price_level}
                  onChange={(e) => patch({ price_level: e.target.value })}
                  className={FIELD_CLASS}
                >
                  <option value="">—</option>
                  <option value="$">$</option>
                  <option value="$$">$$</option>
                  <option value="$$$">$$$</option>
                  <option value="$$$$">$$$$</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 flex-wrap">
              <label className="flex items-center gap-2 min-h-[44px] text-sm text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.gluten_free}
                  onChange={(e) => patch({ gluten_free: e.target.checked })}
                  className="w-5 h-5 accent-accent"
                />
                Gluten-free options
              </label>
              <div className="flex items-center gap-2 min-h-[44px]">
                <span className={LABEL_CLASS}>Rating</span>
                <StarInput
                  value={form.rating}
                  onChange={(v) => patch({ rating: v })}
                  size={22}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className={LABEL_CLASS} htmlFor="notes">
                Notes
              </label>
              <input
                id="notes"
                value={form.notes}
                onChange={(e) => patch({ notes: e.target.value })}
                placeholder="Optional"
                className={FIELD_CLASS}
              />
            </div>

            {duplicate && (
              <div className="px-4 py-3 rounded-xl bg-accent-orange/15 border border-accent-orange/40 text-sm text-foreground">
                <strong>{duplicate.name}</strong> is already on the map
                {duplicate.neighborhood ? ` (${duplicate.neighborhood})` : ""}. Tap
                Add again to save it anyway.
              </div>
            )}

            {submitError && (
              <p className="text-sm text-accent-orange">{submitError}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="min-h-[52px] px-4 rounded-full bg-accent text-pill-active-text font-bold text-base hover:bg-accent-hover transition-colors disabled:opacity-50"
            >
              {submitting
                ? "Adding…"
                : duplicate
                  ? "Add anyway"
                  : `Add ${form.name || "place"}`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
