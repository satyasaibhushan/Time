import { v } from "convex/values";

import type { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import {
  findUserByAuthSubject,
  getCurrentIdentityOrThrow,
  getCurrentUserOrThrow,
} from "./helpers";

const segmentValidator = v.object({
  startTime: v.number(),
  endTime: v.optional(v.number()),
});

const snapshotValidator = v.object({
  sourceUserId: v.string(),
  user: v.object({
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    timezone: v.string(),
    weekStart: v.union(v.literal("monday"), v.literal("sunday")),
    timeFormat: v.union(v.literal("12h"), v.literal("24h")),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),
  labels: v.array(
    v.object({
      sourceId: v.string(),
      name: v.string(),
      color: v.string(),
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
  ),
  folders: v.array(
    v.object({
      sourceId: v.string(),
      name: v.string(),
      color: v.optional(v.string()),
      parentFolderId: v.optional(v.string()),
      defaultLabelIds: v.array(v.string()),
      archived: v.boolean(),
      sortOrder: v.number(),
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
  ),
  entries: v.array(
    v.object({
      sourceId: v.string(),
      folderId: v.optional(v.string()),
      title: v.string(),
      notes: v.optional(v.string()),
      manualLabelIds: v.array(v.string()),
      status: v.union(
        v.literal("running"),
        v.literal("paused"),
        v.literal("completed"),
      ),
      segments: v.array(segmentValidator),
      startedAt: v.number(),
      endedAt: v.optional(v.number()),
      durationSeconds: v.optional(v.number()),
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
  ),
});

function requiredMappedId<TableName extends "folders" | "labels">(
  ids: Map<string, Id<TableName>>,
  sourceId: string,
  kind: TableName,
): Id<TableName> {
  const id = ids.get(sourceId);
  if (!id) {
    throw new Error(`Snapshot references a missing ${kind} record.`);
  }
  return id;
}

export const exportCurrentUserData = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUserOrThrow(ctx);
    const [labels, folders, entries] = await Promise.all([
      ctx.db
        .query("labels")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .collect(),
      ctx.db
        .query("folders")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .collect(),
      ctx.db
        .query("timeEntries")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .collect(),
    ]);

    return {
      sourceUserId: user._id as string,
      user: {
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        timezone: user.timezone,
        weekStart: user.weekStart,
        timeFormat: user.timeFormat,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      labels: labels.map((label) => ({
        sourceId: label._id as string,
        name: label.name,
        color: label.color,
        createdAt: label.createdAt,
        updatedAt: label.updatedAt,
      })),
      folders: folders.map((folder) => ({
        sourceId: folder._id as string,
        name: folder.name,
        color: folder.color,
        parentFolderId: folder.parentFolderId as string | undefined,
        defaultLabelIds: folder.defaultLabelIds.map((id) => id as string),
        archived: folder.archived,
        sortOrder: folder.sortOrder,
        createdAt: folder.createdAt,
        updatedAt: folder.updatedAt,
      })),
      entries: entries.map((entry) => ({
        sourceId: entry._id as string,
        folderId: entry.folderId as string | undefined,
        title: entry.title,
        notes: entry.notes,
        manualLabelIds: entry.manualLabelIds.map((id) => id as string),
        status: entry.status,
        segments: entry.segments,
        startedAt: entry.startedAt,
        endedAt: entry.endedAt,
        durationSeconds: entry.durationSeconds,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt,
      })),
    };
  },
});

export const importStatus = query({
  args: { sourceUserId: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    return await ctx.db
      .query("migrationImports")
      .withIndex("by_user_source", (q) =>
        q.eq("userId", user._id).eq("sourceUserId", args.sourceUserId),
      )
      .unique();
  },
});

export const importCurrentUserData = mutation({
  args: { snapshot: snapshotValidator },
  handler: async (ctx, args) => {
    const snapshot = args.snapshot;
    const identity = await getCurrentIdentityOrThrow(ctx);
    let user = await findUserByAuthSubject(ctx, identity.subject);

    if (!user) {
      const userId = await ctx.db.insert("users", {
        authProvider: "auth0",
        authSubject: identity.subject,
        email: snapshot.user.email,
        name: snapshot.user.name,
        avatarUrl: snapshot.user.avatarUrl,
        timezone: snapshot.user.timezone,
        weekStart: snapshot.user.weekStart,
        timeFormat: snapshot.user.timeFormat,
        createdAt: snapshot.user.createdAt,
        updatedAt: snapshot.user.updatedAt,
      });
      const createdUser = await ctx.db.get(userId);
      if (!createdUser) {
        throw new Error("Could not create the target user.");
      }
      user = createdUser;
    }

    const completedImport = await ctx.db
      .query("migrationImports")
      .withIndex("by_user_source", (q) =>
        q.eq("userId", user._id).eq("sourceUserId", snapshot.sourceUserId),
      )
      .unique();

    if (completedImport) {
      return {
        alreadyImported: true,
        folders: completedImport.folderCount,
        labels: completedImport.labelCount,
        entries: completedImport.entryCount,
      };
    }

    const [existingFolders, existingLabels, existingEntries] = await Promise.all([
      ctx.db
        .query("folders")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .take(1),
      ctx.db
        .query("labels")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .take(1),
      ctx.db
        .query("timeEntries")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .take(1),
    ]);

    if (existingFolders.length || existingLabels.length || existingEntries.length) {
      throw new Error("Target account already contains data; import stopped safely.");
    }

    await ctx.db.patch(user._id, {
      email: snapshot.user.email,
      name: snapshot.user.name,
      avatarUrl: snapshot.user.avatarUrl,
      timezone: snapshot.user.timezone,
      weekStart: snapshot.user.weekStart,
      timeFormat: snapshot.user.timeFormat,
      createdAt: snapshot.user.createdAt,
      updatedAt: snapshot.user.updatedAt,
    });

    const labelIds = new Map<string, Id<"labels">>();
    for (const label of snapshot.labels) {
      const id = await ctx.db.insert("labels", {
        userId: user._id,
        name: label.name,
        color: label.color,
        createdAt: label.createdAt,
        updatedAt: label.updatedAt,
      });
      labelIds.set(label.sourceId, id);
    }

    const folderIds = new Map<string, Id<"folders">>();
    let pendingFolders = [...snapshot.folders];
    while (pendingFolders.length > 0) {
      const ready = pendingFolders.filter(
        (folder) =>
          folder.parentFolderId === undefined || folderIds.has(folder.parentFolderId),
      );
      if (ready.length === 0) {
        throw new Error("Snapshot contains an invalid folder hierarchy.");
      }

      for (const folder of ready) {
        const id = await ctx.db.insert("folders", {
          userId: user._id,
          name: folder.name,
          color: folder.color,
          parentFolderId: folder.parentFolderId
            ? requiredMappedId(folderIds, folder.parentFolderId, "folders")
            : undefined,
          defaultLabelIds: folder.defaultLabelIds.map((sourceId) =>
            requiredMappedId(labelIds, sourceId, "labels"),
          ),
          archived: folder.archived,
          sortOrder: folder.sortOrder,
          createdAt: folder.createdAt,
          updatedAt: folder.updatedAt,
        });
        folderIds.set(folder.sourceId, id);
      }

      const inserted = new Set(ready.map((folder) => folder.sourceId));
      pendingFolders = pendingFolders.filter(
        (folder) => !inserted.has(folder.sourceId),
      );
    }

    for (const entry of snapshot.entries) {
      await ctx.db.insert("timeEntries", {
        userId: user._id,
        folderId: entry.folderId
          ? requiredMappedId(folderIds, entry.folderId, "folders")
          : undefined,
        title: entry.title,
        notes: entry.notes,
        manualLabelIds: entry.manualLabelIds.map((sourceId) =>
          requiredMappedId(labelIds, sourceId, "labels"),
        ),
        status: entry.status,
        segments: entry.segments,
        startedAt: entry.startedAt,
        endedAt: entry.endedAt,
        durationSeconds: entry.durationSeconds,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt,
      });
    }

    await ctx.db.insert("migrationImports", {
      userId: user._id,
      sourceUserId: snapshot.sourceUserId,
      folderCount: snapshot.folders.length,
      labelCount: snapshot.labels.length,
      entryCount: snapshot.entries.length,
      completedAt: Date.now(),
    });

    return {
      alreadyImported: false,
      folders: snapshot.folders.length,
      labels: snapshot.labels.length,
      entries: snapshot.entries.length,
    };
  },
});
