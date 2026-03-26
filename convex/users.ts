import { v } from "convex/values";

import type { Doc } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";

type UserContext = MutationCtx | QueryCtx;

async function getCurrentIdentityOrThrow(ctx: UserContext) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new Error("Unauthorized");
  }

  return identity;
}

async function findUserByAuthSubject(
  ctx: UserContext,
  authSubject: string,
): Promise<Doc<"users"> | null> {
  return await ctx.db
    .query("users")
    .withIndex("by_auth_subject", (q) => q.eq("authSubject", authSubject))
    .unique();
}

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
    const identity = await getCurrentIdentityOrThrow(ctx);
    const user = await findUserByAuthSubject(ctx, identity.subject);

    if (!user) {
      throw new Error("User not found");
    }

    const updates: Partial<Doc<"users">> = {
      updatedAt: Date.now(),
    };

    if (args.name !== undefined) updates.name = args.name;
    if (args.email !== undefined) updates.email = args.email;
    if (args.avatarUrl !== undefined) updates.avatarUrl = args.avatarUrl;

    await ctx.db.patch(user._id, updates);

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
    const identity = await getCurrentIdentityOrThrow(ctx);
    const user = await findUserByAuthSubject(ctx, identity.subject);

    if (!user) {
      throw new Error("User not found");
    }

    const updates: Partial<Doc<"users">> = {
      updatedAt: Date.now(),
    };

    if (args.timezone !== undefined) updates.timezone = args.timezone;
    if (args.timeFormat !== undefined) updates.timeFormat = args.timeFormat;
    if (args.weekStart !== undefined) updates.weekStart = args.weekStart;

    await ctx.db.patch(user._id, updates);

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
