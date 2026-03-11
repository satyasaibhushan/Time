# Time

Phase 1 starts with a `pnpm` monorepo containing:

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

- Web app local env file: `apps/web/.env.local`
- Web app example env file: `apps/web/.env.example`
- Convex secrets are managed in Convex, not in a committed env file
- Convex env notes live in `convex/README.md`

Setup flow:

```bash
cp apps/web/.env.example apps/web/.env.local
```
