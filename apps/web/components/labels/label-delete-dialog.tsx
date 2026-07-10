"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type LabelDoc = {
  _id: Id<"labels">;
  name: string;
  color: string;
};

interface LabelDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  label: LabelDoc;
}

export function LabelDeleteDialog({
  open,
  onOpenChange,
  label,
}: LabelDeleteDialogProps) {
  const deleteLabel = useMutation(api.labels.deleteLabel);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteLabel({ labelId: label._id });
      onOpenChange(false);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[var(--destructive)]">
            <AlertTriangle className="size-4" />
            Delete label
          </DialogTitle>
          <DialogDescription>
            This label will be removed from all folders and entries. This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--muted)] px-4 py-3">
          <span
            className="size-3 shrink-0 rounded-full"
            style={{ backgroundColor: label.color }}
          />
          <span className="text-sm font-medium text-[var(--terra-pine)]">
            {label.name}
          </span>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={deleting}
            onClick={handleDelete}
            className="rounded-full bg-[var(--destructive)] text-white hover:bg-[var(--destructive)]/90"
          >
            {deleting ? "Deleting..." : "Delete label"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
