"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id, Doc } from "@convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { LoadingState, EmptyState } from "@/components/states";
import { FolderDialog } from "./folder-dialog";
import { FolderMoveDialog } from "./folder-move-dialog";
import { FolderLabelsDialog } from "./folder-labels-dialog";
import { FolderDeleteDialog } from "./folder-delete-dialog";
import {
  ChevronRight,
  MoreHorizontal,
  Inbox,
  Pencil,
  FolderInput,
  Tags,
  Archive,
  ArchiveRestore,
  Trash2,
  FolderPlus,
  Plus,
  FolderIcon,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type FolderDoc = Doc<"folders">;
type SortBy = "manual" | "createdAt" | "updatedAt";

// ---------------------------------------------------------------------------
// FolderTree (root component)
// ---------------------------------------------------------------------------

export function FolderTree({
  onSelectFolder,
  selectedFolderId,
  className,
}: {
  onSelectFolder?: (folderId: Id<"folders"> | "inbox" | null) => void;
  selectedFolderId?: Id<"folders"> | "inbox" | null;
  className?: string;
}) {
  const [includeArchived, setIncludeArchived] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>("manual");
  const [createOpen, setCreateOpen] = useState(false);

  const rootFolders = useQuery(api.folders.listRootFolders, {
    includeArchived,
    sortBy,
  });

  const isInboxSelected = selectedFolderId === "inbox";

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {/* Header row */}
      <div className="flex items-center justify-between px-2 pb-2">
        <span className="text-[11px] uppercase tracking-[0.28em] text-stone-500">
          Folders
        </span>
        <div className="flex items-center gap-1">
          {/* Sort selector */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="text-stone-400 hover:text-stone-300"
                />
              }
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 4h12M4 8h8M6 12h4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={4}>
              <DropdownMenuItem onClick={() => setSortBy("manual")}>
                <span className={cn(sortBy === "manual" && "text-amber-300")}>
                  Manual order
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("createdAt")}>
                <span
                  className={cn(sortBy === "createdAt" && "text-amber-300")}
                >
                  Date created
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("updatedAt")}>
                <span
                  className={cn(sortBy === "updatedAt" && "text-amber-300")}
                >
                  Last updated
                </span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setIncludeArchived((prev) => !prev)}
              >
                <Archive className="size-3.5" />
                <span>
                  {includeArchived ? "Hide archived" : "Show archived"}
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Create folder */}
          <Button
            variant="ghost"
            size="icon-xs"
            className="text-stone-400 hover:text-stone-300"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Inbox (virtual) */}
      <button
        type="button"
        onClick={() => onSelectFolder?.("inbox")}
        className={cn(
          "group flex items-center gap-2.5 rounded-2xl border px-3 py-2.5 text-left transition-colors",
          isInboxSelected
            ? "border-amber-300/20 bg-amber-300/[0.08] text-amber-200"
            : "border-transparent text-stone-300 hover:bg-stone-900/60"
        )}
      >
        <div
          className={cn(
            "flex size-6 items-center justify-center rounded-lg",
            isInboxSelected
              ? "bg-amber-300/15 text-amber-300"
              : "bg-stone-800/60 text-stone-500"
          )}
        >
          <Inbox className="size-3.5" />
        </div>
        <span className="text-sm font-medium">Inbox</span>
      </button>

      {/* Folder list */}
      {rootFolders === undefined ? (
        <LoadingState message="Loading folders..." className="py-8" />
      ) : rootFolders.length === 0 ? (
        <EmptyState
          icon={FolderIcon}
          title="No folders yet"
          description="Create a folder to organize your time entries"
          action={{ label: "New folder", onClick: () => setCreateOpen(true) }}
          className="mx-1 mt-2"
        />
      ) : (
        <div className="flex flex-col gap-0.5">
          {rootFolders.map((folder) => (
            <FolderNode
              key={folder._id}
              folder={folder}
              depth={0}
              includeArchived={includeArchived}
              sortBy={sortBy}
              onSelectFolder={onSelectFolder}
              selectedFolderId={selectedFolderId}
            />
          ))}
        </div>
      )}

      {/* Create dialog */}
      <FolderDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        mode="create"
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// FolderNode (recursive)
// ---------------------------------------------------------------------------

function FolderNode({
  folder,
  depth,
  includeArchived,
  sortBy,
  onSelectFolder,
  selectedFolderId,
}: {
  folder: FolderDoc;
  depth: number;
  includeArchived: boolean;
  sortBy: SortBy;
  onSelectFolder?: (folderId: Id<"folders"> | "inbox" | null) => void;
  selectedFolderId?: Id<"folders"> | "inbox" | null;
}) {
  const [expanded, setExpanded] = useState(false);

  // Dialogs
  const [renameOpen, setRenameOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);
  const [labelsOpen, setLabelsOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [createChildOpen, setCreateChildOpen] = useState(false);

  const archiveFolder = useMutation(api.folders.archiveFolder);
  const unarchiveFolder = useMutation(api.folders.unarchiveFolder);

  // Only query children when expanded
  const children = useQuery(
    api.folders.listChildFolders,
    expanded
      ? { parentFolderId: folder._id, includeArchived, sortBy }
      : "skip"
  );

  const childCount =
    children !== undefined && children !== null ? children.length : 0;
  const isSelected = selectedFolderId === folder._id;

  const handleToggle = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setExpanded((prev) => !prev);
    },
    []
  );

  const handleSelect = useCallback(() => {
    onSelectFolder?.(folder._id);
  }, [folder._id, onSelectFolder]);

  const handleArchiveToggle = useCallback(async () => {
    if (folder.archived) {
      await unarchiveFolder({ folderId: folder._id });
    } else {
      await archiveFolder({ folderId: folder._id });
    }
  }, [folder._id, folder.archived, archiveFolder, unarchiveFolder]);

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={handleSelect}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleSelect();
          }
        }}
        className={cn(
          "group flex items-center gap-1 rounded-2xl border px-2 py-2 text-left transition-colors",
          isSelected
            ? "border-stone-700/60 bg-stone-900/80 text-stone-100"
            : "border-transparent text-stone-300 hover:bg-stone-900/50"
        )}
        style={{ paddingLeft: `${depth * 20 + 8}px` }}
      >
        {/* Expand/collapse chevron */}
        <button
          type="button"
          onClick={handleToggle}
          className={cn(
            "flex size-5 shrink-0 items-center justify-center rounded-md text-stone-400 transition-transform hover:text-stone-300",
            expanded && "rotate-90"
          )}
        >
          <ChevronRight className="size-3.5" />
        </button>

        {/* Color dot */}
        <span
          className="size-2.5 shrink-0 rounded-full"
          style={{
            backgroundColor: folder.color ?? "#E6A23C",
          }}
        />

        {/* Folder name */}
        <span className="flex-1 truncate text-sm font-medium">
          {folder.name}
        </span>

        {/* Archived badge */}
        {folder.archived && (
          <span className="shrink-0 rounded-md bg-stone-800/80 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-stone-500">
            Archived
          </span>
        )}

        {/* Child count */}
        {expanded && childCount > 0 && (
          <span className="shrink-0 text-[11px] tabular-nums text-stone-500">
            {childCount}
          </span>
        )}

        {/* Actions dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-xs"
                className="shrink-0 text-stone-400 opacity-0 transition-opacity group-hover:opacity-100 data-popup-open:opacity-100"
              />
            }
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="size-3.5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={4}>
            <DropdownMenuItem onClick={() => setRenameOpen(true)}>
              <Pencil className="size-3.5" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setMoveOpen(true)}>
              <FolderInput className="size-3.5" />
              Move
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLabelsOpen(true)}>
              <Tags className="size-3.5" />
              Manage labels
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setCreateChildOpen(true)}>
              <FolderPlus className="size-3.5" />
              New subfolder
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleArchiveToggle}>
              {folder.archived ? (
                <>
                  <ArchiveRestore className="size-3.5" />
                  Unarchive
                </>
              ) : (
                <>
                  <Archive className="size-3.5" />
                  Archive
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="size-3.5" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Children (recursive) */}
      {expanded && children && children.length > 0 && (
        <div className="flex flex-col gap-0.5">
          {children.map((child) => (
            <FolderNode
              key={child._id}
              folder={child}
              depth={depth + 1}
              includeArchived={includeArchived}
              sortBy={sortBy}
              onSelectFolder={onSelectFolder}
              selectedFolderId={selectedFolderId}
            />
          ))}
        </div>
      )}

      {/* Expanded but loading children */}
      {expanded && children === undefined && (
        <div
          className="py-2 text-center text-xs text-stone-500"
          style={{ paddingLeft: `${(depth + 1) * 20 + 8}px` }}
        >
          Loading...
        </div>
      )}

      {/* Dialogs */}
      <FolderDialog
        open={renameOpen}
        onOpenChange={setRenameOpen}
        mode="rename"
        folder={folder}
      />
      <FolderMoveDialog
        open={moveOpen}
        onOpenChange={setMoveOpen}
        folder={folder}
      />
      <FolderLabelsDialog
        open={labelsOpen}
        onOpenChange={setLabelsOpen}
        folder={folder}
      />
      <FolderDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        folder={folder}
      />
      <FolderDialog
        open={createChildOpen}
        onOpenChange={setCreateChildOpen}
        mode="create"
        parentFolderId={folder._id}
      />
    </>
  );
}
