export default function Banner({ subtitle }: { subtitle: string }) {
  return (
    <header className="relative rounded-sm border-2 border-accent text-center px-3 pt-3.5 pb-3 shadow-[inset_0_0_0_4px_rgba(201,162,39,0.18)] bg-gradient-to-b from-oxblood/25 to-transparent">
      <span className="pointer-events-none absolute left-2.5 right-2.5 top-1.5 border-t border-accent/50" />
      <span className="pointer-events-none absolute left-2.5 right-2.5 bottom-1.5 border-t border-accent/50" />
      <p className="font-display text-[9px] tracking-[0.4em] text-accent-hover indent-[0.4em]">
        JUST GAMES
      </p>
      <h1 className="font-display text-2xl sm:text-3xl text-foreground leading-none my-1">
        MURDER <span className="text-accent-hover">on the</span> ORIENT EXPRESS
      </h1>
      <p className="font-display text-[9px] tracking-[0.28em] text-accent indent-[0.28em]">
        {subtitle}
      </p>
      <p className="text-accent tracking-[0.3em] text-[11px] mt-1.5 opacity-80">◆ ◆ ◆</p>
    </header>
  );
}
