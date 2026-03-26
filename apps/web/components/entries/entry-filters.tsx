"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import {
  startOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  format,
} from "date-fns";
import {
  CalendarDays,
  FolderIcon,
  TagIcon,
  Inbox,
  X,
  Check,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface EntryFilters {
  folderId?: Id<"folders">;
  labelId?: Id<"labels">;
  startDate?: number;
  endDate?: number;
  inbox?: boolean;
}

interface EntryFiltersProps {
  filters: EntryFilters;
  onFiltersChange: (filters: EntryFilters) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type DatePreset = "today" | "week" | "month" | "all";

function getDatePresetLabel(preset: DatePreset): string {
  switch (preset) {
    case "today":
      return "Today";
    case "week":
      return "This Week";
    case "month":
      return "This Month";
    case "all":
      return "All Time";
  }
}

function getPresetRange(
  preset: Exclude<DatePreset, "all">,
): { start: number; end: number } {
  const now = new Date();
  switch (preset) {
    case "today":
      return {
        start: startOfDay(now).getTime(),
        end: Date.now(),
      };
    case "week":
      return {
        start: startOfWeek(now, { weekStartsOn: 1 }).getTime(),
        end: endOfWeek(now, { weekStartsOn: 1 }).getTime(),
      };
    case "month":
      return {
        start: startOfMonth(now).getTime(),
        end: endOfMonth(now).getTime(),
      };
  }
}

function detectPreset(filters: EntryFilters): DatePreset | "custom" {
  if (!filters.startDate && !filters.endDate) return "all";

  const now = new Date();
  const todayStart = startOfDay(now).getTime();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 }).getTime();
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 }).getTime();
  const monthStart = startOfMonth(now).getTime();
  const monthEnd = endOfMonth(now).getTime();

  if (filters.startDate === todayStart) return "today";
  if (filters.startDate === weekStart && filters.endDate === weekEnd) return "week";
  if (filters.startDate === monthStart && filters.endDate === monthEnd) return "month";

  return "custom";
}

function hasActiveFilters(filters: EntryFilters): boolean {
  return !!(
    filters.folderId ||
    filters.labelId ||
    filters.startDate ||
    filters.endDate ||
    filters.inbox
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function EntryFiltersBar({ filters, onFiltersChange }: EntryFiltersProps) {
  const allFolders = useQuery(api.folders.listAllFolders, {
    includeArchived: false,
  });
  const allLabels = useQuery(api.labels.listLabels, {});

  const [datePopoverOpen, setDatePopoverOpen] = useState(false);

  const currentPreset = useMemo(() => detectPreset(filters), [filters]);

  const dateLabel = useMemo(() => {
    if (currentPreset !== "custom") return getDatePresetLabel(currentPreset);
    if (filters.startDate && filters.endDate) {
      return `${format(new Date(filters.startDate), "MMM d")} \u2013 ${format(new Date(filters.endDate), "MMM d")}`;
    }
    if (filters.startDate) {
      return format(new Date(filters.startDate), "MMM d");
    }
    return "All Time";
  }, [currentPreset, filters.startDate, filters.endDate]);

  const customDateRange = useMemo(() => {
    if (!filters.startDate) return undefined;
    return {
      from: new Date(filters.startDate),
      to: filters.endDate ? new Date(filters.endDate) : undefined,
    };
  }, [filters.startDate, filters.endDate]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Folder filter */}
      <div className="relative">
        <FolderIcon className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-stone-500" />
        <select
          value={filters.folderId ?? "__all__"}
          onChange={(e) => {
            const val = e.target.value;
            onFiltersChange({
              ...filters,
              folderId: val === "__all__" ? undefined : (val as Id<"folders">),
              inbox: val === "__all__" ? filters.inbox : false,
            });
          }}
          className="h-7 appearance-none rounded-xl border border-stone-800/70 bg-stone-900/60 pl-7 pr-6 text-[0.8rem] text-stone-300 transition-colors hover:border-stone-700 hover:bg-stone-800/60 focus:border-amber-300/40 focus:outline-none"
        >
          <option value="__all__">All Folders</option>
          {allFolders?.map((folder) => (
            <option key={folder._id} value={folder._id}>
              {folder.name}
            </option>
          ))}
        </select>
      </div>

      {/* Label filter */}
      <div className="relative">
        <TagIcon className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-stone-500" />
        <select
          value={filters.labelId ?? "__all__"}
          onChange={(e) => {
            const val = e.target.value;
            onFiltersChange({
              ...filters,
              labelId: val === "__all__" ? undefined : (val as Id<"labels">),
            });
          }}
          className="h-7 appearance-none rounded-xl border border-stone-800/70 bg-stone-900/60 pl-7 pr-6 text-[0.8rem] text-stone-300 transition-colors hover:border-stone-700 hover:bg-stone-800/60 focus:border-amber-300/40 focus:outline-none"
        >
          <option value="__all__">All Labels</option>
          {allLabels?.map((label) => (
            <option key={label._id} value={label._id}>
              {label.name}
            </option>
          ))}
        </select>
      </div>

      {/* Date range */}
      <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
        <PopoverTrigger
          className={cn(
            "inline-flex h-7 items-center gap-1.5 rounded-xl border border-stone-800/70 bg-stone-900/60 px-2.5 text-[0.8rem] text-stone-300 transition-colors hover:border-stone-700 hover:bg-stone-800/60",
            currentPreset !== "all" && "border-amber-300/30 text-amber-300",
          )}
        >
          <CalendarDays className="size-3.5 text-stone-500" />
          <span>{dateLabel}</span>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto rounded-xl border-stone-800/70 bg-stone-900 p-0"
          align="start"
        >
          <div className="flex flex-col">
            {/* Presets */}
            <div className="flex flex-col gap-0.5 border-b border-stone-800/70 p-2">
              {(["today", "week", "month", "all"] as DatePreset[]).map(
                (preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      if (preset === "all") {
                        onFiltersChange({
                          ...filters,
                          startDate: undefined,
                          endDate: undefined,
                        });
                      } else {
                        const range = getPresetRange(preset);
                        onFiltersChange({
                          ...filters,
                          startDate: range.start,
                          endDate: range.end,
                        });
                      }
                      setDatePopoverOpen(false);
                    }}
                    className={cn(
                      "flex items-center justify-between rounded-lg px-3 py-1.5 text-left text-sm text-stone-300 transition-colors hover:bg-stone-800/60",
                      currentPreset === preset &&
                        "bg-stone-800/60 text-amber-300",
                    )}
                  >
                    {getDatePresetLabel(preset)}
                    {currentPreset === preset && (
                      <Check className="size-3.5 text-amber-300" />
                    )}
                  </button>
                ),
              )}
            </div>

            {/* Calendar for custom range */}
            <div className="p-2">
              <p className="mb-1.5 px-1 text-[11px] uppercase tracking-[0.28em] text-stone-500">
                Custom Range
              </p>
              <Calendar
                mode="range"
                selected={customDateRange}
                onSelect={(range) => {
                  if (range) {
                    onFiltersChange({
                      ...filters,
                      startDate: range.from
                        ? startOfDay(range.from).getTime()
                        : undefined,
                      endDate: range.to
                        ? startOfDay(range.to).getTime() + 86400000 - 1
                        : range.from
                          ? startOfDay(range.from).getTime() + 86400000 - 1
                          : undefined,
                    });
                  }
                }}
                numberOfMonths={1}
                className="rounded-lg"
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Inbox toggle */}
      <button
        type="button"
        onClick={() =>
          onFiltersChange({
            ...filters,
            inbox: !filters.inbox,
            folderId: !filters.inbox ? undefined : filters.folderId,
          })
        }
        className={cn(
          "inline-flex h-7 items-center gap-1.5 rounded-xl border border-stone-800/70 bg-stone-900/60 px-2.5 text-[0.8rem] text-stone-300 transition-colors hover:border-stone-700 hover:bg-stone-800/60",
          filters.inbox && "border-amber-300/30 bg-amber-300/5 text-amber-300",
        )}
      >
        <Inbox className="size-3.5" />
        Inbox
      </button>

      {/* Clear all */}
      {hasActiveFilters(filters) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onFiltersChange({})}
          className="gap-1 text-stone-500 hover:text-stone-300"
        >
          <X className="size-3" />
          Clear
        </Button>
      )}
    </div>
  );
}
