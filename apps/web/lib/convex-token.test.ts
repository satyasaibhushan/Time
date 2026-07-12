import assert from "node:assert/strict";
import test from "node:test";

import {
  AccessTokenError,
  AccessTokenErrorCode,
} from "@auth0/nextjs-auth0/errors";

import {
  createConvexTokenResponse,
  type ConvexTokenAuth,
} from "./convex-token.ts";

function authClient({
  accessTokenError,
  idToken,
}: {
  accessTokenError?: Error;
  idToken?: string;
} = {}): ConvexTokenAuth & { accessTokenCalls: number } {
  const client = {
    accessTokenCalls: 0,
    async getAccessToken() {
      client.accessTokenCalls += 1;
      if (accessTokenError) throw accessTokenError;
    },
    async getSession() {
      return idToken ? { tokenSet: { idToken } } : null;
    },
  };

  return client;
}

test("missing sessions return 401 without requesting an access token", async () => {
  const auth = authClient();
  const response = await createConvexTokenResponse(auth);

  assert.equal(response.status, 401);
  assert.equal(auth.accessTokenCalls, 0);
  assert.deepEqual(await response.json(), { error: "Unauthorized" });
});

test("expired sessions return 401 so the browser can authenticate again", async () => {
  const auth = authClient({
    idToken: "expired-id-token",
    accessTokenError: new AccessTokenError(
      AccessTokenErrorCode.MISSING_REFRESH_TOKEN,
      "The access token has expired.",
    ),
  });
  const response = await createConvexTokenResponse(auth);

  assert.equal(response.status, 401);
  assert.equal(auth.accessTokenCalls, 1);
});

test("valid sessions return the Auth0 ID token for Convex", async () => {
  const auth = authClient({ idToken: "valid-id-token" });
  const response = await createConvexTokenResponse(auth);

  assert.equal(response.status, 200);
  assert.equal(auth.accessTokenCalls, 1);
  assert.deepEqual(await response.json(), { token: "valid-id-token" });
});

test("expired ID tokens return 401 even while the access token is valid", async () => {
  const payload = Buffer.from(
    JSON.stringify({ exp: Math.floor(Date.now() / 1000) - 1 }),
  ).toString("base64url");
  const auth = authClient({
    idToken: `header.${payload}.signature`,
  });
  const response = await createConvexTokenResponse(auth);

  assert.equal(response.status, 401);
  assert.equal(auth.accessTokenCalls, 1);
});

test("unexpected token errors remain server errors", async () => {
  const failure = new Error("Auth0 configuration failed");
  const auth = authClient({ idToken: "id-token", accessTokenError: failure });

  await assert.rejects(createConvexTokenResponse(auth), failure);
});
