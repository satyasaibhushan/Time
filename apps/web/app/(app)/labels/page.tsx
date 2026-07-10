"use client";

import { useState } from "react";
import { LabelList } from "@/components/labels/label-list";
import { LabelDialog } from "@/components/labels/label-dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function LabelsPage() {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <section className="grid gap-6">
      {/* Header */}
      <div className="page-hero">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="page-kicker">Signal / labels</p>
            <h1 className="page-title">Mark what matters.</h1>
            <p className="page-subtitle">
              Reusable labels that can be set as folder defaults or added
              directly to entries. Folder defaults cascade through the hierarchy.
            </p>
          </div>
          <Button
            onClick={() => setCreateOpen(true)}
            className="signal-button shrink-0 gap-2"
          >
            <Plus className="size-4" />
            New Label
          </Button>
        </div>
      </div>

      {/* Label list */}
      <div className="surface-panel p-5 md:p-6">
        <LabelList />
      </div>

      {/* Create dialog */}
      <LabelDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        mode="create"
      />
    </section>
  );
}
