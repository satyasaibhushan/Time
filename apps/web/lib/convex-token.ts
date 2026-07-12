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

  if (!token) {
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
