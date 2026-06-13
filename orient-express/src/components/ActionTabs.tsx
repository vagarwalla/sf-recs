"use client";

import { Search, BellRing, MapPin, Mail, LucideIcon } from "lucide-react";
import { ACTION_GROUPS } from "@/lib/grid";
import { ActionType } from "@/lib/types";

const ICONS: Record<string, LucideIcon> = {
  Search,
  BellRing,
  MapPin,
  Mail,
};

export default function ActionTabs({
  value,
  onChange,
}: {
  value: ActionType | null;
  onChange: (t: ActionType) => void;
}) {
  return (
    <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
      {ACTION_GROUPS.map((g) => {
        const Icon = ICONS[g.icon] ?? Search;
        const active = g.type === value;
        return (
          <button
            key={g.type}
            onClick={() => onChange(g.type)}
            aria-pressed={active}
            className={[
              "rounded-md border px-1 py-3 min-h-[44px] flex flex-col items-center gap-1.5 transition-all text-center",
              active
                ? "bg-oxblood border-accent-hover text-paper shadow-[inset_0_0_0_1px_rgba(232,199,90,0.5)]"
                : "bg-black/15 border-accent/45 text-foreground hover:bg-accent/10",
            ].join(" ")}
          >
            <Icon size={18} className={active ? "text-accent-hover" : "text-accent"} />
            <span className="font-display text-[9px] leading-tight tracking-wide uppercase">
              {g.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
