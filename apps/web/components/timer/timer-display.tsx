"use client";

import { useEffect, useState } from "react";

import { formatDurationClock } from "@time/shared";
import { cn } from "@/lib/utils";

interface Segment {
  startTime: number;
  endTime?: number;
}

function computeElapsedSeconds(segments: Segment[]): number {
  const now = Date.now();
  let total = 0;

  for (const seg of segments) {
    const end = seg.endTime ?? now;
    total += Math.max(0, end - seg.startTime);
  }

  return Math.floor(total / 1000);
}

export function TimerDisplay({
  segments,
  status,
  className,
}: {
  segments: Segment[];
  status: "running" | "paused" | "completed";
  className?: string;
}) {
  const [elapsed, setElapsed] = useState(() => computeElapsedSeconds(segments));

  useEffect(() => {
    setElapsed(computeElapsedSeconds(segments));

    if (status !== "running") return;

    const interval = setInterval(() => {
      setElapsed(computeElapsedSeconds(segments));
    }, 1000);

    return () => clearInterval(interval);
  }, [segments, status]);

  return (
    <div
      className={cn(
        "relative select-none",
        status === "running" && "animate-pulse [animation-duration:3s]",
        className,
      )}
    >
      <span
        className="text-5xl font-semibold tracking-tight text-stone-50 tabular-nums md:text-6xl"
        aria-live="polite"
        aria-atomic
      >
        {formatDurationClock(elapsed, { includeSeconds: true })}
      </span>
    </div>
  );
}
