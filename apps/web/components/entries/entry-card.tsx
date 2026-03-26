"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { Play, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { formatDurationClock } from "@time/shared";
import { FOLDER_COLOR_TOKENS, LABEL_COLOR_TOKENS } from "@time/shared";
import { Button } from "@/components/ui/button";
import { EntryDeleteDialog } from "./entry-delete-dialog";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Segment {
  startTime: number;
  endTime?: number;
}

export interface TimeEntryDoc {
  _id: Id<"timeEntries">;
  title: string;
  notes?: string;
  folderId?: Id<"folders">;
  manualLabelIds: string[];
  status: string;
  segments: Segment[];
  startedAt: number;
  endedAt?: number;
  durationSeconds?: number;
  createdAt: number;
  updatedAt: number;
}

export interface FolderDoc {
  _id: Id<"folders">;
  name: string;
  color?: string;
}

export interface LabelDoc {
  _id: Id<"labels">;
  name: string;
  color: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getFolderColor(color?: string): string {
  if (!color) return FOLDER_COLOR_TOKENS[0].value;
  const token = FOLDER_COLOR_TOKENS.find((t) => t.id === color);
  return token?.value ?? color;
}

function getLabelColor(color: string): string {
  const token = LABEL_COLOR_TOKENS.find((t) => t.id === color);
  return token?.value ?? color;
}

function computeDuration(entry: TimeEntryDoc): number {
  if (entry.durationSeconds != null) return entry.durationSeconds;
  let total = 0;
  for (const seg of entry.segments) {
    const end = seg.endTime ?? Date.now();
    total += Math.max(0, end - seg.startTime);
  }
  return Math.floor(total / 1000);
}

function formatTimeRange(entry: TimeEntryDoc): string {
  const start = format(new Date(entry.startedAt), "h:mm a");
  if (entry.endedAt) {
    const end = format(new Date(entry.endedAt), "h:mm a");
    return `${start} \u2013 ${end}`;
  }
  return `${start} \u2013 now`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export interface EntryCardProps {
  entry: TimeEntryDoc;
  folders: FolderDoc[];
  labels: LabelDoc[];
  onEdit?: (entry: TimeEntryDoc) => void;
  compact?: boolean;
}

export function EntryCard({ entry, folders, labels, onEdit, compact }: EntryCardProps) {
  const continueEntry = useMutation(api.timeEntries.continueEntry);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [continuing, setContinuing] = useState(false);

  const folder = entry.folderId
    ? folders.find((f) => f._id === entry.folderId)
    : undefined;

  const entryLabels = labels.filter((l) =>
    entry.manualLabelIds.includes(l._id),
  );

  const duration = computeDuration(entry);
  const isRunning = entry.status === "running";

  async function handleContinue() {
    setContinuing(true);
    try {
      await continueEntry({ sourceEntryId: entry._id });
    } finally {
      setContinuing(false);
    }
  }

  return (
    <>
      <div
        className={cn(
          "group flex items-center gap-3 rounded-2xl border border-stone-800/70 bg-stone-900/40 px-4 py-3 transition-colors hover:border-stone-700/80 hover:bg-stone-900/70",
          isRunning && "border-amber-300/20 bg-amber-300/[0.03]",
        )}
      >
        {/* Title + metadata */}
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "truncate text-sm font-medium text-stone-200",
                !entry.title && "italic text-stone-500",
              )}
            >
              {entry.title || "Untitled"}
            </span>

            {isRunning && (
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-300/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-amber-300">
                <span className="size-1.5 animate-pulse rounded-full bg-amber-300" />
                Running
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
            <span className="tabular-nums">{formatTimeRange(entry)}</span>

            {folder && (
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: getFolderColor(folder.color) }}
                />
                <span className="text-stone-400">{folder.name}</span>
              </span>
            )}

            {entryLabels.map((label) => (
              <span
                key={label._id}
                className="inline-flex items-center gap-1 rounded-md bg-stone-800/60 px-1.5 py-0.5 text-[11px] text-stone-400"
              >
                <span
                  className="size-1.5 rounded-full"
                  style={{ backgroundColor: getLabelColor(label.color) }}
                />
                {label.name}
              </span>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div className="shrink-0 text-right">
          <span
            className={cn(
              "text-sm font-medium tabular-nums text-stone-300",
              isRunning && "text-amber-300",
            )}
          >
            {formatDurationClock(duration)}
          </span>
        </div>

        {/* Actions — visible on hover */}
        <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={handleContinue}
            disabled={continuing || isRunning}
            className="text-stone-500 hover:text-amber-300"
            title="Continue entry"
          >
            <Play className="size-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => onEdit?.(entry)}
            className="text-stone-500 hover:text-stone-200"
            title="Edit entry"
          >
            <Pencil className="size-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setDeleteOpen(true)}
            className="text-stone-500 hover:text-red-400"
            title="Delete entry"
          >
            <Trash2 className="size-3" />
          </Button>
        </div>
      </div>

      <EntryDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        entry={entry}
      />
    </>
  );
}
