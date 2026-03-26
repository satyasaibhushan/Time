"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { Pencil, Trash2, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { LoadingState, EmptyState } from "@/components/states";
import { Button } from "@/components/ui/button";
import { LabelDialog } from "@/components/labels/label-dialog";
import { LabelDeleteDialog } from "@/components/labels/label-delete-dialog";

type LabelDoc = {
  _id: Id<"labels">;
  userId: Id<"users">;
  name: string;
  color: string;
  createdAt: number;
  updatedAt: number;
};

export function LabelList() {
  const labels = useQuery(api.labels.listLabels, {});

  const [createOpen, setCreateOpen] = useState(false);
  const [editLabel, setEditLabel] = useState<LabelDoc | null>(null);
  const [deleteLabel, setDeleteLabel] = useState<LabelDoc | null>(null);

  if (labels === undefined) {
    return <LoadingState message="Loading labels..." />;
  }

  if (labels.length === 0) {
    return (
      <>
        <EmptyState
          icon={Tag}
          title="No labels yet"
          description="Create your first label to start organising your time entries."
          action={{
            label: "Create your first label",
            onClick: () => setCreateOpen(true),
          }}
        />
        <LabelDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          mode="create"
        />
      </>
    );
  }

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {labels.map((label) => (
          <div
            key={label._id}
            className={cn(
              "group flex items-center gap-3 rounded-2xl border border-stone-800/70 bg-stone-900/65 px-4 py-4",
              "transition-colors hover:border-stone-700/70 hover:bg-stone-900/80"
            )}
          >
            <span
              className="size-3 shrink-0 rounded-full"
              style={{ backgroundColor: label.color }}
            />
            <span className="flex-1 truncate text-sm font-medium text-stone-200">
              {label.name}
            </span>

            <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label={`Edit ${label.name}`}
                onClick={() => setEditLabel(label as LabelDoc)}
                className="text-stone-400 hover:text-stone-200"
              >
                <Pencil className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label={`Delete ${label.name}`}
                onClick={() => setDeleteLabel(label as LabelDoc)}
                className="text-stone-400 hover:text-red-400"
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit dialog */}
      <LabelDialog
        open={editLabel !== null}
        onOpenChange={(open) => {
          if (!open) setEditLabel(null);
        }}
        mode="edit"
        label={editLabel ?? undefined}
      />

      {/* Delete confirmation dialog */}
      {deleteLabel && (
        <LabelDeleteDialog
          open={deleteLabel !== null}
          onOpenChange={(open) => {
            if (!open) setDeleteLabel(null);
          }}
          label={deleteLabel}
        />
      )}
    </>
  );
}
