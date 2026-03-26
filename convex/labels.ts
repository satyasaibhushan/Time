import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { getCurrentUserOrThrow } from "./helpers";

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** List all labels for the current user. */
export const listLabels = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUserOrThrow(ctx);

    return await ctx.db
      .query("labels")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
  },
});

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/** Create a new label. */
export const createLabel = mutation({
  args: {
    name: v.string(),
    color: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const now = Date.now();

    return await ctx.db.insert("labels", {
      userId: user._id,
      name: args.name,
      color: args.color,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/** Update a label's name and/or color. */
export const updateLabel = mutation({
  args: {
    labelId: v.id("labels"),
    name: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const label = await ctx.db.get(args.labelId);

    if (!label || label.userId !== user._id) {
      throw new Error("Label not found");
    }

    await ctx.db.patch(args.labelId, {
      ...(args.name !== undefined && { name: args.name }),
      ...(args.color !== undefined && { color: args.color }),
      updatedAt: Date.now(),
    });

    return args.labelId;
  },
});

/**
 * Delete a label.
 * - Removes it from any folder defaultLabelIds
 * - Removes it from any time entry manualLabelIds
 * - Then deletes the label row
 */
export const deleteLabel = mutation({
  args: {
    labelId: v.id("labels"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const label = await ctx.db.get(args.labelId);

    if (!label || label.userId !== user._id) {
      throw new Error("Label not found");
    }

    const now = Date.now();

    // Remove from folder defaults
    const folders = await ctx.db
      .query("folders")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    for (const folder of folders) {
      if (folder.defaultLabelIds.includes(args.labelId)) {
        await ctx.db.patch(folder._id, {
          defaultLabelIds: folder.defaultLabelIds.filter((id) => id !== args.labelId),
          updatedAt: now,
        });
      }
    }

    // Remove from time entry manual labels
    const entries = await ctx.db
      .query("timeEntries")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    for (const entry of entries) {
      if (entry.manualLabelIds.includes(args.labelId)) {
        await ctx.db.patch(entry._id, {
          manualLabelIds: entry.manualLabelIds.filter((id) => id !== args.labelId),
          updatedAt: now,
        });
      }
    }

    // Delete the label
    await ctx.db.delete(args.labelId);

    return args.labelId;
  },
});
