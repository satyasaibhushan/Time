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
            <div className="flex size-8 items-center justify-center rounded-xl bg-red-950/60 text-red-400">
              <AlertTriangle className="size-4" />
            </div>
            Delete folder
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-medium text-stone-200">{folder.name}</span>?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-3 rounded-2xl border border-stone-800/70 bg-stone-950/60 p-4">
          <p className="text-[11px] uppercase tracking-[0.28em] text-stone-500">
            What will happen
          </p>
          <ul className="mt-3 flex flex-col gap-2 text-sm text-stone-400">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-stone-600" />
              <span>
                Child folders will be moved to the{" "}
                <span className="text-stone-300">root level</span>
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-stone-600" />
              <span>
                Time entries in this folder will be moved to{" "}
                <span className="text-amber-200/80">Inbox</span>
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-stone-600" />
              <span>
                Default label assignments will be{" "}
                <span className="text-stone-300">removed</span>
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
            className="gap-1.5"
          >
            {submitting && <Loader2 className="size-3.5 animate-spin" />}
            Delete folder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
