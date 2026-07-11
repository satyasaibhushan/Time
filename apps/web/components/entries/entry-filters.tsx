"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { Search, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getEntryDateRange,
  type EntryDatePreset,
} from "@/lib/entry-date-range";
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
  searchText?: string;
  datePreset?: EntryDatePreset;
}

interface EntryFiltersProps {
  filters: EntryFilters;
  onFiltersChange: (filters: EntryFilters) => void;
}

const DATE_PRESETS = [
  ["today", "Today"],
  ["week", "Week"],
  ["month", "Month"],
  ["all", "All"],
] as const satisfies readonly (readonly [EntryDatePreset, string])[];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function hasActiveFilters(filters: EntryFilters): boolean {
  return !!(
    filters.folderId ||
    filters.labelId ||
    filters.inbox ||
    filters.searchText?.trim()
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

  const currentPreset = filters.datePreset ?? "all";

  return (
    <div className="grid gap-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[var(--terra-sage)]" />
        <Input
          aria-label="Search entries"
          value={filters.searchText ?? ""}
          onChange={(event) =>
            onFiltersChange({
              ...filters,
              searchText: event.target.value || undefined,
            })
          }
          placeholder="Search entries"
          className="h-11 rounded-2xl border-transparent bg-[var(--muted)] pl-10 text-sm shadow-none placeholder:text-[var(--terra-sage)] focus-visible:border-[var(--terra-moss)] focus-visible:ring-0"
        />
      </div>

      <div
        aria-label="Entry date range"
        className="grid grid-cols-4 gap-1 rounded-2xl bg-[var(--muted)] p-1"
        role="group"
      >
        {DATE_PRESETS.map(([preset, label]) => (
          <button
            key={preset}
            type="button"
            aria-pressed={currentPreset === preset}
            onClick={() => {
              const range = getEntryDateRange(preset);
              onFiltersChange({
                ...filters,
                datePreset: preset,
                startDate: range.startDate,
                endDate: range.endDate,
              });
            }}
            className={cn(
              "rounded-xl px-3 py-2 text-sm font-semibold text-[var(--terra-sage)] transition-all hover:text-[var(--terra-pine)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--terra-moss)]/35",
              currentPreset === preset &&
                "bg-[var(--card)] text-[var(--terra-pine)] shadow-[0_1px_4px_rgba(34,58,46,0.12)]",
            )}
          >
            {label}
          </button>
        ))}
      </div>

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
          allLabel="Folders"
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
          allLabel="Labels"
        />

        {hasActiveFilters(filters) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              onFiltersChange({
                datePreset: currentPreset,
                ...getEntryDateRange(currentPreset),
              })
            }
            className="ml-auto gap-1 rounded-full text-[var(--terra-clay)] hover:text-[var(--terra-clay)]"
          >
            <X className="size-3" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
