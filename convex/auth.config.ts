import type { AuthConfig } from "convex/server";

const auth0Domain = process.env.AUTH0_DOMAIN;
const auth0ClientId = process.env.AUTH0_CLIENT_ID;
const auth0NativeClientId = process.env.AUTH0_NATIVE_CLIENT_ID;

if (!auth0Domain) {
  throw new Error("Missing AUTH0_DOMAIN in Convex environment variables.");
}

if (!auth0ClientId) {
  throw new Error("Missing AUTH0_CLIENT_ID in Convex environment variables.");
}

const normalizedDomain = auth0Domain.startsWith("https://")
  ? auth0Domain
  : `https://${auth0Domain}`;

export default {
  providers: [
    {
      domain: normalizedDomain,
      applicationID: auth0ClientId,
    },
    ...(auth0NativeClientId
      ? [
          {
            domain: normalizedDomain,
            applicationID: auth0NativeClientId,
          },
        ]
      : []),
  ],
} satisfies AuthConfig;
