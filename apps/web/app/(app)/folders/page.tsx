"use client";

import { useState } from "react";
import { FolderTree } from "@/components/folders/folder-tree";
import { FolderDialog } from "@/components/folders/folder-dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function FoldersPage() {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <section className="grid gap-6">
      {/* Header */}
      <div className="page-hero">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="page-kicker">Structure / folders</p>
            <h1 className="page-title">Give time a place.</h1>
            <p className="page-subtitle">
              One recursive hierarchy. Inbox at the root for uncategorized
              entries. Folders can have default labels that cascade to children.
            </p>
          </div>
          <Button
            onClick={() => setCreateOpen(true)}
            className="signal-button shrink-0 gap-2"
          >
            <Plus className="size-4" />
            New Folder
          </Button>
        </div>
      </div>

      {/* Folder tree */}
      <div className="surface-panel p-5 md:p-6">
        <FolderTree />
      </div>

      {/* Create dialog */}
      <FolderDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        mode="create"
      />
    </section>
  );
}
