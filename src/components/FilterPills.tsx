"use client";

interface FilterPillsProps<T extends string> {
  label?: string;
  options: { value: T; label: string }[];
  selected: T;
  onChange: (value: T) => void;
}

export default function FilterPills<T extends string>({
  label,
  options,
  selected,
  onChange,
}: FilterPillsProps<T>) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {label && (
        <span className="text-xs text-muted font-medium shrink-0 mr-1">{label}</span>
      )}
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          style={{ minHeight: "32px" }}
          className={`px-3 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            selected === opt.value
              ? "bg-pill-active text-pill-active-text"
              : "bg-pill-bg text-pill-text hover:bg-card-border"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
