"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { AlertTriangle } from "lucide-react";

import { formatDurationClock } from "@time/shared";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { TimeEntryDoc } from "./entry-card";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function computeDuration(entry: TimeEntryDoc): number {
  if (entry.durationSeconds != null) return entry.durationSeconds;
  let total = 0;
  for (const seg of entry.segments) {
    const end = seg.endTime ?? Date.now();
    total += Math.max(0, end - seg.startTime);
  }
  return Math.floor(total / 1000);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface EntryDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: TimeEntryDoc;
}

export function EntryDeleteDialog({
  open,
  onOpenChange,
  entry,
}: EntryDeleteDialogProps) {
  const deleteEntry = useMutation(api.timeEntries.deleteEntry);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteEntry({ entryId: entry._id });
      onOpenChange(false);
    } finally {
      setDeleting(false);
    }
  }

  const duration = computeDuration(entry);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-[1.8rem] border-stone-800/70 bg-stone-950 text-stone-100 sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-300">
            <AlertTriangle className="size-4" />
            Delete time entry
          </DialogTitle>
          <DialogDescription className="text-stone-400">
            This entry will be permanently removed. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between gap-3 rounded-2xl border border-stone-800/70 bg-stone-900/50 px-4 py-3">
          <span className="truncate text-sm font-medium text-stone-200">
            {entry.title || "Untitled"}
          </span>
          <span className="shrink-0 text-sm tabular-nums text-stone-400">
            {formatDurationClock(duration)}
          </span>
        </div>

        <DialogFooter className="border-stone-800/70 bg-stone-900/40">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl border-stone-700 bg-stone-950/80 text-stone-100 hover:bg-stone-800/80 hover:text-stone-50"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={deleting}
            onClick={handleDelete}
            className="rounded-xl border border-red-500/35 bg-red-950/45 text-red-100 hover:bg-red-950/65 hover:text-red-50"
          >
            {deleting ? "Deleting..." : "Delete entry"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
