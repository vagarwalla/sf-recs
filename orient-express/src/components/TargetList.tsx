"use client";

import { Target } from "@/lib/types";

export default function TargetList({
  targets,
  caseIndex,
  selectedKey,
  onSelect,
}: {
  targets: Target[];
  caseIndex: number; // 0-based (Case 1 = 0)
  selectedKey: string | null;
  onSelect: (t: Target) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {targets.map((t) => {
        const active = t.key === selectedKey;
        const hasData = t.clueByCase[caseIndex] != null;
        return (
          <button
            key={t.key}
            onClick={() => onSelect(t)}
            aria-pressed={active}
            className={[
              "min-h-[44px] rounded-md border px-3.5 py-2.5 flex items-center justify-between text-left transition-all",
              active
                ? "border-accent-hover bg-oxblood/35"
                : "border-foreground/15 bg-foreground/[0.04] hover:border-accent hover:bg-accent/8",
            ].join(" ")}
          >
            <span className="text-base sm:text-lg">{t.label}</span>
            <span className="flex items-center gap-2">
              {!hasData && (
                <span className="text-[9px] tracking-wider text-muted/80 font-sans uppercase">
                  no data
                </span>
              )}
              <span className="font-display text-[10px] tracking-[0.12em] text-accent">
                {t.role}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
