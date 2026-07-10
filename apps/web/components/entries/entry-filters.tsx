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
import {
  FolderFilterDropdown,
  LabelFilterDropdown,
} from "@/components/filters/entity-filter-dropdown";

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
      <FolderFilterDropdown
        value={filters.inbox ? "inbox" : (filters.folderId ?? "all")}
        onChange={(value) =>
          onFiltersChange({
            ...filters,
            folderId:
              value === "all" || value === "inbox" ? undefined : value,
            inbox: value === "inbox",
          })
        }
        folders={allFolders ?? []}
      />

      <LabelFilterDropdown
        value={filters.labelId ?? "all"}
        onChange={(value) =>
          onFiltersChange({
            ...filters,
            labelId: value === "all" ? undefined : value,
          })
        }
        labels={allLabels ?? []}
      />

      {/* Date range */}
      <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
        <PopoverTrigger
          className={cn(
            "inline-flex h-8 items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--card)] px-3 text-[0.8rem] font-medium text-[var(--muted-foreground)] transition-colors hover:border-[var(--terra-moss)]",
            currentPreset !== "all" &&
              "border-[var(--terra-moss)] bg-[var(--terra-moss)]/10 text-[var(--terra-moss)]",
          )}
        >
          <CalendarDays className="size-3.5 opacity-70" />
          <span>{dateLabel}</span>
        </PopoverTrigger>
        <PopoverContent className="w-auto rounded-xl p-0" align="start">
          <div className="flex flex-col">
            {/* Presets */}
            <div className="flex flex-col gap-0.5 border-b border-[var(--border)] p-2">
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
                      "flex items-center justify-between rounded-lg px-3 py-1.5 text-left text-sm text-[var(--terra-pine)] transition-colors hover:bg-[var(--muted)]",
                      currentPreset === preset &&
                        "bg-[var(--muted)] font-semibold text-[var(--terra-moss)]",
                    )}
                  >
                    {getDatePresetLabel(preset)}
                    {currentPreset === preset && (
                      <Check className="size-3.5 text-[var(--terra-moss)]" />
                    )}
                  </button>
                ),
              )}
            </div>

            {/* Calendar for custom range */}
            <div className="p-2">
              <p className="mb-1.5 px-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--terra-sage)]">
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
          "inline-flex h-8 items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--card)] px-3 text-[0.8rem] font-medium text-[var(--muted-foreground)] transition-colors hover:border-[var(--terra-moss)]",
          filters.inbox &&
            "border-[var(--terra-moss)] bg-[var(--terra-moss)]/10 text-[var(--terra-moss)]",
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
          className="gap-1 rounded-full text-[var(--terra-sage)] hover:text-[var(--terra-pine)]"
        >
          <X className="size-3" />
          Clear
        </Button>
      )}
    </div>
  );
}
