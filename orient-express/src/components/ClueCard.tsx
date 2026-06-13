"use client";

import { Clue } from "@/lib/types";

export default function ClueCard({
  caseNum,
  actionName,
  targetLabel,
  clueNumber,
  clue,
}: {
  caseNum: number;
  actionName: string;
  targetLabel: string;
  clueNumber: number | null;
  clue: Clue | undefined;
}) {
  const noNumber = clueNumber == null;
  const noText = !noNumber && (!clue || clue.text == null);
  const unverified = !noNumber && !noText && clue ? !clue.verified : false;

  return (
    <div className="relative rounded-md border border-paper-line bg-paper text-paper-ink paper-lines shadow-[0_12px_30px_rgba(0,0,0,0.5)] p-5 pt-4">
      {/* inner dashed frame */}
      <div className="pointer-events-none absolute inset-1.5 rounded border border-dashed border-oxblood/35" />

      <div className="relative">
        <div className="flex items-start justify-between border-b-2 border-oxblood pb-2">
          <span className="font-display text-[9px] tracking-[0.2em] text-oxblood">
            ◆ WAGON-LITS · CASE {caseNum}
          </span>
          {!noNumber && (
            <span className="font-type text-[11px] text-paper-ink/60">
              REF №&nbsp;{clueNumber}
            </span>
          )}
        </div>

        <p className="font-display text-[11px] tracking-[0.14em] text-oxblood uppercase mt-3">
          {actionName}
        </p>
        <h2 className="font-display text-2xl text-paper-ink leading-none mb-4">
          {targetLabel}
        </h2>

        {noNumber ? (
          <p className="font-type text-[15px] leading-relaxed text-paper-ink/55 italic">
            No clue number is recorded for this entry in Case {caseNum} yet — awaiting
            transcription from the clue-numbers sheet.
          </p>
        ) : (
          <>
            <p className="font-display text-[9px] tracking-[0.2em] text-oxblood/70 uppercase mb-1.5">
              Clue No. {clueNumber}
            </p>
            <p
              className={[
                "font-type text-[16px] leading-[1.65] whitespace-pre-wrap",
                noText ? "text-paper-ink/55 italic" : "text-paper-ink",
              ].join(" ")}
            >
              {noText
                ? `Clue #${clueNumber} — full text not yet transcribed. Read it from the booklet, then add it on the verify page.`
                : clue!.text}
            </p>
            {unverified && (
              <p className="mt-3 inline-block rounded-full border border-oxblood/50 px-2.5 py-1 font-display text-[8px] tracking-[0.18em] text-oxblood uppercase">
                Unverified · confirm against booklet
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
