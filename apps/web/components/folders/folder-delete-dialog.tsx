"use client";

import { useState, useEffect, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Doc } from "@convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2 } from "lucide-react";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

type FolderDeleteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folder: Doc<"folders">;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function FolderDeleteDialog({
  open,
  onOpenChange,
  folder,
}: FolderDeleteDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const deleteFolder = useMutation(api.folders.deleteFolder);

  useEffect(() => {
    if (open) {
      setSubmitting(false);
    }
  }, [open]);

  const handleDelete = useCallback(async () => {
    setSubmitting(true);
    try {
      await deleteFolder({ folderId: folder._id });
      onOpenChange(false);
    } catch {
      // Error handled by Convex
    } finally {
      setSubmitting(false);
    }
  }, [folder._id, deleteFolder, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-xl bg-[var(--destructive)]/10 text-[var(--destructive)]">
              <AlertTriangle className="size-4" />
            </div>
            Delete folder
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-medium text-[var(--terra-pine)]">{folder.name}</span>?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-3 rounded-2xl border border-[var(--border)] bg-[var(--muted)]/60 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--terra-sage)]">
            What will happen
          </p>
          <ul className="mt-3 flex flex-col gap-2 text-sm text-[var(--terra-sage)]">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[var(--terra-sage)]" />
              <span>
                Child folders will be moved to the{" "}
                <span className="text-[var(--terra-pine)]">root level</span>
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[var(--terra-sage)]" />
              <span>
                Time entries in this folder will be moved to{" "}
                <span className="text-[var(--terra-clay)]">Inbox</span>
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[var(--terra-sage)]" />
              <span>
                Default label assignments will be{" "}
                <span className="text-[var(--terra-pine)]">removed</span>
              </span>
            </li>
          </ul>
        </div>

        <DialogFooter className="mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={submitting}
            className="gap-1.5 rounded-full bg-[var(--destructive)] text-white hover:bg-[var(--destructive)]/90"
          >
            {submitting && <Loader2 className="size-3.5 animate-spin" />}
            Delete folder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
