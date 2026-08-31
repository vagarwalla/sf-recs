"use client";

import { Star } from "lucide-react";

interface StarInputProps {
  value: number | null;
  onChange: (v: number | null) => void;
  size?: number;
}

/**
 * The owner's own 1-5 star rating (not Google's). Clicking the active star clears it.
 * Shared by /admin (inline table editing) and /add.
 */
export default function StarInput({ value, onChange, size = 16 }: StarInputProps) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(value === i ? null : i)}
          className="p-0.5"
          aria-label={`${i} star${i > 1 ? "s" : ""}`}
        >
          <Star
            size={size}
            className={`transition-colors ${
              value && i <= value
                ? "text-accent-orange fill-accent-orange"
                : "text-muted/30 hover:text-accent-orange/50"
            }`}
          />
        </button>
      ))}
    </div>
  );
}
