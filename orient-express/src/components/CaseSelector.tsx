"use client";

import { CASE_COUNT } from "@/lib/types";

export default function CaseSelector({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="grid grid-cols-5 gap-2 sm:gap-3">
      {Array.from({ length: CASE_COUNT }, (_, i) => i + 1).map((n) => {
        const active = n === value;
        return (
          <button
            key={n}
            onClick={() => onChange(n)}
            aria-pressed={active}
            className={[
              "aspect-square rounded-full border font-display text-lg sm:text-xl transition-all min-h-[44px]",
              "flex flex-col items-center justify-center leading-none",
              active
                ? "bg-accent text-background border-accent-hover shadow-[0_0_0_3px_rgba(201,162,39,0.22)] -translate-y-0.5"
                : "bg-transparent text-foreground border-accent/60 hover:border-accent hover:bg-accent/10",
            ].join(" ")}
          >
            {n}
            <span className="text-[7px] tracking-[0.15em] opacity-60 font-sans mt-0.5">
              CASE
            </span>
          </button>
        );
      })}
    </div>
  );
}
