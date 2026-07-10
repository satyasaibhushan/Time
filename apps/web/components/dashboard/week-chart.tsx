"use client";

import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { format, isToday } from "date-fns";

import { api } from "@convex/_generated/api";
import type { Doc, Id } from "@convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { effectiveLabelIds, entryDurationSeconds } from "@/lib/reporting";
import { useWholeSecondClock } from "@/lib/whole-second-clock";
import {
  FolderFilterDropdown,
  LabelFilterDropdown,
  type FolderFilterValue,
  type LabelFilterValue,
} from "@/components/filters/entity-filter-dropdown";

function startOfWeek(now: Date, weekStart: "monday" | "sunday"): Date {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const day = start.getDay();
  const offset = weekStart === "monday" ? (day + 6) % 7 : day;
  start.setDate(start.getDate() - offset);
  return start;
}

function formatHours(seconds: number): string {
  if (seconds === 0) return "0";
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  const hours = seconds / 3600;
  return `${hours >= 10 ? Math.round(hours) : hours.toFixed(1).replace(/\.0$/, "")}h`;
}

/** Folder IDs of `folderId` and every descendant. */
function collectSubtree(
  folderId: Id<"folders">,
  folders: Doc<"folders">[],
): Set<string> {
  const childrenOf = new Map<string, string[]>();
  for (const folder of folders) {
    if (!folder.parentFolderId) continue;
    const siblings = childrenOf.get(folder.parentFolderId) ?? [];
    siblings.push(folder._id);
    childrenOf.set(folder.parentFolderId, siblings);
  }

  const subtree = new Set<string>();
  const queue: string[] = [folderId];
  while (queue.length > 0) {
    const current = queue.pop() as string;
    if (subtree.has(current)) continue;
    subtree.add(current);
    queue.push(...(childrenOf.get(current) ?? []));
  }
  return subtree;
}

export function WeekChart({
  weekStart = "monday",
  className,
}: {
  weekStart?: "monday" | "sunday";
  className?: string;
}) {
  const [folderFilter, setFolderFilter] = useState<FolderFilterValue>("all");
  const [labelFilter, setLabelFilter] = useState<LabelFilterValue>("all");

  const weekStartDate = useMemo(
    () => startOfWeek(new Date(), weekStart),
    [weekStart],
  );
  const weekEnd = weekStartDate.getTime() + 7 * 24 * 60 * 60 * 1000;

  const entries = useQuery(api.timeEntries.listByDateRange, {
    startDate: weekStartDate.getTime(),
    endDate: weekEnd,
  });
  const folders = useQuery(api.folders.listAllFolders, {});
  const labels = useQuery(api.labels.listLabels, {});
  const clockNow = useWholeSecondClock(
    entries?.some((entry) => entry.status === "running") ?? false,
  );

  const days = useMemo(() => {
    const foldersById = new Map(
      (folders ?? []).map((folder) => [folder._id as string, folder]),
    );
    const subtree =
      folderFilter !== "all" && folderFilter !== "inbox"
        ? collectSubtree(folderFilter, folders ?? [])
        : null;

    const filtered = (entries ?? []).filter((entry) => {
      if (folderFilter === "inbox" && entry.folderId) return false;
      if (subtree && (!entry.folderId || !subtree.has(entry.folderId)))
        return false;
      if (
        labelFilter !== "all" &&
        !effectiveLabelIds(entry, foldersById).has(labelFilter)
      )
        return false;
      return true;
    });

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(weekStartDate);
      date.setDate(date.getDate() + index);
      const dayStart = date.getTime();
      const dayEnd = dayStart + 24 * 60 * 60 * 1000;
      const seconds = filtered
        .filter((entry) => entry.startedAt >= dayStart && entry.startedAt < dayEnd)
        .reduce(
          (sum, entry) => sum + entryDurationSeconds(entry, clockNow),
          0,
        );
      return { date, seconds };
    });
  }, [clockNow, entries, folders, folderFilter, labelFilter, weekStartDate]);

  const maxSeconds = Math.max(...days.map((day) => day.seconds), 1);
  const totalSeconds = days.reduce((sum, day) => sum + day.seconds, 0);
  const loading = entries === undefined;

  return (
    <section className={cn("surface-panel p-5 md:p-6", className)}>
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="page-kicker">This week</p>
          <p className="mt-1 text-lg font-bold tracking-[-0.01em] text-[var(--terra-pine)]">
            {formatHours(totalSeconds) === "0"
              ? "No time yet"
              : `${formatHours(totalSeconds)} tracked`}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <FolderFilterDropdown
            value={folderFilter}
            onChange={setFolderFilter}
            folders={folders ?? []}
            align="end"
          />
          <LabelFilterDropdown
            value={labelFilter}
            onChange={setLabelFilter}
            labels={labels ?? []}
            align="end"
          />
        </div>
      </div>

      <div
        className={cn(
          "mt-5 grid h-40 grid-cols-7 items-end gap-2.5 md:gap-3.5",
          loading && "animate-pulse opacity-40",
        )}
      >
        {days.map((day) => {
          const today = isToday(day.date);
          const heightPercent =
            day.seconds === 0 ? 0 : Math.max(6, (day.seconds / maxSeconds) * 100);

          return (
            <div
              key={day.date.getTime()}
              className="flex h-full flex-col items-center justify-end gap-1.5"
              title={`${format(day.date, "EEEE d MMM")}: ${formatHours(day.seconds)}`}
            >
              {day.seconds > 0 && (
                <span className="text-[10px] font-bold tabular-nums text-[var(--terra-sage)]">
                  {formatHours(day.seconds)}
                </span>
              )}
              <div
                className={cn(
                  "w-full max-w-9 rounded-t-lg transition-[height] duration-300",
                  today ? "bg-[var(--terra-clay)]" : "bg-[var(--terra-moss)]/75",
                  day.seconds === 0 &&
                    "h-1 rounded-full bg-[var(--input)]",
                )}
                style={
                  day.seconds > 0 ? { height: `${heightPercent}%` } : undefined
                }
              />
              <span
                className={cn(
                  "text-[11px] font-semibold",
                  today
                    ? "text-[var(--terra-clay)]"
                    : "text-[var(--terra-sage)]",
                )}
              >
                {format(day.date, "EEEEE")}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
