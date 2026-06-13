"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ClipboardCheck } from "lucide-react";
import Banner from "@/components/Banner";
import ThemeToggle from "@/components/ThemeToggle";
import CaseSelector from "@/components/CaseSelector";
import ActionTabs from "@/components/ActionTabs";
import TargetList from "@/components/TargetList";
import ClueCard from "@/components/ClueCard";
import { getActionGroup } from "@/lib/grid";
import { getClue } from "@/lib/clues";
import { ActionType, Target } from "@/lib/types";

function StepLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="deco-rule flex items-center gap-2 font-display text-[11px] tracking-[0.26em] text-accent-hover uppercase mb-3">
      {children}
    </p>
  );
}

export default function Home() {
  const [caseNum, setCaseNum] = useState(1);
  const [action, setAction] = useState<ActionType | null>(null);
  const [target, setTarget] = useState<Target | null>(null);

  // Remember the selected case across reloads — it's set once per game.
  useEffect(() => {
    const saved = Number(localStorage.getItem("oe-case"));
    // localStorage is client-only, so this must run after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved >= 1 && saved <= 10) setCaseNum(saved);
  }, []);
  useEffect(() => {
    localStorage.setItem("oe-case", String(caseNum));
  }, [caseNum]);

  const group = action ? getActionGroup(action) : null;
  const caseIndex = caseNum - 1;
  const clueNumber = target ? target.clueByCase[caseIndex] : null;
  const clue = getClue(clueNumber);

  function pickAction(t: ActionType) {
    setAction(t);
    setTarget(null);
  }

  return (
    <main className="mx-auto max-w-[480px] px-4 pb-16 pt-4">
      <div className="flex justify-end mb-2">
        <ThemeToggle />
      </div>

      <Banner subtitle="CLUE LOOKUP · CONDUCTOR'S COMPANION" />

      {/* STEP 1 — case */}
      <section className="mt-6">
        <StepLabel>I · Select Your Case</StepLabel>
        <CaseSelector value={caseNum} onChange={setCaseNum} />
      </section>

      {/* STEP 2 — action */}
      <section className="mt-6">
        <StepLabel>II · What Happened?</StepLabel>
        <ActionTabs value={action} onChange={pickAction} />
      </section>

      {/* STEP 3 — target */}
      <section className="mt-6">
        <StepLabel>
          III · {group ? `Which ${group.targetNoun}?` : "Who / Where?"}
        </StepLabel>
        {group ? (
          <TargetList
            targets={group.targets}
            caseIndex={caseIndex}
            selectedKey={target?.key ?? null}
            onSelect={setTarget}
          />
        ) : (
          <p className="text-muted text-sm italic px-1">
            Choose what happened above to see the list.
          </p>
        )}
      </section>

      {/* RESULT */}
      <section className="mt-7">
        {target && group ? (
          <ClueCard
            caseNum={caseNum}
            actionName={group.name}
            targetLabel={target.label}
            clueNumber={clueNumber}
            clue={clue}
          />
        ) : (
          <div className="rounded-md border border-dashed border-accent/30 py-8 text-center text-muted/60 italic">
            Make a selection above to reveal the clue.
          </div>
        )}
      </section>

      <footer className="mt-9 flex flex-col items-center gap-3">
        <Link
          href="/verify"
          className="inline-flex items-center gap-2 text-[11px] tracking-[0.14em] text-accent hover:text-accent-hover font-display uppercase"
        >
          <ClipboardCheck size={14} /> Verify / edit clue data
        </Link>
        <p className="font-display text-[11px] tracking-[0.18em] text-muted/40">
          <span className="text-accent">—</span> ALL ABOARD{" "}
          <span className="text-accent">—</span>
        </p>
      </footer>
    </main>
  );
}
