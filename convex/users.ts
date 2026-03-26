import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import {
  getCurrentIdentityOrThrow,
  getCurrentUserOrThrow,
  findUserByAuthSubject,
} from "./helpers";

export const current = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return null;
    }

    return await findUserByAuthSubject(ctx, identity.subject);
  },
});

export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    await ctx.db.patch(user._id, {
      ...(args.name !== undefined && { name: args.name }),
      ...(args.email !== undefined && { email: args.email }),
      ...(args.avatarUrl !== undefined && { avatarUrl: args.avatarUrl }),
      updatedAt: Date.now(),
    });

    return user._id;
  },
});

export const updatePreferences = mutation({
  args: {
    timezone: v.optional(v.string()),
    timeFormat: v.optional(v.union(v.literal("12h"), v.literal("24h"))),
    weekStart: v.optional(v.union(v.literal("monday"), v.literal("sunday"))),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    await ctx.db.patch(user._id, {
      ...(args.timezone !== undefined && { timezone: args.timezone }),
      ...(args.timeFormat !== undefined && { timeFormat: args.timeFormat }),
      ...(args.weekStart !== undefined && { weekStart: args.weekStart }),
      updatedAt: Date.now(),
    });

    return user._id;
  },
});

export const ensureCurrentUser = mutation({
  args: {
    timezone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await getCurrentIdentityOrThrow(ctx);
    const existingUser = await findUserByAuthSubject(ctx, identity.subject);

    if (existingUser) {
      return existingUser._id;
    }

    const now = Date.now();

    return await ctx.db.insert("users", {
      authProvider: "auth0",
      authSubject: identity.subject,
      email: identity.email,
      name: identity.name ?? identity.nickname,
      avatarUrl: identity.pictureUrl,
      timezone: args.timezone ?? identity.timezone ?? "UTC",
      weekStart: "monday",
      timeFormat: "24h",
      createdAt: now,
      updatedAt: now,
    });
  },
});
