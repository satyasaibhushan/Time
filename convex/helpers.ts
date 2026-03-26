import type { Doc } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";

export type UserContext = MutationCtx | QueryCtx;

export async function getCurrentIdentityOrThrow(ctx: UserContext) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new Error("Unauthorized");
  }

  return identity;
}

export async function findUserByAuthSubject(
  ctx: UserContext,
  authSubject: string,
): Promise<Doc<"users"> | null> {
  return await ctx.db
    .query("users")
    .withIndex("by_auth_subject", (q) => q.eq("authSubject", authSubject))
    .unique();
}

/**
 * Get the current authenticated user or throw.
 * Use this in any mutation/query that requires an authenticated user.
 */
export async function getCurrentUserOrThrow(ctx: UserContext): Promise<Doc<"users">> {
  const identity = await getCurrentIdentityOrThrow(ctx);
  const user = await findUserByAuthSubject(ctx, identity.subject);

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}
