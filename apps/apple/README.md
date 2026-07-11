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
- Compact current-timer widget with a system-rendered live clock
- Configurable horizontal summary widget with Day, Week, or Month range
- Dynamic folder and label filters backed by the shared app snapshot
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

## Widgets

The app and widget extension share data through the
`group.fun.bhushan.time` App Group. Add that App Group capability to both the
`Time` and `TimeWidgets` identifiers in the Apple Developer portal before a
device or release build. Simulator SDK builds work without signing.

The summary widget is configured from the Home Screen widget editor. Its
folder and label choices come from the latest shared snapshot, so the Convex
adapter only needs to publish the user's current entries and filter options.

## Environment rules

- Never commit Auth0 secrets or tokens.
- Store the public Convex deployment URL in target build configuration.
- Use separate development and production schemes.
- Production points to the same Convex deployment as the released web app.
