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
- Official Convex Swift client with live query subscriptions
- Auth0 Universal Login with cached Keychain credentials
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

The app currently uses the same `silent-bat-335` Convex deployment URL as the
web app. Active timers, recent entries, folders, and labels update through live
subscriptions; timer lifecycle actions call the existing Convex mutations.
Synced data is also published to the widget App Group.

## Auth0 native application

iOS must use a separate Auth0 **Native** application. The web application is a
confidential client and its secret must never be embedded in the app.

Configure the Native application with both of these values:

```text
Allowed Callback URLs:
fun.bhushan.time://dev-2eahmbvpb8dc1wei.jp.auth0.com/ios/fun.bhushan.time/callback

Allowed Logout URLs:
fun.bhushan.time://dev-2eahmbvpb8dc1wei.jp.auth0.com/ios/fun.bhushan.time/callback
```

Then:

1. Put its public Client ID in `Sources/TimeApp/Auth0.plist`.
2. Add `AUTH0_NATIVE_CLIENT_ID` with the same value to every Convex environment
   used by an Apple build, including development and production.
3. Deploy the Convex auth configuration to each environment.

No Auth0 client secret belongs in the iOS project.

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
- Pin official Swift packages through `Package.resolved`.
- Use a public Auth0 Native client ID; never use the web client secret.
- Production points to the same Convex deployment as the released web app.
