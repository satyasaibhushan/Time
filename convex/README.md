# Convex Environment Conventions

Convex server-side secrets should not be stored in a committed `.env` file.

Use Convex-managed environment variables instead:

```bash
pnpm exec convex env set KEY value
```

Planned Convex environment variables:

```bash
AUTH0_ISSUER_BASE_URL=
AUTH0_APPLICATION_ID=
```

Notes:

- `apps/web/.env.local` is for Next.js runtime configuration.
- Convex secrets live in the Convex deployment, not in the repository.
- Variable names should stay aligned between the web app and Convex where possible.
