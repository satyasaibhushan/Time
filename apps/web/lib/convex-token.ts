import { AccessTokenError } from "@auth0/nextjs-auth0/errors";

type ConvexTokenSession = {
  tokenSet: {
    idToken?: string;
  };
};

export type ConvexTokenAuth = {
  getAccessToken(): Promise<unknown>;
  getSession(): Promise<ConvexTokenSession | null>;
};

function unauthorized() {
  return Response.json(
    { error: "Unauthorized" },
    {
      status: 401,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

function getTokenExpiration(token: string) {
  const payload = token.split(".")[1];
  if (!payload) return undefined;

  try {
    const claims = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as { exp?: unknown };

    return typeof claims.exp === "number" ? claims.exp : undefined;
  } catch {
    return undefined;
  }
}

export async function createConvexTokenResponse(auth: ConvexTokenAuth) {
  const session = await auth.getSession();

  if (!session) {
    return unauthorized();
  }

  try {
    await auth.getAccessToken();
  } catch (error) {
    if (error instanceof AccessTokenError) {
      return unauthorized();
    }

    throw error;
  }

  const refreshedSession = await auth.getSession();
  const token = refreshedSession?.tokenSet.idToken;
  const expiresAt = token ? getTokenExpiration(token) : undefined;

  if (
    !token ||
    (typeof expiresAt === "number" && expiresAt <= Math.floor(Date.now() / 1000))
  ) {
    return unauthorized();
  }

  return Response.json(
    { token },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
