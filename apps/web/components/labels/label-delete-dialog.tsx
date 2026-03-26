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
      <DialogContent className="rounded-[1.8rem] border-stone-800/70 bg-stone-950 text-stone-100 sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-300">
            <AlertTriangle className="size-4" />
            Delete label
          </DialogTitle>
          <DialogDescription className="text-stone-400">
            This label will be removed from all folders and entries. This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3 rounded-2xl border border-stone-800/70 bg-stone-900/50 px-4 py-3">
          <span
            className="size-3 shrink-0 rounded-full"
            style={{ backgroundColor: label.color }}
          />
          <span className="text-sm font-medium text-stone-200">
            {label.name}
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
            {deleting ? "Deleting..." : "Delete label"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
