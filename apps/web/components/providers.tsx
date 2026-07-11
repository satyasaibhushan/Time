"use client";

import { Auth0Provider, useUser } from "@auth0/nextjs-auth0";
import {
  ConvexProviderWithAuth,
  ConvexReactClient,
} from "convex/react";
import { useCallback, useMemo } from "react";

import { CurrentUserBootstrap } from "@/components/current-user-bootstrap";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!convexUrl) {
  throw new Error("Missing NEXT_PUBLIC_CONVEX_URL in apps/web/.env.local.");
}

const convex = new ConvexReactClient(convexUrl);

type Auth0SessionUser = {
  email?: string;
  name?: string;
  nickname?: string;
  picture?: string;
  sub: string;
};

function useAuthFromNextJsAuth0() {
  const { error, isLoading, user } = useUser();

  const fetchAccessToken = useCallback(async () => {
    const response = await fetch("/api/auth/convex-token", {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as { token?: string };

    return typeof data.token === "string" ? data.token : null;
  }, []);

  return useMemo(
    () => ({
      isAuthenticated: Boolean(user) && !error,
      isLoading,
      fetchAccessToken,
    }),
    [error, fetchAccessToken, isLoading, user],
  );
}

export function AppProviders({
  children,
  user,
}: {
  children: React.ReactNode;
  user?: Auth0SessionUser;
}) {
  return (
    <Auth0Provider user={user}>
      <ConvexProviderWithAuth client={convex} useAuth={useAuthFromNextJsAuth0}>
        <CurrentUserBootstrap>{children}</CurrentUserBootstrap>
      </ConvexProviderWithAuth>
    </Auth0Provider>
  );
}
