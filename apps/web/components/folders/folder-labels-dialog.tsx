"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id, Doc } from "@convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/states";
import { Check, Loader2, Tag } from "lucide-react";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

type FolderLabelsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folder: Doc<"folders">;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function FolderLabelsDialog({
  open,
  onOpenChange,
  folder,
}: FolderLabelsDialogProps) {
  const [selectedIds, setSelectedIds] = useState<Set<Id<"labels">>>(new Set());
  const [submitting, setSubmitting] = useState(false);

  const allLabels = useQuery(api.labels.listLabels, open ? {} : "skip");
  const inheritedLabels = useQuery(
    api.folders.getInheritedLabels,
    open ? { folderId: folder._id } : "skip"
  );
  const updateDefaultLabels = useMutation(api.folders.updateDefaultLabels);

  // inheritedLabels is Id<"labels">[] — build a Set for quick lookup
  const inheritedLabelIds = useMemo(() => {
    if (!inheritedLabels) return new Set<Id<"labels">>();
    return new Set(inheritedLabels);
  }, [inheritedLabels]);

  // Resolve inherited label docs from the full labels list
  const inheritedLabelDocs = useMemo(() => {
    if (!allLabels || !inheritedLabels) return [];
    return allLabels.filter((l) => inheritedLabelIds.has(l._id));
  }, [allLabels, inheritedLabels, inheritedLabelIds]);

  // Reset on open
  useEffect(() => {
    if (open) {
      setSelectedIds(new Set(folder.defaultLabelIds as Id<"labels">[]));
      setSubmitting(false);
    }
  }, [open, folder.defaultLabelIds]);

  const toggleLabel = useCallback((labelId: Id<"labels">) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(labelId)) {
        next.delete(labelId);
      } else {
        next.add(labelId);
      }
      return next;
    });
  }, []);

  const handleSave = useCallback(async () => {
    setSubmitting(true);
    try {
      await updateDefaultLabels({
        folderId: folder._id,
        defaultLabelIds: Array.from(selectedIds),
      });
      onOpenChange(false);
    } catch {
      // Error handled by Convex
    } finally {
      setSubmitting(false);
    }
  }, [folder._id, selectedIds, updateDefaultLabels, onOpenChange]);

  const isLoading = allLabels === undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Default labels</DialogTitle>
          <DialogDescription>
            Labels selected here will be automatically applied to new time
            entries created in{" "}
            <span className="font-medium text-stone-200">{folder.name}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-3 max-h-72 overflow-y-auto rounded-2xl border border-stone-800/70 bg-stone-950/60">
          {isLoading ? (
            <LoadingState message="Loading labels..." className="py-6" />
          ) : allLabels.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <Tag className="size-5 text-stone-500" />
              <p className="text-sm text-stone-400">No labels created yet</p>
            </div>
          ) : (
            <div className="flex flex-col gap-0.5 p-1.5">
              {/* Inherited labels (read-only) */}
              {inheritedLabelDocs.length > 0 &&
                inheritedLabelDocs.map((label) => (
                  <div
                    key={`inherited-${label._id}`}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-stone-500"
                  >
                    <span
                      className="size-2.5 shrink-0 rounded-full opacity-60"
                      style={{ backgroundColor: label.color }}
                    />
                    <span className="flex-1 truncate">{label.name}</span>
                    <span className="shrink-0 rounded-md bg-stone-800/60 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-stone-500">
                      Inherited
                    </span>
                  </div>
                ))}

              {/* Separator if inherited labels exist */}
              {inheritedLabelDocs.length > 0 && (
                <div className="mx-2 my-1 h-px bg-stone-800/50" />
              )}

              {/* All labels (checkable, excluding inherited) */}
              {allLabels
                .filter((label) => !inheritedLabelIds.has(label._id))
                .map((label) => {
                  const isChecked = selectedIds.has(label._id);
                  return (
                    <button
                      key={label._id}
                      type="button"
                      onClick={() => toggleLabel(label._id)}
                      className={cn(
                        "flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm transition-colors",
                        isChecked
                          ? "bg-stone-800/60 text-stone-100"
                          : "text-stone-400 hover:bg-stone-900/60 hover:text-stone-200"
                      )}
                    >
                      {/* Checkbox */}
                      <div
                        className={cn(
                          "flex size-4 shrink-0 items-center justify-center rounded border transition-colors",
                          isChecked
                            ? "border-amber-300/60 bg-amber-300/15"
                            : "border-stone-700 bg-stone-900/60"
                        )}
                      >
                        {isChecked && (
                          <Check className="size-2.5 text-amber-300" />
                        )}
                      </div>

                      {/* Color dot */}
                      <span
                        className="size-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: label.color }}
                      />

                      {/* Name */}
                      <span className="flex-1 truncate">{label.name}</span>
                    </button>
                  );
                })}
            </div>
          )}
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
            onClick={handleSave}
            disabled={submitting}
            className="gap-1.5"
          >
            {submitting && <Loader2 className="size-3.5 animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
