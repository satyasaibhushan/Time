import { v } from "convex/values";

import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";
import { getCurrentUserOrThrow } from "./helpers";

// ---------------------------------------------------------------------------
// Sort helpers
// ---------------------------------------------------------------------------

const sortOrderValidator = v.optional(
  v.union(v.literal("manual"), v.literal("createdAt"), v.literal("updatedAt")),
);

type SortOrder = "manual" | "createdAt" | "updatedAt";

function sortFolders(folders: Doc<"folders">[], sortBy: SortOrder = "manual"): Doc<"folders">[] {
  return [...folders].sort((a, b) => {
    switch (sortBy) {
      case "manual":
        return a.sortOrder - b.sortOrder;
      case "createdAt":
        return a.createdAt - b.createdAt;
      case "updatedAt":
        return b.updatedAt - a.updatedAt; // newest first
      default:
        return a.sortOrder - b.sortOrder;
    }
  });
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Get the next sortOrder value among siblings. */
async function getNextSortOrder(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
  parentFolderId?: Id<"folders">,
): Promise<number> {
  const siblings = await ctx.db
    .query("folders")
    .withIndex("by_user_parent_folder", (q) => {
      const base = q.eq("userId", userId);
      return parentFolderId === undefined
        ? base.eq("parentFolderId", undefined)
        : base.eq("parentFolderId", parentFolderId);
    })
    .collect();

  if (siblings.length === 0) return 0;

  return Math.max(...siblings.map((f) => f.sortOrder)) + 1;
}

/** Get a folder and verify it belongs to the given user. */
async function getUserFolder(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
  folderId: Id<"folders">,
): Promise<Doc<"folders">> {
  const folder = await ctx.db.get(folderId);

  if (!folder || folder.userId !== userId) {
    throw new Error("Folder not found");
  }

  return folder;
}

/**
 * Collect all descendant folder IDs recursively.
 * Used for archive cascading and circular-reference checks.
 */
async function getDescendantIds(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
  folderId: Id<"folders">,
): Promise<Id<"folders">[]> {
  const children = await ctx.db
    .query("folders")
    .withIndex("by_user_parent_folder", (q) =>
      q.eq("userId", userId).eq("parentFolderId", folderId),
    )
    .collect();

  const ids: Id<"folders">[] = [];

  for (const child of children) {
    ids.push(child._id);
    const grandchildren = await getDescendantIds(ctx, userId, child._id);
    ids.push(...grandchildren);
  }

  return ids;
}

/**
 * Walk up the folder ancestry and collect all defaultLabelIds.
 * Returns a deduplicated array of label IDs from root → target folder.
 */
async function resolveInheritedLabelIds(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
  folderId: Id<"folders">,
): Promise<Id<"labels">[]> {
  const labelIdSet = new Set<string>();
  let currentId: Id<"folders"> | undefined = folderId;

  while (currentId) {
    const folder = await getUserFolder(ctx, userId, currentId);
    for (const labelId of folder.defaultLabelIds) {
      labelIdSet.add(labelId as string);
    }
    currentId = folder.parentFolderId;
  }

  return [...labelIdSet] as Id<"labels">[];
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** List root-level folders (no parent). */
export const listRootFolders = query({
  args: {
    includeArchived: v.optional(v.boolean()),
    sortBy: sortOrderValidator,
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    let folders = await ctx.db
      .query("folders")
      .withIndex("by_user_parent_folder", (q) =>
        q.eq("userId", user._id).eq("parentFolderId", undefined),
      )
      .collect();

    if (!args.includeArchived) {
      folders = folders.filter((f) => !f.archived);
    }

    return sortFolders(folders, args.sortBy);
  },
});

/** List child folders under a specific parent. */
export const listChildFolders = query({
  args: {
    parentFolderId: v.id("folders"),
    includeArchived: v.optional(v.boolean()),
    sortBy: sortOrderValidator,
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    let folders = await ctx.db
      .query("folders")
      .withIndex("by_user_parent_folder", (q) =>
        q.eq("userId", user._id).eq("parentFolderId", args.parentFolderId),
      )
      .collect();

    if (!args.includeArchived) {
      folders = folders.filter((f) => !f.archived);
    }

    return sortFolders(folders, args.sortBy);
  },
});

/** List all folders for the current user (flat list, for pickers etc.). */
export const listAllFolders = query({
  args: {
    includeArchived: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    let folders = await ctx.db
      .query("folders")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    if (!args.includeArchived) {
      folders = folders.filter((f) => !f.archived);
    }

    return folders;
  },
});

/** Resolve all inherited label IDs for a folder (walking up the ancestry). */
export const getInheritedLabels = query({
  args: {
    folderId: v.id("folders"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    return await resolveInheritedLabelIds(ctx, user._id, args.folderId);
  },
});

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/** Create a new folder. */
export const createFolder = mutation({
  args: {
    name: v.string(),
    color: v.optional(v.string()),
    parentFolderId: v.optional(v.id("folders")),
    defaultLabelIds: v.optional(v.array(v.id("labels"))),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    // Validate parent exists and belongs to user
    if (args.parentFolderId) {
      await getUserFolder(ctx, user._id, args.parentFolderId);
    }

    const now = Date.now();
    const sortOrder = await getNextSortOrder(ctx, user._id, args.parentFolderId);

    return await ctx.db.insert("folders", {
      userId: user._id,
      name: args.name,
      color: args.color,
      parentFolderId: args.parentFolderId,
      defaultLabelIds: args.defaultLabelIds ?? [],
      archived: false,
      sortOrder,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/** Rename a folder. */
export const renameFolder = mutation({
  args: {
    folderId: v.id("folders"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    await getUserFolder(ctx, user._id, args.folderId);

    await ctx.db.patch(args.folderId, {
      name: args.name,
      updatedAt: Date.now(),
    });

    return args.folderId;
  },
});

/** Move a folder under a new parent (or to root if parentFolderId is omitted). */
export const moveFolder = mutation({
  args: {
    folderId: v.id("folders"),
    newParentFolderId: v.optional(v.id("folders")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const folder = await getUserFolder(ctx, user._id, args.folderId);

    // Can't move a folder under itself
    if (args.newParentFolderId === args.folderId) {
      throw new Error("Cannot move a folder under itself");
    }

    // Validate new parent exists and belongs to user
    if (args.newParentFolderId) {
      await getUserFolder(ctx, user._id, args.newParentFolderId);

      // Prevent circular references: new parent must not be a descendant
      const descendantIds = await getDescendantIds(ctx, user._id, args.folderId);
      if (descendantIds.includes(args.newParentFolderId)) {
        throw new Error("Cannot move a folder under one of its own descendants");
      }
    }

    const sortOrder = await getNextSortOrder(ctx, user._id, args.newParentFolderId);

    await ctx.db.patch(args.folderId, {
      parentFolderId: args.newParentFolderId,
      sortOrder,
      updatedAt: Date.now(),
    });

    return folder._id;
  },
});

/** Update the default labels on a folder. */
export const updateDefaultLabels = mutation({
  args: {
    folderId: v.id("folders"),
    defaultLabelIds: v.array(v.id("labels")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    await getUserFolder(ctx, user._id, args.folderId);

    // Validate all label IDs belong to user
    for (const labelId of args.defaultLabelIds) {
      const label = await ctx.db.get(labelId);
      if (!label || label.userId !== user._id) {
        throw new Error(`Label not found: ${labelId}`);
      }
    }

    await ctx.db.patch(args.folderId, {
      defaultLabelIds: args.defaultLabelIds,
      updatedAt: Date.now(),
    });

    return args.folderId;
  },
});

/** Archive a folder and all its descendants recursively. */
export const archiveFolder = mutation({
  args: {
    folderId: v.id("folders"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    await getUserFolder(ctx, user._id, args.folderId);

    const descendantIds = await getDescendantIds(ctx, user._id, args.folderId);
    const allIds = [args.folderId, ...descendantIds];
    const now = Date.now();

    for (const id of allIds) {
      await ctx.db.patch(id, { archived: true, updatedAt: now });
    }

    return args.folderId;
  },
});

/** Unarchive a single folder (does not cascade to descendants). */
export const unarchiveFolder = mutation({
  args: {
    folderId: v.id("folders"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    await getUserFolder(ctx, user._id, args.folderId);

    await ctx.db.patch(args.folderId, {
      archived: false,
      updatedAt: Date.now(),
    });

    return args.folderId;
  },
});

/**
 * Delete a folder.
 * - Direct child folders are moved to root (parentFolderId → undefined)
 * - Time entries in this folder are moved to Inbox (folderId → undefined)
 * - The folder row is deleted
 * - History is preserved (no entries are deleted)
 */
export const deleteFolder = mutation({
  args: {
    folderId: v.id("folders"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    await getUserFolder(ctx, user._id, args.folderId);

    const now = Date.now();

    // 1. Move direct child folders to root
    const children = await ctx.db
      .query("folders")
      .withIndex("by_user_parent_folder", (q) =>
        q.eq("userId", user._id).eq("parentFolderId", args.folderId),
      )
      .collect();

    for (const child of children) {
      const sortOrder = await getNextSortOrder(ctx, user._id, undefined);
      await ctx.db.patch(child._id, {
        parentFolderId: undefined,
        sortOrder,
        updatedAt: now,
      });
    }

    // 2. Move time entries in this folder to Inbox (folderId → undefined)
    const entries = await ctx.db
      .query("timeEntries")
      .withIndex("by_user_folder", (q) =>
        q.eq("userId", user._id).eq("folderId", args.folderId),
      )
      .collect();

    for (const entry of entries) {
      await ctx.db.patch(entry._id, {
        folderId: undefined,
        updatedAt: now,
      });
    }

    // 3. Delete the folder
    await ctx.db.delete(args.folderId);

    return args.folderId;
  },
});

/** Reorder a folder among its siblings (set a new manual sortOrder). */
export const reorderFolder = mutation({
  args: {
    folderId: v.id("folders"),
    sortOrder: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    await getUserFolder(ctx, user._id, args.folderId);

    await ctx.db.patch(args.folderId, {
      sortOrder: args.sortOrder,
      updatedAt: Date.now(),
    });

    return args.folderId;
  },
});
