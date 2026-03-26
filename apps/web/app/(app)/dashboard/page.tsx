"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { formatDurationClock } from "@time/shared";
import { TimerWidget } from "@/components/timer/timer-widget";
import { LoadingState } from "@/components/states";
import { EntryCard } from "@/components/entries/entry-card";
import { Clock, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  const recentEntries = useQuery(api.timeEntries.listRecent, { limit: 5 });
  const allFolders = useQuery(api.folders.listAllFolders, {});
  const allLabels = useQuery(api.labels.listLabels, {});

  // Compute today's total from recent entries (simple approximation)
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todaySeconds =
    recentEntries
      ?.filter((e) => e.startedAt >= todayStart.getTime() && e.durationSeconds)
      .reduce((sum, e) => sum + (e.durationSeconds ?? 0), 0) ?? 0;

  return (
    <section className="grid gap-6">
      {/* Header */}
      <div className="rounded-[2rem] border border-stone-800/70 bg-[linear-gradient(145deg,rgba(38,29,23,0.96),rgba(16,13,10,0.92))] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.32)] md:p-8">
        <p className="text-[11px] uppercase tracking-[0.32em] text-amber-200/70">
          Dashboard
        </p>
        <h1 className="mt-4 max-w-3xl font-serif text-4xl tracking-tight text-stone-50 md:text-5xl">
          What are you working on?
        </h1>
        <div className="mt-6 flex items-center gap-6">
          <div className="flex items-center gap-2 text-sm text-stone-400">
            <Clock className="size-4 text-stone-500" />
            <span>Today: {formatDurationClock(todaySeconds)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-stone-400">
            <TrendingUp className="size-4 text-stone-500" />
            <span>{recentEntries?.length ?? 0} recent entries</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* Timer Widget */}
        <TimerWidget />

        {/* Recent entries */}
        <div className="rounded-[1.8rem] border border-stone-800/70 bg-stone-950/72 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.22)]">
          <h2 className="text-[11px] uppercase tracking-[0.28em] text-stone-500">
            Recent Activity
          </h2>

          <div className="mt-4 flex flex-col gap-2">
            {recentEntries === undefined ? (
              <LoadingState message="Loading entries..." className="py-8" />
            ) : recentEntries.length === 0 ? (
              <div className="py-8 text-center text-sm text-stone-500">
                No entries yet. Start your first timer!
              </div>
            ) : (
              recentEntries.map((entry) => (
                <EntryCard
                  key={entry._id}
                  entry={entry}
                  folders={allFolders ?? []}
                  labels={allLabels ?? []}
                  compact
                />
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
