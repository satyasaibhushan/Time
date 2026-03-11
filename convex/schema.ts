import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const timeSegment = v.object({
  startTime: v.number(),
  endTime: v.optional(v.number()),
});

export default defineSchema({
  // This app is scoped directly to one authenticated user. There is no
  // organization or workspace layer in the data model.
  users: defineTable({
    authProvider: v.literal("auth0"),
    authSubject: v.string(),
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    timezone: v.string(),
    weekStart: v.union(v.literal("monday"), v.literal("sunday")),
    timeFormat: v.union(v.literal("12h"), v.literal("24h")),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_auth_subject", ["authSubject"]),

  // The only hierarchy type is folders. A missing parentFolderId means the
  // folder is at the root of the tree, not in Inbox.
  folders: defineTable({
    userId: v.id("users"),
    name: v.string(),
    color: v.optional(v.string()),
    parentFolderId: v.optional(v.id("folders")),
    defaultLabelIds: v.array(v.id("labels")),
    archived: v.boolean(),
    sortOrder: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_parent_folder", ["userId", "parentFolderId"])
    .index("by_user_archived", ["userId", "archived"]),

  // Labels are user-owned and can be inherited from any ancestor folder.
  // Effective labels are computed live instead of being stored on entries.
  labels: defineTable({
    userId: v.id("users"),
    name: v.string(),
    color: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  // Inbox is abstract. A missing folderId means the time entry belongs to
  // Inbox. Only manual labels are stored here; inherited labels are resolved
  // from the current folder ancestry at query time.
  //
  // One active timer per user is a product invariant enforced in mutations,
  // not by schema shape alone.
  timeEntries: defineTable({
    userId: v.id("users"),
    folderId: v.optional(v.id("folders")),
    title: v.string(),
    notes: v.optional(v.string()),
    manualLabelIds: v.array(v.id("labels")),
    status: v.union(
      v.literal("running"),
      v.literal("paused"),
      v.literal("completed"),
    ),
    segments: v.array(timeSegment),
    startedAt: v.number(),
    endedAt: v.optional(v.number()),
    durationSeconds: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_status", ["userId", "status"])
    .index("by_user_started_at", ["userId", "startedAt"])
    .index("by_user_folder", ["userId", "folderId"]),
});
