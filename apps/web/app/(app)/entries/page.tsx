"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { EntriesList } from "@/components/entries/entries-list";
import type { TimeEntryDoc } from "@/components/entries/entry-card";
import {
  EntryFiltersBar,
  type EntryFilters,
} from "@/components/entries/entry-filters";
import { EntryDialog } from "@/components/entries/entry-dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function EntriesPage() {
  const [filters, setFilters] = useState<EntryFilters>({});
  const [createOpen, setCreateOpen] = useState(false);
  const [editEntry, setEditEntry] = useState<TimeEntryDoc | null>(null);

  const entries = useQuery(api.timeEntries.listWithFilters, {
    folderId: filters.folderId,
    labelId: filters.labelId,
    startDate: filters.startDate,
    endDate: filters.endDate,
    inbox: filters.inbox,
    status: "completed",
    limit: 100,
  });

  const allFolders = useQuery(api.folders.listAllFolders, {});
  const allLabels = useQuery(api.labels.listLabels, {});

  return (
    <section className="grid gap-6">
      {/* Header */}
      <div className="rounded-[2rem] border border-stone-800/70 bg-[linear-gradient(145deg,rgba(38,29,23,0.96),rgba(16,13,10,0.92))] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.32)] md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.32em] text-amber-200/70">
              Entries
            </p>
            <h1 className="mt-4 max-w-3xl font-serif text-4xl tracking-tight text-stone-50 md:text-5xl">
              Time log
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-400">
              Browse, filter, and edit your tracked time. Add manual entries for
              time you forgot to track.
            </p>
          </div>
          <Button
            onClick={() => setCreateOpen(true)}
            className="shrink-0 gap-2 rounded-xl bg-amber-300 text-stone-950 hover:bg-amber-200"
          >
            <Plus className="size-4" />
            Manual Entry
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-[1.8rem] border border-stone-800/70 bg-stone-950/72 px-5 py-4">
        <EntryFiltersBar filters={filters} onFiltersChange={setFilters} />
      </div>

      {/* Entries list */}
      <div className="rounded-[1.8rem] border border-stone-800/70 bg-stone-950/72 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.22)]">
        <EntriesList
          entries={entries ?? []}
          folders={allFolders ?? []}
          labels={allLabels ?? []}
          isLoading={entries === undefined}
          onEditEntry={(entry) => setEditEntry(entry)}
        />
      </div>

      {/* Create dialog */}
      <EntryDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        mode="create"
      />

      {/* Edit dialog */}
      {editEntry && (
        <EntryDialog
          open={!!editEntry}
          onOpenChange={(open) => {
            if (!open) setEditEntry(null);
          }}
          mode="edit"
          entry={editEntry}
        />
      )}
    </section>
  );
}
