# Time for Apple Platforms

Native development includes a SwiftUI iPhone application and `TimeCore`, a
Swift package that will be shared by the future macOS target. The core mirrors
the production Convex domain model and keeps timer behavior independent from
presentation code.

## Current foundation

- Swift 6 package targeting iOS 17+ and macOS 14+
- Sendable, Codable models aligned with the Convex schema
- Whole-second timer calculations shared across every active timer
- Stable names for the existing Convex queries and mutations
- Repository protocol for the future Convex Swift adapter
- Reproducible Xcode project generated from `project.yml`
- Native timer dashboard with multiple synchronized timers
- Unit tests for shared timer behavior

Run the core tests:

```bash
cd apps/apple
swift test
```

Generate and open the iOS project:

```bash
xcodegen generate
open Time.xcodeproj
```

The current timer actions use an in-memory store while the Convex and Auth0
adapters are built. This makes the first native interaction testable without
creating a second backend or changing the production schema.

## Environment rules

- Never commit Auth0 secrets or tokens.
- Store the public Convex deployment URL in target build configuration.
- Use separate development and production schemes.
- Production points to the same Convex deployment as the released web app.
