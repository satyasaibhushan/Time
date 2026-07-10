"use client";

import { useState } from "react";
import { usePaginatedQuery, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { EntriesList } from "@/components/entries/entries-list";
import type { TimeEntryDoc } from "@/components/entries/entry-card";
import {
  EntryFiltersBar,
  type EntryFilters,
} from "@/components/entries/entry-filters";
import { EntryDialog } from "@/components/entries/entry-dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";

export default function EntriesPage() {
  const [filters, setFilters] = useState<EntryFilters>({});
  const [createOpen, setCreateOpen] = useState(false);
  const [editEntry, setEditEntry] = useState<TimeEntryDoc | null>(null);

  const {
    results: entries,
    status: paginationStatus,
    loadMore,
  } = usePaginatedQuery(
    api.timeEntries.paginateWithFilters,
    {
      folderId: filters.folderId,
      labelId: filters.labelId,
      startDate: filters.startDate,
      endDate: filters.endDate,
      inbox: filters.inbox,
      status: "completed",
    },
    { initialNumItems: 30 },
  );

  const allFolders = useQuery(api.folders.listAllFolders, {});
  const allLabels = useQuery(api.labels.listLabels, {});

  return (
    <section className="grid gap-6">
      {/* Header */}
      <div className="page-hero">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="page-kicker">Archive / entries</p>
            <h1 className="page-title">The time ledger.</h1>
            <p className="page-subtitle">
              Browse, filter, and edit your tracked time. Add manual entries for
              time you forgot to track.
            </p>
          </div>
          <Button
            onClick={() => setCreateOpen(true)}
            className="signal-button shrink-0 gap-2"
          >
            <Plus className="size-4" />
            Manual Entry
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="surface-panel px-5 py-4">
        <EntryFiltersBar filters={filters} onFiltersChange={setFilters} />
      </div>

      {/* Entries list */}
      <div className="surface-panel p-5 md:p-6">
        <EntriesList
          entries={entries ?? []}
          folders={allFolders ?? []}
          labels={allLabels ?? []}
          isLoading={paginationStatus === "LoadingFirstPage"}
          onEditEntry={(entry) => setEditEntry(entry)}
        />
        {(paginationStatus === "CanLoadMore" ||
          paginationStatus === "LoadingMore") && (
          <div className="mt-6 flex justify-center">
            <Button
              variant="outline"
              className="rounded-full border-[var(--border)] px-6"
              disabled={paginationStatus === "LoadingMore"}
              onClick={() => loadMore(30)}
            >
              {paginationStatus === "LoadingMore" && (
                <Loader2 className="size-4 animate-spin" />
              )}
              {paginationStatus === "LoadingMore" ? "Loading…" : "Load more"}
            </Button>
          </div>
        )}
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
