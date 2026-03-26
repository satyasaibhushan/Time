import { v } from "convex/values";

import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";
import { getCurrentUserOrThrow } from "./helpers";

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Find the current user's active timer (running or paused).
 * Returns null if there is no active timer.
 */
async function findActiveTimer(
  ctx: MutationCtx,
  userId: Id<"users">,
): Promise<Doc<"timeEntries"> | null> {
  // Check running first
  const running = await ctx.db
    .query("timeEntries")
    .withIndex("by_user_status", (q) => q.eq("userId", userId).eq("status", "running"))
    .first();

  if (running) return running;

  // Then check paused
  const paused = await ctx.db
    .query("timeEntries")
    .withIndex("by_user_status", (q) => q.eq("userId", userId).eq("status", "paused"))
    .first();

  return paused;
}

/**
 * Compute the total duration in seconds from a list of segments.
 * Open segments (no endTime) are ignored — only closed segments count.
 */
function computeDurationSeconds(
  segments: Array<{ startTime: number; endTime?: number }>,
): number {
  let total = 0;

  for (const seg of segments) {
    if (seg.endTime !== undefined) {
      total += (seg.endTime - seg.startTime) / 1000;
    }
  }

  return Math.round(total);
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** Fetch the current user's active timer (running or paused). */
export const getActiveTimer = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUserOrThrow(ctx);

    const running = await ctx.db
      .query("timeEntries")
      .withIndex("by_user_status", (q) => q.eq("userId", user._id).eq("status", "running"))
      .first();

    if (running) return running;

    const paused = await ctx.db
      .query("timeEntries")
      .withIndex("by_user_status", (q) => q.eq("userId", user._id).eq("status", "paused"))
      .first();

    return paused ?? null;
  },
});

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/**
 * Start a new timer.
 * - Enforces one active timer per user (throws if one exists)
 * - Creates the first segment
 * - Defaults to Inbox if no folder is selected
 * - Applies inherited folder labels automatically
 */
export const startTimer = mutation({
  args: {
    title: v.optional(v.string()),
    notes: v.optional(v.string()),
    folderId: v.optional(v.id("folders")),
    manualLabelIds: v.optional(v.array(v.id("labels"))),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    // Enforce one active timer per user
    const existing = await findActiveTimer(ctx, user._id);
    if (existing) {
      throw new Error(
        `You already have an active timer (${existing.status}). Stop or discard it first.`,
      );
    }

    // Validate folder belongs to user
    if (args.folderId) {
      const folder = await ctx.db.get(args.folderId);
      if (!folder || folder.userId !== user._id) {
        throw new Error("Folder not found");
      }
    }

    const now = Date.now();

    return await ctx.db.insert("timeEntries", {
      userId: user._id,
      folderId: args.folderId,
      title: args.title ?? "",
      notes: args.notes,
      manualLabelIds: args.manualLabelIds ?? [],
      status: "running",
      segments: [{ startTime: now }],
      startedAt: now,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Pause the current running timer.
 * - Closes the current open segment
 * - Marks status as "paused"
 */
export const pauseTimer = mutation({
  args: {
    entryId: v.id("timeEntries"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const entry = await ctx.db.get(args.entryId);

    if (!entry || entry.userId !== user._id) {
      throw new Error("Time entry not found");
    }

    if (entry.status !== "running") {
      throw new Error(`Cannot pause a timer that is ${entry.status}`);
    }

    const now = Date.now();

    // Close the last open segment
    const segments = entry.segments.map((seg, i) => {
      if (i === entry.segments.length - 1 && seg.endTime === undefined) {
        return { ...seg, endTime: now };
      }
      return seg;
    });

    await ctx.db.patch(args.entryId, {
      status: "paused",
      segments,
      updatedAt: now,
    });

    return args.entryId;
  },
});

/**
 * Resume a paused timer.
 * - Opens a new segment
 * - Marks status as "running"
 */
export const resumeTimer = mutation({
  args: {
    entryId: v.id("timeEntries"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const entry = await ctx.db.get(args.entryId);

    if (!entry || entry.userId !== user._id) {
      throw new Error("Time entry not found");
    }

    if (entry.status !== "paused") {
      throw new Error(`Cannot resume a timer that is ${entry.status}`);
    }

    const now = Date.now();

    await ctx.db.patch(args.entryId, {
      status: "running",
      segments: [...entry.segments, { startTime: now }],
      updatedAt: now,
    });

    return args.entryId;
  },
});

/**
 * Stop a running or paused timer.
 * - Closes the current open segment (if running)
 * - Marks status as "completed"
 * - Computes and stores durationSeconds
 */
export const stopTimer = mutation({
  args: {
    entryId: v.id("timeEntries"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const entry = await ctx.db.get(args.entryId);

    if (!entry || entry.userId !== user._id) {
      throw new Error("Time entry not found");
    }

    if (entry.status === "completed") {
      throw new Error("Timer is already stopped");
    }

    const now = Date.now();

    // Close the last open segment if running
    const segments = entry.segments.map((seg, i) => {
      if (i === entry.segments.length - 1 && seg.endTime === undefined) {
        return { ...seg, endTime: now };
      }
      return seg;
    });

    const durationSeconds = computeDurationSeconds(segments);

    await ctx.db.patch(args.entryId, {
      status: "completed",
      segments,
      endedAt: now,
      durationSeconds,
      updatedAt: now,
    });

    return args.entryId;
  },
});

/** Discard an active timer (running or paused). Deletes the entry entirely. */
export const discardTimer = mutation({
  args: {
    entryId: v.id("timeEntries"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const entry = await ctx.db.get(args.entryId);

    if (!entry || entry.userId !== user._id) {
      throw new Error("Time entry not found");
    }

    if (entry.status === "completed") {
      throw new Error("Cannot discard a completed timer. Use delete instead.");
    }

    await ctx.db.delete(args.entryId);

    return args.entryId;
  },
});

/**
 * Continue a previous entry as a new running timer.
 * Copies the title, notes, folder, and manual labels from the source entry.
 */
export const continueEntry = mutation({
  args: {
    sourceEntryId: v.id("timeEntries"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    // Enforce one active timer per user
    const existing = await findActiveTimer(ctx, user._id);
    if (existing) {
      throw new Error(
        `You already have an active timer (${existing.status}). Stop or discard it first.`,
      );
    }

    const source = await ctx.db.get(args.sourceEntryId);

    if (!source || source.userId !== user._id) {
      throw new Error("Source entry not found");
    }

    const now = Date.now();

    return await ctx.db.insert("timeEntries", {
      userId: user._id,
      folderId: source.folderId,
      title: source.title,
      notes: source.notes,
      manualLabelIds: source.manualLabelIds,
      status: "running",
      segments: [{ startTime: now }],
      startedAt: now,
      createdAt: now,
      updatedAt: now,
    });
  },
});
