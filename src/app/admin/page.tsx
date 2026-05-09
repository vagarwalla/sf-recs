"use client";

import { useState, useEffect, useCallback } from "react";
import { Trash2, Save, LogIn, Plus, RefreshCw, Search } from "lucide-react";
import type { Place, Category, DietaryOption } from "@/lib/types";
import ThemeToggle from "@/components/ThemeToggle";

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Place>>({});
  const [addMode, setAddMode] = useState(false);
  const [newPlace, setNewPlace] = useState({
    name: "",
    category: "explore" as Category,
    cuisine: "",
    neighborhood: "",
    dietary_options: "Both" as DietaryOption,
    notes: "",
    latitude: "",
    longitude: "",
    website: "",
    price_level: "$$",
  });
  const [message, setMessage] = useState("");

  const fetchPlaces = useCallback(async () => {
    const res = await fetch("/api/places");
    if (res.ok) {
      const data = await res.json();
      setPlaces(data);
    }
  }, []);

  useEffect(() => {
    if (authenticated) fetchPlaces();
  }, [authenticated, fetchPlaces]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setAuthenticated(true);
      setMessage("");
    } else {
      setMessage("Invalid password");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    const res = await fetch(`/api/places/${id}`, { method: "DELETE" });
    if (res.ok) {
      setPlaces((p) => p.filter((x) => x.id !== id));
      setMessage(`Deleted "${name}"`);
    }
  };

  const handleSave = async (id: string) => {
    const res = await fetch(`/api/places/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    if (res.ok) {
      const updated = await res.json();
      setPlaces((p) => p.map((x) => (x.id === id ? updated : x)));
      setEditingId(null);
      setMessage(`Saved "${updated.name}"`);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(newPlace.latitude);
    const lng = parseFloat(newPlace.longitude);
    if (isNaN(lat) || isNaN(lng)) {
      setMessage("Invalid latitude/longitude");
      return;
    }
    const res = await fetch("/api/places", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...newPlace,
        latitude: lat,
        longitude: lng,
        place_type: "restaurant",
      }),
    });
    if (res.ok) {
      await fetchPlaces();
      setAddMode(false);
      setNewPlace({
        name: "",
        category: "explore",
        cuisine: "",
        neighborhood: "",
        dietary_options: "Both",
        notes: "",
        latitude: "",
        longitude: "",
        website: "",
        price_level: "$$",
      });
      setMessage("Place added");
    } else {
      const err = await res.json();
      setMessage(`Error: ${err.error}`);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    setMessage("Refreshing metadata...");
    const res = await fetch("/api/places/refresh", { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setMessage(`Refreshed ${data.refreshed}/${data.total} places (${data.failed} failed)`);
    } else {
      setMessage("Refresh failed");
    }
    setLoading(false);
  };

  const startEdit = (place: Place) => {
    setEditingId(place.id);
    setEditForm({
      name: place.name,
      category: place.category,
      cuisine: place.cuisine,
      neighborhood: place.neighborhood,
      dietary_options: place.dietary_options,
      notes: place.notes,
      price_level: place.price_level,
      website: place.website,
    });
  };

  const filtered = places.filter(
    (p) =>
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.cuisine?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.neighborhood?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="w-full max-w-sm flex flex-col gap-4">
          <h1 className="text-2xl font-bold text-foreground text-center">Admin Login</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="px-4 py-3 rounded-lg bg-input-bg border border-input-border text-foreground"
            autoFocus
          />
          <button
            type="submit"
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-accent text-white font-medium hover:bg-accent-hover"
          >
            <LogIn size={16} />
            Sign in
          </button>
          {message && <p className="text-sm text-red-500 text-center">{message}</p>}
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">SF Recs Admin</h1>
            <p className="text-sm text-muted">{places.length} places</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-pill-bg text-foreground text-sm hover:bg-card-border disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh Metadata
            </button>
            <button
              onClick={() => setAddMode(!addMode)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-accent text-white text-sm hover:bg-accent-hover"
            >
              <Plus size={14} />
              Add Place
            </button>
            <ThemeToggle />
          </div>
        </div>

        {message && (
          <div className="mb-4 px-4 py-2 rounded-lg bg-card border border-card-border text-sm text-foreground">
            {message}
          </div>
        )}

        {addMode && (
          <form
            onSubmit={handleAdd}
            className="mb-6 p-4 rounded-xl bg-card border border-card-border grid grid-cols-2 md:grid-cols-3 gap-3"
          >
            <input
              required
              placeholder="Name *"
              value={newPlace.name}
              onChange={(e) => setNewPlace({ ...newPlace, name: e.target.value })}
              className="px-3 py-2 rounded-lg bg-input-bg border border-input-border text-foreground text-sm col-span-2 md:col-span-1"
            />
            <select
              value={newPlace.category}
              onChange={(e) =>
                setNewPlace({ ...newPlace, category: e.target.value as Category })
              }
              className="px-3 py-2 rounded-lg bg-input-bg border border-input-border text-foreground text-sm"
            >
              <option value="rec">Rec</option>
              <option value="explore">Explore</option>
            </select>
            <input
              placeholder="Cuisine"
              value={newPlace.cuisine}
              onChange={(e) => setNewPlace({ ...newPlace, cuisine: e.target.value })}
              className="px-3 py-2 rounded-lg bg-input-bg border border-input-border text-foreground text-sm"
            />
            <input
              placeholder="Neighborhood"
              value={newPlace.neighborhood}
              onChange={(e) => setNewPlace({ ...newPlace, neighborhood: e.target.value })}
              className="px-3 py-2 rounded-lg bg-input-bg border border-input-border text-foreground text-sm"
            />
            <select
              value={newPlace.dietary_options}
              onChange={(e) =>
                setNewPlace({ ...newPlace, dietary_options: e.target.value as DietaryOption })
              }
              className="px-3 py-2 rounded-lg bg-input-bg border border-input-border text-foreground text-sm"
            >
              <option value="Vegan">Vegan</option>
              <option value="Veg">Vegetarian</option>
              <option value="Both">Both</option>
            </select>
            <select
              value={newPlace.price_level}
              onChange={(e) => setNewPlace({ ...newPlace, price_level: e.target.value })}
              className="px-3 py-2 rounded-lg bg-input-bg border border-input-border text-foreground text-sm"
            >
              <option value="$">$</option>
              <option value="$$">$$</option>
              <option value="$$$">$$$</option>
              <option value="$$$$">$$$$</option>
            </select>
            <input
              required
              placeholder="Latitude *"
              value={newPlace.latitude}
              onChange={(e) => setNewPlace({ ...newPlace, latitude: e.target.value })}
              className="px-3 py-2 rounded-lg bg-input-bg border border-input-border text-foreground text-sm"
            />
            <input
              required
              placeholder="Longitude *"
              value={newPlace.longitude}
              onChange={(e) => setNewPlace({ ...newPlace, longitude: e.target.value })}
              className="px-3 py-2 rounded-lg bg-input-bg border border-input-border text-foreground text-sm"
            />
            <input
              placeholder="Website URL"
              value={newPlace.website}
              onChange={(e) => setNewPlace({ ...newPlace, website: e.target.value })}
              className="px-3 py-2 rounded-lg bg-input-bg border border-input-border text-foreground text-sm"
            />
            <input
              placeholder="Notes"
              value={newPlace.notes}
              onChange={(e) => setNewPlace({ ...newPlace, notes: e.target.value })}
              className="px-3 py-2 rounded-lg bg-input-bg border border-input-border text-foreground text-sm col-span-2"
            />
            <div className="flex gap-2 col-span-2 md:col-span-1">
              <button
                type="submit"
                className="flex-1 px-3 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setAddMode(false)}
                className="px-3 py-2 rounded-lg bg-pill-bg text-foreground text-sm hover:bg-card-border"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search places..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-input-bg border border-input-border text-foreground text-sm placeholder:text-muted focus:outline-none focus:border-accent"
          />
        </div>

        <div className="rounded-xl border border-card-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-card border-b border-card-border">
                <th className="text-left px-3 py-2 text-foreground font-medium">Name</th>
                <th className="text-left px-3 py-2 text-foreground font-medium hidden md:table-cell">Cuisine</th>
                <th className="text-left px-3 py-2 text-foreground font-medium hidden md:table-cell">Neighborhood</th>
                <th className="text-left px-3 py-2 text-foreground font-medium">Cat</th>
                <th className="text-left px-3 py-2 text-foreground font-medium hidden lg:table-cell">Notes</th>
                <th className="px-3 py-2 w-24"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((place) => (
                <tr
                  key={place.id}
                  className="border-b border-card-border hover:bg-card/50 transition-colors"
                >
                  {editingId === place.id ? (
                    <>
                      <td className="px-3 py-2">
                        <input
                          value={editForm.name || ""}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="w-full px-2 py-1 rounded bg-input-bg border border-input-border text-foreground text-sm"
                        />
                      </td>
                      <td className="px-3 py-2 hidden md:table-cell">
                        <input
                          value={editForm.cuisine || ""}
                          onChange={(e) => setEditForm({ ...editForm, cuisine: e.target.value })}
                          className="w-full px-2 py-1 rounded bg-input-bg border border-input-border text-foreground text-sm"
                        />
                      </td>
                      <td className="px-3 py-2 hidden md:table-cell">
                        <input
                          value={editForm.neighborhood || ""}
                          onChange={(e) => setEditForm({ ...editForm, neighborhood: e.target.value })}
                          className="w-full px-2 py-1 rounded bg-input-bg border border-input-border text-foreground text-sm"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <select
                          value={editForm.category || "explore"}
                          onChange={(e) =>
                            setEditForm({ ...editForm, category: e.target.value as Category })
                          }
                          className="px-2 py-1 rounded bg-input-bg border border-input-border text-foreground text-sm"
                        >
                          <option value="rec">Rec</option>
                          <option value="explore">Explore</option>
                        </select>
                      </td>
                      <td className="px-3 py-2 hidden lg:table-cell">
                        <input
                          value={editForm.notes || ""}
                          onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                          className="w-full px-2 py-1 rounded bg-input-bg border border-input-border text-foreground text-sm"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleSave(place.id)}
                            className="p-1.5 rounded bg-badge-rec text-white hover:opacity-80"
                          >
                            <Save size={14} />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1.5 rounded bg-pill-bg text-foreground hover:bg-card-border"
                          >
                            X
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td
                        className="px-3 py-2 text-foreground font-medium cursor-pointer hover:text-accent"
                        onClick={() => startEdit(place)}
                      >
                        {place.name}
                      </td>
                      <td className="px-3 py-2 text-muted hidden md:table-cell">
                        {place.cuisine || "—"}
                      </td>
                      <td className="px-3 py-2 text-muted hidden md:table-cell">
                        {place.neighborhood || "—"}
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                            place.category === "rec"
                              ? "bg-badge-rec/20 text-badge-rec"
                              : "bg-badge-explore/20 text-badge-explore"
                          }`}
                        >
                          {place.category}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-muted text-xs truncate max-w-[200px] hidden lg:table-cell">
                        {place.notes || "—"}
                      </td>
                      <td className="px-3 py-2">
                        <button
                          onClick={() => handleDelete(place.id, place.name)}
                          className="p-1.5 rounded text-muted hover:text-red-500 hover:bg-red-500/10"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted text-center mt-4">
          Showing {filtered.length} of {places.length} places
        </p>
      </div>
    </div>
  );
}
