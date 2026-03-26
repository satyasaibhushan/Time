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
      <div className="rounded-[2rem] border border-stone-800/70 bg-[linear-gradient(145deg,rgba(38,29,23,0.96),rgba(16,13,10,0.92))] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.32)] md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.32em] text-amber-200/70">
              Folders
            </p>
            <h1 className="mt-4 max-w-3xl font-serif text-4xl tracking-tight text-stone-50 md:text-5xl">
              Organize your time
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-400">
              One recursive hierarchy. Inbox at the root for uncategorized
              entries. Folders can have default labels that cascade to children.
            </p>
          </div>
          <Button
            onClick={() => setCreateOpen(true)}
            className="shrink-0 gap-2 rounded-xl bg-amber-300 text-stone-950 hover:bg-amber-200"
          >
            <Plus className="size-4" />
            New Folder
          </Button>
        </div>
      </div>

      {/* Folder tree */}
      <div className="rounded-[1.8rem] border border-stone-800/70 bg-stone-950/72 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.22)]">
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
