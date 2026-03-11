"use client";

import { useConvexAuth, useQuery } from "convex/react";

import { api } from "@convex/_generated/api";

export function CurrentUserStatus() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const currentUser = useQuery(api.users.current, isAuthenticated ? {} : "skip");

  if (isLoading) {
    return <span>Checking auth...</span>;
  }

  if (!isAuthenticated) {
    return <span>Signed out</span>;
  }

  if (currentUser === undefined) {
    return <span>Loading Convex profile...</span>;
  }

  if (currentUser === null) {
    return <span>Provisioning Convex profile...</span>;
  }

  return <span>Convex profile ready</span>;
}
