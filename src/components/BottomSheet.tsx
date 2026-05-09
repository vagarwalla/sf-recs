"use client";

import { useRef, useState, useCallback, useEffect, ReactNode } from "react";

type SnapPoint = "peek" | "half" | "full";

const SNAP_HEIGHTS: Record<SnapPoint, string> = {
  peek: "180px",
  half: "50vh",
  full: "calc(100vh - 60px)",
};

interface BottomSheetProps {
  children: ReactNode;
  snap: SnapPoint;
  onSnapChange: (snap: SnapPoint) => void;
}

export default function BottomSheet({ children, snap, onSnapChange }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const startHeight = useRef(0);
  const [dragging, setDragging] = useState(false);
  const [dragHeight, setDragHeight] = useState<number | null>(null);

  const getSnapHeight = useCallback(() => {
    if (typeof window === "undefined") return 180;
    const map: Record<SnapPoint, number> = {
      peek: 180,
      half: window.innerHeight * 0.5,
      full: window.innerHeight - 60,
    };
    return map[snap];
  }, [snap]);

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      startY.current = e.touches[0].clientY;
      startHeight.current = sheetRef.current?.getBoundingClientRect().height ?? getSnapHeight();
      setDragging(true);
    },
    [getSnapHeight]
  );

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!dragging) return;
      const dy = startY.current - e.touches[0].clientY;
      const newHeight = Math.max(100, Math.min(window.innerHeight - 40, startHeight.current + dy));
      setDragHeight(newHeight);
    },
    [dragging]
  );

  const onTouchEnd = useCallback(() => {
    setDragging(false);
    if (dragHeight === null) return;

    const vh = window.innerHeight;
    let nearest: SnapPoint = "peek";
    if (dragHeight > vh * 0.7) nearest = "full";
    else if (dragHeight > vh * 0.3) nearest = "half";

    setDragHeight(null);
    onSnapChange(nearest);
  }, [dragHeight, onSnapChange]);

  useEffect(() => {
    setDragHeight(null);
  }, [snap]);

  return (
    <div
      ref={sheetRef}
      className="fixed bottom-0 left-0 right-0 z-40 bg-sheet-bg rounded-t-2xl shadow-2xl md:hidden"
      style={{
        height: dragHeight !== null ? `${dragHeight}px` : SNAP_HEIGHTS[snap],
        transition: dragging ? "none" : "height 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className="flex justify-center py-3 cursor-grab active:cursor-grabbing touch-none"
      >
        <div className="w-10 h-1 rounded-full bg-sheet-handle" />
      </div>
      <div
        className="overflow-y-auto px-4 pb-8"
        style={{
          height: "calc(100% - 28px)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
