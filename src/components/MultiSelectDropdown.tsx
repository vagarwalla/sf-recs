"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, X } from "lucide-react";

interface MultiSelectDropdownProps {
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (values: string[]) => void;
}

export default function MultiSelectDropdown({
  label,
  options,
  selected,
  onChange,
}: MultiSelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const allSelected = selected.length === 0;

  const toggleValue = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const clearAll = () => onChange([]);

  const displayText = allSelected
    ? "All"
    : selected.length === 1
      ? options.find((o) => o.value === selected[0])?.label ?? selected[0]
      : `${selected.length} selected`;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-card text-foreground border border-card-border hover:border-accent transition-colors min-h-[36px] w-full"
      >
        <span className="text-xs text-muted shrink-0">{label}</span>
        <span className="truncate">{displayText}</span>
        {!allSelected && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              clearAll();
            }}
            className="ml-auto shrink-0 p-0.5 rounded hover:bg-card-border transition-colors"
          >
            <X size={12} />
          </button>
        )}
        <ChevronDown
          size={14}
          className={`shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-56 max-h-64 overflow-y-auto rounded-lg bg-card border border-card-border shadow-lg z-50">
          <button
            onClick={clearAll}
            className={`w-full text-left px-3 py-2 text-sm transition-colors ${
              allSelected
                ? "bg-accent/15 text-accent font-medium"
                : "text-foreground hover:bg-card-border/50"
            }`}
          >
            All
          </button>
          {options.map((opt) => {
            const isChecked = selected.includes(opt.value);
            return (
              <button
                key={opt.value}
                onClick={() => toggleValue(opt.value)}
                className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors ${
                  isChecked
                    ? "bg-accent/15 text-accent font-medium"
                    : "text-foreground hover:bg-card-border/50"
                }`}
              >
                <span
                  className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                    isChecked
                      ? "bg-accent border-accent"
                      : "border-card-border"
                  }`}
                >
                  {isChecked && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </span>
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
