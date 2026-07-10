# Time

The Web MVP is complete and ready for production deployment. After the web
release, development moves to the native iOS app on the same Convex backend and
Auth0 identity model.

The `pnpm` monorepo contains:

- `apps/web` for the Next.js web app
- `apps/apple` as a placeholder for future native app work
- `convex` for backend code
- `packages/shared` for shared TypeScript code

## Getting Started

```bash
pnpm install
pnpm dev
```

The web app runs on `http://localhost:3003`.

## Environment Conventions

- Web app auth and browser runtime env file: `apps/web/.env.local`
- Web app example env file: `apps/web/.env.example`
- Convex CLI writes deployment metadata to the repo root `.env.local`
- Convex secrets are managed in Convex, not in a committed env file
- Convex env notes live in `convex/README.md`

Setup flow:

```bash
cp apps/web/.env.example apps/web/.env.local
```

Then copy `CONVEX_URL` from the repo root `.env.local` into
`apps/web/.env.local` as `NEXT_PUBLIC_CONVEX_URL`.

For local Auth0 setup, register these URLs in your Auth0 application:

- Allowed Callback URL: `http://localhost:3003/auth/callback`
- Allowed Logout URL: `http://localhost:3003`

## Roadmap

1. Deploy the Next.js web app and Convex backend.
2. Run the production smoke test.
3. Begin the SwiftUI iOS app in `apps/apple`.
