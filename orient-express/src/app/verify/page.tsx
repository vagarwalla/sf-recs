"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { ACTION_GROUPS } from "@/lib/grid";
import { CLUES } from "@/lib/clues";
import { CASE_COUNT } from "@/lib/types";

export default function VerifyPage() {
  // ---- coverage stats ----
  const cells = ACTION_GROUPS.flatMap((g) => g.targets).flatMap((t) => t.clueByCase);
  const gridFilled = cells.filter((c) => c != null).length;
  const gridTotal = cells.length;

  const cluesTranscribed = CLUES.filter((c) => c.text != null).length;
  const cluesVerified = CLUES.filter((c) => c.verified).length;

  return (
    <main className="mx-auto max-w-[760px] px-4 pb-20 pt-4">
      <div className="flex items-center justify-between mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[12px] tracking-wide text-accent hover:text-accent-hover font-display uppercase"
        >
          <ArrowLeft size={14} /> Back
        </Link>
        <ThemeToggle />
      </div>

      <h1 className="font-display text-2xl text-foreground">Verify Clue Data</h1>
      <p className="text-muted text-sm mt-1 max-w-prose">
        Cross-check every value below against the physical clue-numbers sheet and
        booklet. Anything dimmed is not yet transcribed. Update the source files
        (<code className="text-accent">src/lib/grid.ts</code> and{" "}
        <code className="text-accent">src/lib/clues.ts</code>) as you confirm
        entries, and flip <code className="text-accent">verified</code> to{" "}
        <code className="text-accent">true</code>.
      </p>

      {/* coverage */}
      <div className="grid grid-cols-3 gap-3 mt-5">
        <Stat label="Grid cells filled" value={`${gridFilled} / ${gridTotal}`} />
        <Stat label="Clues transcribed" value={`${cluesTranscribed} / ${CLUES.length}`} />
        <Stat label="Clues verified" value={`${cluesVerified} / ${CLUES.length}`} />
      </div>

      {/* grid tables */}
      {ACTION_GROUPS.map((g) => (
        <section key={g.type} className="mt-8">
          <h2 className="font-display text-sm tracking-[0.18em] text-accent-hover uppercase mb-2">
            {g.name}
          </h2>
          <div className="overflow-x-auto rounded-md border border-card-border">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-card">
                  <th className="text-left font-display text-[10px] tracking-wider text-muted uppercase px-2.5 py-2">
                    {g.targetNoun}
                  </th>
                  {Array.from({ length: CASE_COUNT }, (_, i) => (
                    <th
                      key={i}
                      className="font-display text-[10px] text-muted px-1.5 py-2 text-center"
                    >
                      {i + 1}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {g.targets.map((t) => (
                  <tr key={t.key} className="border-t border-card-border">
                    <td className="px-2.5 py-2 whitespace-nowrap">{t.label}</td>
                    {t.clueByCase.map((c, i) => (
                      <td
                        key={i}
                        className={[
                          "px-1.5 py-2 text-center tabular-nums",
                          c == null ? "text-muted/30" : "text-foreground",
                        ].join(" ")}
                      >
                        {c ?? "·"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}

      {/* clue list */}
      <section className="mt-10">
        <h2 className="font-display text-sm tracking-[0.18em] text-accent-hover uppercase mb-2">
          Clue Booklet (1–{CLUES.length})
        </h2>
        <div className="rounded-md border border-card-border divide-y divide-card-border">
          {CLUES.map((c) => (
            <div key={c.id} className="flex gap-3 px-3 py-2 items-start">
              <span className="font-type text-accent text-sm w-9 shrink-0 text-right">
                {c.id}
              </span>
              <p
                className={[
                  "font-type text-[13px] leading-relaxed flex-1",
                  c.text == null ? "text-muted/35 italic" : "text-foreground",
                ].join(" ")}
              >
                {c.text ?? "not transcribed"}
              </p>
              {c.text != null && (
                <span
                  className={[
                    "shrink-0 rounded-full px-2 py-0.5 text-[8px] font-display tracking-wider uppercase mt-0.5",
                    c.verified
                      ? "border border-accent/60 text-accent"
                      : "border border-oxblood/60 text-oxblood",
                  ].join(" ")}
                >
                  {c.verified ? "verified" : "unverified"}
                </span>
              )}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-card-border bg-card px-3 py-3 text-center">
      <div className="font-display text-xl text-accent-hover tabular-nums">{value}</div>
      <div className="text-[10px] tracking-wider text-muted uppercase mt-0.5">{label}</div>
    </div>
  );
}
