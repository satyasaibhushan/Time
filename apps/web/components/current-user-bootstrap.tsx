"use client";

import { useEffect, useRef } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";

import { api } from "@convex/_generated/api";

export function CurrentUserBootstrap() {
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

  return null;
}
