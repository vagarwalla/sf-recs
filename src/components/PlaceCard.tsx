"use client";

import { useState, useRef, useEffect } from "react";
import { MapPin, Globe, ExternalLink, Leaf, Star, Pencil, Check, X } from "lucide-react";
import type { Place } from "@/lib/types";

interface PlaceCardProps {
  place: Place;
  compact?: boolean;
  onSelect?: () => void;
  isSelected?: boolean;
  isAdmin?: boolean;
  onPlaceUpdated?: (place: Place) => void;
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

function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i === value ? 0 : i)}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          className="p-0.5 hover:scale-125 transition-transform"
        >
          <Star
            size={16}
            className={
              i <= (hover || value)
                ? "text-accent-orange fill-accent-orange"
                : "text-muted/40"
            }
          />
        </button>
      ))}
    </span>
  );
}

export default function PlaceCard({
  place,
  compact = false,
  onSelect,
  isSelected = false,
  isAdmin = false,
  onPlaceUpdated,
}: PlaceCardProps) {
  const [editing, setEditing] = useState(false);
  const [editRating, setEditRating] = useState(place.rating || 0);
  const [editNotes, setEditNotes] = useState(place.notes || "");
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`;

  const metadata = place.cached_data;
  const openNow = metadata?.currentOpeningHours?.openNow;
  const weekdayDescriptions = metadata?.currentOpeningHours?.weekdayDescriptions;
  const todayHours = weekdayDescriptions?.[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [editing]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/places/${place.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: editRating || null,
          notes: editNotes.trim() || null,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        onPlaceUpdated?.(updated);
        setEditing(false);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditRating(place.rating || 0);
    setEditNotes(place.notes || "");
    setEditing(false);
  };

  const startEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditRating(place.rating || 0);
    setEditNotes(place.notes || "");
    setEditing(true);
  };

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
            {!editing && place.rating && <StarRating rating={place.rating} />}
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
        {isAdmin && !editing && !compact && (
          <button
            onClick={startEdit}
            className="shrink-0 p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-card-border/50 transition-colors"
            title="Edit rating & notes"
          >
            <Pencil size={14} />
          </button>
        )}
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

          {editing ? (
            <div className="mt-3 space-y-2" onClick={(e) => e.stopPropagation()}>
              <div>
                <label className="text-xs text-muted font-medium">My rating</label>
                <div className="mt-1">
                  <StarInput value={editRating} onChange={setEditRating} />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted font-medium">Notes</label>
                <textarea
                  ref={textareaRef}
                  value={editNotes}
                  onChange={(e) => {
                    setEditNotes(e.target.value);
                    e.target.style.height = "auto";
                    e.target.style.height = e.target.scrollHeight + "px";
                  }}
                  placeholder="Add a note..."
                  className="mt-1 w-full px-2 py-1.5 text-sm bg-input-bg border border-input-border rounded-lg text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent resize-none"
                  rows={2}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-full bg-accent text-pill-active-text hover:bg-accent-hover transition-colors disabled:opacity-50"
                >
                  <Check size={12} />
                  {saving ? "Saving…" : "Save"}
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-full bg-pill-bg text-pill-text hover:bg-card-border transition-colors"
                >
                  <X size={12} />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            place.notes && (
              <div className="mt-2 pl-3 border-l-2 border-accent/40">
                <p className="text-sm text-muted italic leading-relaxed">
                  &ldquo;{place.notes}&rdquo;
                </p>
              </div>
            )
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
