"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";

import { api } from "@convex/_generated/api";

export function CurrentUserBootstrap({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const currentUser = useQuery(api.users.current, isAuthenticated ? {} : "skip");
  const ensureCurrentUser = useMutation(api.users.ensureCurrentUser);
  const hasProvisionedRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) {
      hasProvisionedRef.current = false;
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isLoading || !isAuthenticated || currentUser !== null) {
      return;
    }

    if (currentUser === undefined || hasProvisionedRef.current) {
      return;
    }

    hasProvisionedRef.current = true;

    void ensureCurrentUser({
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    }).catch(() => {
      hasProvisionedRef.current = false;
    });
  }, [currentUser, ensureCurrentUser, isAuthenticated, isLoading]);

  if (isLoading || !isAuthenticated || currentUser === undefined || currentUser === null) {
    return null;
  }

  return children;
}
