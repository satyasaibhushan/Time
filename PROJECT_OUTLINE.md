# Time Tracking App - Project Outline

## Project Overview
A full-stack time tracking application inspired by Timery, with real-time sync across web, iOS, and macOS platforms. Features automatic time tracking via iOS Focus modes, comprehensive reporting, and native widgets.

## Core Goals
- Track time spent on different projects and tasks
- Automatic tracking via iOS Shortcuts + Focus mode integration
- Real-time sync across all devices
- Native widgets showing current running timer
- Comprehensive reporting (weekly, monthly, yearly, custom ranges)
- Full Toggl-like functionality (projects, labels, time entries)

---

## Technology Stack

### Frontend
- **Web Application**: Next.js 14+ (App Router) + React + TypeScript
  - TailwindCSS for styling
  - Shadcn/ui for component library
  - Recharts for analytics/graphs

- **iOS Application**: Swift + SwiftUI
  - WidgetKit for home/lock screen widgets
  - App Intents for Shortcuts integration
  - Focus Filter for automatic tracking

- **macOS Application**: Swift + SwiftUI (shared codebase with iOS)
  - WidgetKit for menu bar/notification center widgets
  - SwiftUI for native macOS experience

### Backend
- **Convex**: TypeScript-based backend
  - Real-time database with automatic subscriptions
  - Built-in authentication
  - Serverless functions
  - File storage (for exports, avatars, etc.)

### Development Tools
- **Version Control**: Git + GitHub
- **Package Managers**: npm/pnpm (web), Swift Package Manager (iOS/macOS)
- **Development Environment**: VS Code (web), Xcode (iOS/macOS)

---

## Core Features

### 1. Time Tracking
- **Start/Stop Timer**
  - One-click start from any device
  - Real-time running timer display
  - Pause and resume capability
  - Description/notes field

- **Manual Time Entry**
  - Add past time entries
  - Edit start/end times
  - Bulk edit multiple entries

- **Timer Management**
  - Delete entries
  - Duplicate entries
  - Continue previous timer

### 2. Organization

#### Projects
- Create/edit/delete projects
- Color coding (16+ colors)
- Project archiving
- Client assignment (optional)
- Billable/non-billable flag
- Project-level hourly rates

#### Labels/Tags
- Multiple labels per time entry
- Color-coded labels
- Quick filter by labels
- Label management

### 3. iOS Shortcuts & Automation

#### Shortcuts Actions
- **Start Timer**: Start timer for specific project
- **Stop Timer**: Stop currently running timer
- **Get Current Timer**: Retrieve running timer info
- **Today's Total**: Get total time tracked today

#### Focus Mode Integration
- Work Focus → Auto-start "Work" project timer
- Focus Off → Auto-stop running timer
- Custom focus modes for different projects
- Background time tracking

### 4. Widgets

#### iOS Widgets
- **Small Widget**: Current timer or "Start Timer" button
- **Medium Widget**: Current timer + today's total + quick actions
- **Large Widget**: Current timer + today's breakdown by project
- Lock screen widgets (circular/rectangular)

#### macOS Widgets
- **Menu Bar Widget**: Always-visible timer
- **Notification Center Widget**: Detailed view with controls
- Widget refresh every 30 seconds for live updates

### 5. Reporting & Analytics

#### Time Views
- **Daily View**: List of entries by date
- **Weekly View**: 7-day breakdown
- **Monthly View**: Calendar view + summary
- **Yearly View**: Monthly totals
- **Custom Range**: Any date range

#### Reports
- **Summary Reports**
  - Total hours tracked
  - Breakdown by project
  - Breakdown by label
  - Billable vs non-billable

- **Visual Analytics**
  - Bar charts (time per project)
  - Pie charts (project distribution)
  - Timeline view (daily activity)
  - Trends over time

#### Export
- CSV export (all entries or filtered)
- PDF reports (formatted summaries)
- JSON export (backup/migration)

### 6. User Management
- Email/password authentication
- Google OAuth (optional)
- Apple Sign-In (for iOS)
- Profile management
- Settings sync across devices

---

## Database Schema (Convex)

### Users
```typescript
{
  _id: Id<"users">,
  email: string,
  name: string,
  avatarUrl?: string,
  timezone: string,
  weekStart: "monday" | "sunday",
  timeFormat: "12h" | "24h",
  createdAt: number,
}
```

### Projects
```typescript
{
  _id: Id<"projects">,
  userId: Id<"users">,
  name: string,
  color: string,
  clientId?: Id<"clients">,
  billable: boolean,
  hourlyRate?: number,
  archived: boolean,
  createdAt: number,
  updatedAt: number,
}
```

### Labels
```typescript
{
  _id: Id<"labels">,
  userId: Id<"users">,
  name: string,
  color: string,
  createdAt: number,
}
```

### TimeEntries
```typescript
{
  _id: Id<"timeEntries">,
  userId: Id<"users">,
  projectId?: Id<"projects">,
  description?: string,
  startTime: number, // Unix timestamp
  endTime?: number,  // null if running
  duration?: number, // in seconds, calculated when stopped
  labelIds: Id<"labels">[],
  billable: boolean,
  createdAt: number,
  updatedAt: number,
}
```

### Clients (Phase 2)
```typescript
{
  _id: Id<"clients">,
  userId: Id<"users">,
  name: string,
  email?: string,
  notes?: string,
  createdAt: number,
}
```

---

## Application Architecture

### Web App (Next.js)
```
/app
  /dashboard          # Main dashboard with running timer
  /entries            # Time entries list/calendar view
  /projects           # Project management
  /labels             # Label management
  /reports            # Analytics and reporting
  /settings           # User settings
  /api                # API routes (if needed)

/components
  /timer              # Timer components
  /entries            # Time entry components
  /reports            # Chart and report components
  /ui                 # Shared UI components

/convex               # Convex backend functions
  /functions          # Queries, mutations, actions
  /schema.ts          # Database schema
```

### iOS/macOS App (Swift)
```
/Time
  /Models             # Data models
  /Views              # SwiftUI views
    /Timer            # Timer interface
    /Entries          # Time entries list
    /Projects         # Project management
    /Reports          # Reports view
  /ViewModels         # View models
  /Services           # API service, Convex client
  /Widgets            # WidgetKit extensions
  /Shortcuts          # App Intents for Shortcuts
  /Shared             # Shared code between iOS/macOS
```

---

## Development Phases

### Phase 1: Foundation (MVP)
**Goal**: Basic time tracking on web with Convex backend

- [ ] Setup project structure
- [ ] Convex setup and authentication
- [ ] Database schema implementation
- [ ] Web app basic UI
- [ ] Timer start/stop/pause
- [ ] Manual time entry
- [ ] Project CRUD operations
- [ ] Basic time entry list view

### Phase 2: iOS App Core
**Goal**: Native iOS app with timer and sync

- [ ] iOS app setup with SwiftUI
- [ ] Convex iOS SDK integration
- [ ] Real-time sync implementation
- [ ] Timer interface
- [ ] Time entries list
- [ ] Project management
- [ ] Authentication flow

### Phase 3: Automation & Widgets
**Goal**: iOS Shortcuts and widgets

- [ ] App Intents implementation
- [ ] Shortcuts actions (start, stop, get status)
- [ ] iOS widgets (small, medium, large)
- [ ] Lock screen widgets
- [ ] Focus mode integration testing

### Phase 4: macOS App
**Goal**: Native macOS app with widgets

- [ ] macOS app (shared code with iOS)
- [ ] Menu bar widget
- [ ] macOS widgets
- [ ] Keyboard shortcuts
- [ ] Native macOS UI adaptations

### Phase 5: Reporting & Analytics
**Goal**: Comprehensive reporting

- [ ] Labels implementation
- [ ] Daily/weekly/monthly views
- [ ] Charts and visualizations
- [ ] Custom date range reports
- [ ] Export functionality (CSV, PDF)

### Phase 6: Polish & Advanced Features
**Goal**: Production-ready app

- [ ] Client management
- [ ] Billable hours tracking
- [ ] Invoice generation
- [ ] Team features (optional)
- [ ] Dark mode
- [ ] Accessibility improvements
- [ ] Performance optimization
- [ ] App Store preparation

---

## Key Technical Considerations

### Real-time Sync
- Convex handles real-time subscriptions automatically
- Web: React hooks for live queries
- iOS/macOS: Combine publishers for reactive updates
- Offline support: Queue mutations when offline, sync when online

### Timer Precision
- Use server timestamps for accuracy
- Local timer UI updates every second
- Reconcile with server on stop
- Handle timezone differences properly

### iOS Background Execution
- Focus Filter API for background triggers
- Background tasks for updating widgets
- Push notifications for timer reminders (optional)

### Widget Updates
- Timeline entries for widget refresh
- Deep links from widgets to app
- Widget configuration (select default project)

### Security
- Convex authentication tokens
- Secure API key storage (Keychain on iOS)
- Row-level security in Convex functions

### Performance
- Pagination for large time entry lists
- Efficient queries with proper indexing
- Image optimization for web
- Lazy loading and code splitting

---

## Development Environment Setup

### Web Setup
```bash
# Initialize Next.js project
npx create-next-app@latest time-web --typescript --tailwind --app

# Install dependencies
npm install convex @clerk/nextjs recharts date-fns

# Install UI components
npx shadcn-ui@latest init
```

### iOS/macOS Setup
```bash
# Create Xcode project
# File > New > Project > Multiplatform App
# Name: Time
# Interface: SwiftUI
# Language: Swift

# Add Convex Swift SDK via SPM
# https://github.com/get-convex/convex-swift
```

### Convex Setup
```bash
# Initialize Convex
npx convex dev

# Deploy
npx convex deploy
```

---

## Success Metrics

### Functionality
- ✅ Timer starts/stops reliably across all devices
- ✅ Real-time sync < 1 second delay
- ✅ Shortcuts integration works with Focus modes
- ✅ Widgets update within 30 seconds
- ✅ Reports generate accurately for any date range

### User Experience
- ✅ Web app loads in < 2 seconds
- ✅ iOS app launches instantly
- ✅ Timer is visible in < 3 taps from any screen
- ✅ Offline mode handles gracefully
- ✅ UI is intuitive without documentation

### Technical
- ✅ 99.9% uptime
- ✅ All data encrypted in transit and at rest
- ✅ No data loss scenarios
- ✅ Scalable to 10,000+ time entries per user
- ✅ Works on iOS 17+, macOS 14+

---

## Resources & References

### Documentation
- [Convex Docs](https://docs.convex.dev)
- [Next.js Docs](https://nextjs.org/docs)
- [SwiftUI Tutorials](https://developer.apple.com/tutorials/swiftui)
- [WidgetKit Documentation](https://developer.apple.com/documentation/widgetkit)
- [App Intents Documentation](https://developer.apple.com/documentation/appintents)

### Inspiration
- Timery app
- Toggl Track
- Clockify
- Hours

---

## Next Steps

1. **Review and Approve Outline**: Make any adjustments to features or tech stack
2. **Setup Development Environment**: Install tools and create projects
3. **Start with Phase 1**: Build web app foundation
4. **Iterate**: Add features incrementally and test on real devices

---

**Last Updated**: January 23, 2026
**Status**: Planning Phase
