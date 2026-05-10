"use client";

interface FilterPillsProps<T extends string> {
  label?: string;
  options: { value: T; label: string }[];
  selected: T;
  onChange: (value: T) => void;
  scrollable?: boolean;
}

export default function FilterPills<T extends string>({
  label,
  options,
  selected,
  onChange,
  scrollable = false,
}: FilterPillsProps<T>) {
  return (
    <div className={`flex items-center gap-1.5 ${scrollable ? "overflow-x-auto min-h-[36px]" : "flex-wrap"}`}
      style={scrollable ? { scrollbarWidth: "none", WebkitOverflowScrolling: "touch" } as React.CSSProperties : undefined}
    >
      {label && (
        <span className="text-xs text-muted font-medium shrink-0 mr-1">{label}</span>
      )}
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          style={{ minHeight: "36px" }}
          className={`px-4 rounded-full text-sm font-bold whitespace-nowrap transition-colors shrink-0 ${
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
