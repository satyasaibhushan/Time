# Time Tracking App - Development Tasks

## Task Management Guide
- Each task has an estimated complexity: `[Easy]`, `[Medium]`, `[Hard]`
- Tasks within a phase should generally be completed in order
- Some tasks can be done in parallel (marked with `||`)
- Check off tasks as you complete them

---

## Phase 1: Foundation (MVP) - Web App

**Goal**: Get a functioning web app with basic time tracking and Convex backend.

### 1.1 Project Setup
- [ ] `[Easy]` Initialize Next.js 14+ project with TypeScript, TailwindCSS, App Router
- [ ] `[Easy]` Setup project structure (folders: app, components, lib, types)
- [ ] `[Easy]` Install core dependencies (date-fns, clsx, tailwind-merge)
- [ ] `[Easy]` Setup ESLint and Prettier configurations
- [ ] `[Easy]` Create initial Git repository and .gitignore
- [ ] `[Easy]` Setup environment variables (.env.local)

### 1.2 Convex Backend Setup
- [ ] `[Easy]` Install Convex: `npm install convex`
- [ ] `[Easy]` Initialize Convex: `npx convex dev`
- [ ] `[Medium]` Create database schema (convex/schema.ts)
  - Define Users table
  - Define Projects table
  - Define Labels table
  - Define TimeEntries table
- [ ] `[Medium]` Setup Convex authentication (Clerk or Convex Auth)
- [ ] `[Easy]` Configure Convex client in Next.js app
- [ ] `[Easy]` Test Convex connection and authentication flow

### 1.3 Authentication & User Management
- [ ] `[Medium]` Implement sign up page/flow
- [ ] `[Medium]` Implement login page/flow
- [ ] `[Easy]` Create protected route middleware
- [ ] `[Medium]` Build user profile page
- [ ] `[Easy]` Implement logout functionality
- [ ] `[Easy]` Add user settings (timezone, time format, week start)

### 1.4 Database Functions (Convex)

#### User Functions
- [ ] `[Easy]` `queries/users.ts`: Get current user
- [ ] `[Medium]` `mutations/users.ts`: Update user profile
- [ ] `[Easy]` `mutations/users.ts`: Update user settings

#### Project Functions
- [ ] `[Easy]` `queries/projects.ts`: List all projects for user
- [ ] `[Easy]` `queries/projects.ts`: Get single project by ID
- [ ] `[Medium]` `mutations/projects.ts`: Create project
- [ ] `[Medium]` `mutations/projects.ts`: Update project
- [ ] `[Easy]` `mutations/projects.ts`: Delete project
- [ ] `[Easy]` `mutations/projects.ts`: Archive/unarchive project

#### Time Entry Functions
- [ ] `[Medium]` `queries/timeEntries.ts`: List time entries (with pagination)
- [ ] `[Medium]` `queries/timeEntries.ts`: Get running timer
- [ ] `[Medium]` `queries/timeEntries.ts`: Get entries by date range
- [ ] `[Hard]` `mutations/timeEntries.ts`: Start timer
  - Check for existing running timer
  - Create new entry with current timestamp
- [ ] `[Medium]` `mutations/timeEntries.ts`: Stop timer
  - Calculate duration
  - Update end time
- [ ] `[Medium]` `mutations/timeEntries.ts`: Create manual entry
- [ ] `[Medium]` `mutations/timeEntries.ts`: Update entry
- [ ] `[Easy]` `mutations/timeEntries.ts`: Delete entry

### 1.5 UI Components Library
- [ ] `[Easy]` Install Shadcn/ui: `npx shadcn-ui@latest init`
- [ ] `[Easy]` Add Button component: `npx shadcn-ui@latest add button`
- [ ] `[Easy]` Add Input component: `npx shadcn-ui@latest add input`
- [ ] `[Easy]` Add Dialog component: `npx shadcn-ui@latest add dialog`
- [ ] `[Easy]` Add Select component: `npx shadcn-ui@latest add select`
- [ ] `[Easy]` Add Card component: `npx shadcn-ui@latest add card`
- [ ] `[Easy]` Add Table component: `npx shadcn-ui@latest add table`
- [ ] `[Easy]` Add Dropdown Menu: `npx shadcn-ui@latest add dropdown-menu`
- [ ] `[Easy]` Add Calendar: `npx shadcn-ui@latest add calendar`
- [ ] `[Easy]` Add Popover: `npx shadcn-ui@latest add popover`

### 1.6 Timer Interface
- [ ] `[Medium]` Create Timer component (components/timer/Timer.tsx)
  - Display: project, description, running time
  - Buttons: start, stop, discard
- [ ] `[Medium]` Implement live timer counter (updates every second)
- [ ] `[Medium]` Create project selector dropdown for timer
- [ ] `[Easy]` Add description input field
- [ ] `[Hard]` Connect timer to Convex mutations (start/stop)
- [ ] `[Medium]` Handle edge cases (duplicate start, stop without running timer)
- [ ] `[Easy]` Add loading states and error handling
- [ ] `[Medium]` Display today's total time tracked

### 1.7 Dashboard Page
- [ ] `[Easy]` Create dashboard layout (app/dashboard/page.tsx)
- [ ] `[Medium]` Add Timer component to dashboard
- [ ] `[Medium]` Create "Recent Entries" section (last 10 entries)
- [ ] `[Easy]` Add quick stats (today's total, this week's total)
- [ ] `[Medium]` Implement real-time updates (Convex subscriptions)
- [ ] `[Easy]` Add empty states (no projects, no entries)

### 1.8 Projects Management
- [ ] `[Medium]` Create projects page (app/projects/page.tsx)
- [ ] `[Medium]` Build project list component
  - Show project name, color, entry count
  - Archive/delete actions
- [ ] `[Hard]` Create project dialog/modal
  - Name input
  - Color picker (16 colors)
  - Billable toggle
  - Hourly rate input (optional)
- [ ] `[Medium]` Implement create project
- [ ] `[Medium]` Implement edit project
- [ ] `[Easy]` Implement delete project (with confirmation)
- [ ] `[Easy]` Implement archive/unarchive project
- [ ] `[Easy]` Add project search/filter

### 1.9 Time Entries List
- [ ] `[Hard]` Create entries page (app/entries/page.tsx)
- [ ] `[Medium]` Build time entry list component
  - Group by date
  - Show description, project, duration
  - Edit/delete actions
- [ ] `[Medium]` Implement pagination or infinite scroll
- [ ] `[Hard]` Create manual entry dialog
  - Project selector
  - Description input
  - Start date/time picker
  - End date/time picker
  - Duration display (calculated)
- [ ] `[Medium]` Implement edit entry dialog (reuse manual entry form)
- [ ] `[Easy]` Implement delete entry (with confirmation)
- [ ] `[Medium]` Add date range filter
- [ ] `[Medium]` Add project filter
- [ ] `[Easy]` Add "Continue" action (start new timer with same project/description)

### 1.10 Testing & Polish
- [ ] `[Medium]` Test all CRUD operations
- [ ] `[Medium]` Test timer start/stop in various scenarios
- [ ] `[Easy]` Fix any TypeScript errors
- [ ] `[Medium]` Add loading skeletons for async operations
- [ ] `[Easy]` Test responsive design (mobile, tablet, desktop)
- [ ] `[Medium]` Add error boundaries
- [ ] `[Easy]` Improve error messages
- [ ] `[Easy]` Deploy to Vercel (or similar)

---

## Phase 2: iOS App Core

**Goal**: Native iOS app with core time tracking functionality and real-time sync.

### 2.1 iOS Project Setup
- [ ] `[Easy]` Create new Xcode project (iOS App, SwiftUI, Swift)
- [ ] `[Easy]` Setup project structure (Models, Views, ViewModels, Services)
- [ ] `[Easy]` Configure app bundle ID, team, capabilities
- [ ] `[Easy]` Setup .gitignore for Xcode
- [ ] `[Easy]` Create Git repository (or add to monorepo)

### 2.2 Convex iOS Integration
- [ ] `[Medium]` Add Convex Swift SDK via Swift Package Manager
  - URL: https://github.com/get-convex/convex-swift
- [ ] `[Medium]` Create ConvexService.swift (singleton)
- [ ] `[Medium]` Setup Convex client configuration
- [ ] `[Medium]` Implement authentication flow (match web auth)
- [ ] `[Hard]` Test real-time subscriptions with Combine
- [ ] `[Medium]` Create NetworkManager for handling offline/online states

### 2.3 Data Models
- [ ] `[Easy]` Create User.swift model
- [ ] `[Easy]` Create Project.swift model
- [ ] `[Easy]` Create Label.swift model
- [ ] `[Easy]` Create TimeEntry.swift model
- [ ] `[Medium]` Add Codable conformance for all models
- [ ] `[Easy]` Create helper extensions (DateFormatter, Duration formatting)

### 2.4 Authentication Views
- [ ] `[Medium]` Create LoginView.swift
- [ ] `[Medium]` Create SignUpView.swift
- [ ] `[Medium]` Create AuthViewModel.swift
  - Handle login
  - Handle signup
  - Handle logout
  - Persist auth state
- [ ] `[Easy]` Create SplashView.swift (loading/auth check)
- [ ] `[Medium]` Setup navigation flow (authenticated vs unauthenticated)

### 2.5 Timer Interface (iOS)
- [ ] `[Hard]` Create TimerView.swift
  - Large running timer display
  - Project selector
  - Description field
  - Start/stop/pause buttons
- [ ] `[Medium]` Create TimerViewModel.swift
  - Manage timer state
  - Start/stop/pause logic
  - Real-time updates via Combine
- [ ] `[Medium]` Implement live timer updates (1-second intervals)
- [ ] `[Medium]` Create project picker sheet
- [ ] `[Easy]` Add haptic feedback for interactions
- [ ] `[Medium]` Connect to Convex mutations
- [ ] `[Medium]` Handle offline mode (queue actions)

### 2.6 Main Navigation
- [ ] `[Medium]` Create TabView with 4 tabs:
  - Timer
  - Entries
  - Projects
  - Profile
- [ ] `[Easy]` Add SF Symbols icons for each tab
- [ ] `[Easy]` Setup navigation coordinator (if needed)

### 2.7 Time Entries List (iOS)
- [ ] `[Hard]` Create EntriesView.swift
  - Grouped list by date
  - Show project color, description, duration
  - Swipe actions (edit, delete)
- [ ] `[Medium]` Create EntriesViewModel.swift
  - Fetch entries from Convex
  - Real-time updates
  - Pagination
- [ ] `[Medium]` Create EntryRow.swift component
- [ ] `[Medium]` Create date section headers
- [ ] `[Medium]` Add pull-to-refresh
- [ ] `[Easy]` Add empty state view

### 2.8 Manual Entry Form (iOS)
- [ ] `[Hard]` Create ManualEntryView.swift (sheet)
  - Project picker
  - Description field
  - Start date/time pickers
  - End date/time pickers
  - Duration display (auto-calculated)
  - Save/cancel buttons
- [ ] `[Medium]` Create ManualEntryViewModel.swift
- [ ] `[Medium]` Add validation (start < end, etc.)
- [ ] `[Easy]` Add date picker with calendar style
- [ ] `[Medium]` Implement create and update modes

### 2.9 Projects Management (iOS)
- [ ] `[Medium]` Create ProjectsView.swift
  - List of projects with colors
  - Add button in navigation
  - Swipe actions (edit, archive, delete)
- [ ] `[Medium]` Create ProjectsViewModel.swift
- [ ] `[Medium]` Create ProjectFormView.swift (sheet)
  - Name field
  - Color picker
  - Billable toggle
  - Hourly rate field
- [ ] `[Easy]` Create color picker component (16 colors)
- [ ] `[Medium]` Connect to Convex mutations
- [ ] `[Easy]` Add confirmation dialog for delete

### 2.10 Profile & Settings (iOS)
- [ ] `[Medium]` Create ProfileView.swift
  - User info display
  - Settings section
  - Logout button
- [ ] `[Easy]` Create SettingsView.swift
  - Timezone picker
  - Time format (12h/24h)
  - Week start (Mon/Sun)
- [ ] `[Medium]` Create ProfileViewModel.swift
- [ ] `[Medium]` Connect settings to Convex user updates

### 2.11 Real-time Sync & Polish
- [ ] `[Hard]` Test real-time sync across web and iOS
- [ ] `[Medium]` Implement offline queue (store mutations locally)
- [ ] `[Medium]` Add sync indicator in UI
- [ ] `[Easy]` Add loading states throughout app
- [ ] `[Medium]` Handle network errors gracefully
- [ ] `[Easy]` Test on physical iPhone
- [ ] `[Medium]` Optimize performance (lazy loading, caching)

---

## Phase 3: Automation & Widgets

**Goal**: iOS Shortcuts integration and home/lock screen widgets.

### 3.1 App Intents Setup
- [ ] `[Easy]` Create AppIntents folder in Xcode project
- [ ] `[Easy]` Add App Intents framework
- [ ] `[Medium]` Create AppIntentsService.swift

### 3.2 Shortcuts Actions
- [ ] `[Hard]` Create StartTimerIntent.swift
  - Parameters: project (optional), description (optional)
  - Execute: Start timer via Convex
  - Return: Success message with running timer info
- [ ] `[Medium]` Create StopTimerIntent.swift
  - Execute: Stop running timer
  - Return: Stopped entry info (duration, project)
- [ ] `[Medium]` Create GetCurrentTimerIntent.swift
  - Return: Running timer info or "No timer running"
- [ ] `[Medium]` Create GetTodayTotalIntent.swift
  - Return: Total time tracked today
- [ ] `[Easy]` Test all intents in Shortcuts app

### 3.3 App Shortcuts
- [ ] `[Medium]` Create AppShortcutsProvider.swift
- [ ] `[Easy]` Define default shortcuts
  - "Start work timer"
  - "Stop timer"
  - "Today's time"
- [ ] `[Easy]` Add app shortcuts to Siri suggestions

### 3.4 Focus Filter Integration
- [ ] `[Hard]` Implement Focus Filter for automatic triggering
- [ ] `[Medium]` Create FocusFilterService.swift
- [ ] `[Medium]` Map Focus modes to projects
  - Work Focus → Work project
  - Personal Focus → Personal project
- [ ] `[Hard]` Handle background timer start/stop
- [ ] `[Medium]` Test with various Focus modes

### 3.5 Widget Extension Setup
- [ ] `[Easy]` Add Widget Extension target to Xcode project
- [ ] `[Easy]` Name: "TimeWidgets"
- [ ] `[Easy]` Share data between app and widget (App Groups)
- [ ] `[Medium]` Setup Convex client in widget extension
- [ ] `[Medium]` Create shared WidgetDataService.swift

### 3.6 Widget - Small Size
- [ ] `[Hard]` Create SmallTimerWidget.swift
  - Display running timer (or "Start Timer")
  - Circular progress indicator (optional)
  - Deep link to app
- [ ] `[Medium]` Create TimelineProvider for small widget
- [ ] `[Medium]` Implement widget refresh (every 30s when running)
- [ ] `[Easy]` Design widget UI (colors, fonts)

### 3.7 Widget - Medium Size
- [ ] `[Hard]` Create MediumTimerWidget.swift
  - Running timer + project name
  - Today's total time
  - Quick actions (start/stop buttons)
- [ ] `[Medium]` Create TimelineProvider for medium widget
- [ ] `[Easy]` Add deep links for quick actions

### 3.8 Widget - Large Size
- [ ] `[Hard]` Create LargeTimerWidget.swift
  - Running timer
  - Today's breakdown by project (list)
  - Total time today
- [ ] `[Medium]` Create TimelineProvider for large widget
- [ ] `[Medium]` Fetch today's entries grouped by project

### 3.9 Lock Screen Widgets (iOS 16+)
- [ ] `[Medium]` Create CircularTimerWidget.swift
  - Circular progress with duration
- [ ] `[Medium]` Create RectangularTimerWidget.swift
  - Inline timer display
- [ ] `[Easy]` Test lock screen widget placement

### 3.10 Widget Configuration & Polish
- [ ] `[Medium]` Add widget configuration (select default project)
- [ ] `[Medium]` Implement widget intents for configuration
- [ ] `[Easy]` Add placeholder views for empty states
- [ ] `[Easy]` Test widgets in all sizes
- [ ] `[Medium]` Optimize widget refresh strategy
- [ ] `[Easy]` Add widget previews in Xcode

---

## Phase 4: macOS App

**Goal**: Native macOS app with menu bar widget and native experience.

### 4.1 macOS Project Setup
- [ ] `[Easy]` Add macOS target to existing Xcode project
- [ ] `[Easy]` Configure shared code between iOS and macOS
- [ ] `[Easy]` Setup macOS-specific assets (app icon)
- [ ] `[Easy]` Configure macOS bundle ID and capabilities

### 4.2 Shared Code Organization
- [ ] `[Medium]` Move shared views to Shared folder
- [ ] `[Medium]` Move ViewModels to Shared (already platform-agnostic)
- [ ] `[Medium]` Move Models to Shared
- [ ] `[Medium]` Create platform-specific view modifiers
- [ ] `[Easy]` Test builds for both iOS and macOS

### 4.3 macOS-Specific UI Adaptations
- [ ] `[Hard]` Adapt TimerView for macOS (larger screen)
- [ ] `[Medium]` Create macOS navigation (sidebar + detail view)
- [ ] `[Medium]` Adapt EntriesView for macOS table
- [ ] `[Medium]` Adapt ProjectsView for macOS list
- [ ] `[Easy]` Update button styles for macOS
- [ ] `[Medium]` Add keyboard shortcuts (⌘N for new, ⌘T for timer, etc.)

### 4.4 Menu Bar Widget
- [ ] `[Hard]` Create MenuBarWidget target (macOS Widget Extension)
- [ ] `[Hard]` Implement StatusBarController.swift
  - Always-visible timer in menu bar
  - Click to show popover with controls
- [ ] `[Medium]` Create MenuBarPopoverView.swift
  - Running timer display
  - Start/stop buttons
  - Quick access to today's entries
  - "Open App" button
- [ ] `[Medium]` Implement timer updates in menu bar (every 1s)
- [ ] `[Easy]` Add custom menu bar icon

### 4.5 macOS Notification Center Widget
- [ ] `[Medium]` Create NotificationCenterWidget.swift
- [ ] `[Medium]` Implement small/medium/large variants
- [ ] `[Medium]` Share timeline providers with iOS widgets
- [ ] `[Easy]` Test widget in Notification Center

### 4.6 macOS Native Features
- [ ] `[Medium]` Implement Touch Bar support (if applicable)
- [ ] `[Medium]` Add drag & drop for time entries (reorder)
- [ ] `[Easy]` Add macOS context menus (right-click)
- [ ] `[Medium]` Implement macOS keyboard navigation
- [ ] `[Easy]` Add Cmd+Q to quit, Cmd+W to close window

### 4.7 Testing & Polish
- [ ] `[Medium]` Test on multiple macOS versions
- [ ] `[Easy]` Test menu bar widget persistence
- [ ] `[Medium]` Optimize memory usage (menu bar app should be lightweight)
- [ ] `[Easy]` Add macOS app icon
- [ ] `[Medium]` Create macOS installer/DMG

---

## Phase 5: Reporting & Analytics

**Goal**: Comprehensive time reporting with charts and exports.

### 5.1 Labels Implementation

#### Backend (Convex)
- [ ] `[Easy]` `queries/labels.ts`: List all labels for user
- [ ] `[Medium]` `mutations/labels.ts`: Create label
- [ ] `[Easy]` `mutations/labels.ts`: Update label
- [ ] `[Easy]` `mutations/labels.ts`: Delete label

#### Web UI
- [ ] `[Medium]` Create labels page (app/labels/page.tsx)
- [ ] `[Medium]` Create label list component
- [ ] `[Medium]` Create label dialog (name, color)
- [ ] `[Easy]` Add label color picker
- [ ] `[Medium]` Implement CRUD operations for labels

#### Timer Updates
- [ ] `[Medium]` Add label selector to timer (multi-select)
- [ ] `[Medium]` Add label selector to manual entry form
- [ ] `[Easy]` Display labels on time entry rows
- [ ] `[Medium]` Update iOS timer with label selector
- [ ] `[Medium]` Update iOS manual entry with label selector

### 5.2 Reports Page Foundation (Web)
- [ ] `[Medium]` Create reports page (app/reports/page.tsx)
- [ ] `[Medium]` Create date range selector component
  - Quick filters (Today, This Week, This Month, This Year)
  - Custom range picker
- [ ] `[Medium]` Create report filter component
  - Filter by project
  - Filter by label
  - Filter by billable status
- [ ] `[Medium]` Create summary stats component
  - Total hours
  - Billable hours
  - Number of entries

### 5.3 Convex Analytics Queries
- [ ] `[Hard]` `queries/analytics.ts`: Get time by project
  - Parameters: userId, startDate, endDate, filters
  - Return: Array of {project, totalSeconds}
- [ ] `[Hard]` `queries/analytics.ts`: Get time by label
  - Return: Array of {label, totalSeconds}
- [ ] `[Hard]` `queries/analytics.ts`: Get daily breakdown
  - Return: Array of {date, totalSeconds, projects}
- [ ] `[Medium]` `queries/analytics.ts`: Get weekly summary
- [ ] `[Medium]` `queries/analytics.ts`: Get monthly summary
- [ ] `[Medium]` `queries/analytics.ts`: Get yearly summary

### 5.4 Charts & Visualizations (Web)
- [ ] `[Easy]` Install Recharts: `npm install recharts`
- [ ] `[Hard]` Create bar chart component (time per project)
- [ ] `[Medium]` Create pie chart component (project distribution)
- [ ] `[Hard]` Create timeline chart component (daily activity)
- [ ] `[Medium]` Create line chart component (trends over time)
- [ ] `[Easy]` Add chart tooltips and legends
- [ ] `[Medium]` Make charts responsive

### 5.5 Detailed Reports Views (Web)
- [ ] `[Hard]` Create DailyReportView.tsx
  - List entries by day
  - Show total per day
  - Expandable to see individual entries
- [ ] `[Hard]` Create WeeklyReportView.tsx
  - 7-day calendar grid
  - Daily totals
  - Week total
- [ ] `[Hard]` Create MonthlyReportView.tsx
  - Calendar view with daily totals
  - Month summary
- [ ] `[Medium]` Create YearlyReportView.tsx
  - Monthly breakdown
  - Year total
- [ ] `[Hard]` Create CustomRangeReportView.tsx
  - Flexible grouping (by day, week, month)
  - Summary cards

### 5.6 Export Functionality

#### Backend
- [ ] `[Hard]` `actions/export.ts`: Generate CSV export
  - All entries or filtered
  - Columns: Date, Start, End, Duration, Project, Description, Labels
- [ ] `[Hard]` `actions/export.ts`: Generate PDF report
  - Summary stats
  - Charts as images
  - Detailed breakdown
- [ ] `[Easy]` `actions/export.ts`: Generate JSON backup

#### Web UI
- [ ] `[Medium]` Add export button to reports page
- [ ] `[Medium]` Create export dialog
  - Select format (CSV, PDF, JSON)
  - Apply current filters
  - Download button
- [ ] `[Medium]` Implement CSV download
- [ ] `[Hard]` Implement PDF generation (use jsPDF or similar)
- [ ] `[Easy]` Implement JSON download

### 5.7 iOS Reports
- [ ] `[Hard]` Create ReportsView.swift (iOS)
- [ ] `[Medium]` Create date range picker (iOS native)
- [ ] `[Medium]` Create summary cards (total time, entries count)
- [ ] `[Medium]` Create project breakdown list
- [ ] `[Easy]` Add tap to see project details
- [ ] `[Medium]` Implement share functionality (export to CSV)

### 5.8 macOS Reports
- [ ] `[Medium]` Adapt ReportsView for macOS
- [ ] `[Medium]` Add chart library for macOS (Swift Charts)
- [ ] `[Hard]` Implement bar charts in macOS
- [ ] `[Medium]` Add export to CSV/PDF on macOS

---

## Phase 6: Polish & Advanced Features

**Goal**: Production-ready app with advanced features and optimizations.

### 6.1 Client Management

#### Backend
- [ ] `[Easy]` Create Clients schema in Convex
- [ ] `[Easy]` `queries/clients.ts`: List clients
- [ ] `[Medium]` `mutations/clients.ts`: CRUD operations
- [ ] `[Medium]` Update Projects schema to include clientId
- [ ] `[Medium]` Update queries to include client info

#### Web UI
- [ ] `[Medium]` Create clients page
- [ ] `[Medium]` Create client list component
- [ ] `[Medium]` Create client form dialog
- [ ] `[Medium]` Add client selector to project form
- [ ] `[Medium]` Show client on project list

#### Mobile
- [ ] `[Medium]` Create ClientsView (iOS/macOS)
- [ ] `[Medium]` Create client form sheet
- [ ] `[Medium]` Update project form with client picker

### 6.2 Billable Hours & Invoicing
- [ ] `[Medium]` Add hourly rate to projects (already in schema)
- [ ] `[Hard]` Calculate billable amount in reports
- [ ] `[Medium]` Create invoice generation feature
  - Select date range
  - Select client
  - Generate PDF invoice
  - Include time breakdown
  - Include total amount
- [ ] `[Medium]` Add invoice history/tracking (optional)

### 6.3 Dark Mode
- [ ] `[Easy]` Implement dark mode on web (Tailwind dark: variants)
- [ ] `[Easy]` Add theme toggle in settings
- [ ] `[Easy]` Persist theme preference
- [ ] `[Easy]` Implement dark mode on iOS (automatic with SwiftUI)
- [ ] `[Easy]` Update widget designs for dark mode
- [ ] `[Easy]` Test all screens in dark mode

### 6.4 Accessibility
- [ ] `[Medium]` Add ARIA labels to web app
- [ ] `[Medium]` Test keyboard navigation on web
- [ ] `[Easy]` Test screen reader compatibility (web)
- [ ] `[Medium]` Add VoiceOver support on iOS
- [ ] `[Easy]` Increase touch target sizes (iOS)
- [ ] `[Medium]` Test with iOS accessibility features (larger text, high contrast)
- [ ] `[Medium]` Add accessibility labels to all images/icons

### 6.5 Performance Optimization
- [ ] `[Medium]` Implement pagination for large time entry lists
- [ ] `[Medium]` Add indexes to Convex schema for common queries
- [ ] `[Medium]` Optimize real-time subscriptions (unsubscribe when not needed)
- [ ] `[Easy]` Add image optimization (Next.js Image component)
- [ ] `[Medium]` Implement code splitting on web
- [ ] `[Medium]` Lazy load heavy components (charts, reports)
- [ ] `[Medium]` Profile iOS app performance (Instruments)
- [ ] `[Easy]` Reduce widget extension memory usage

### 6.6 Error Handling & Logging
- [ ] `[Medium]` Implement global error boundary (web)
- [ ] `[Medium]` Add error logging service (Sentry or similar)
- [ ] `[Medium]` Add analytics (PostHog, Mixpanel, or similar)
- [ ] `[Easy]` Improve error messages throughout app
- [ ] `[Medium]` Add retry logic for failed mutations
- [ ] `[Easy]` Add toast notifications for errors

### 6.7 Testing
- [ ] `[Medium]` Write unit tests for Convex functions
- [ ] `[Medium]` Write integration tests for web app
- [ ] `[Hard]` Setup E2E tests with Playwright
- [ ] `[Medium]` Write unit tests for iOS ViewModels
- [ ] `[Medium]` Write UI tests for iOS (XCTest)
- [ ] `[Easy]` Test edge cases (timezones, DST, leap years)

### 6.8 Documentation
- [ ] `[Easy]` Write user guide (how to use the app)
- [ ] `[Easy]` Document iOS Shortcuts setup
- [ ] `[Easy]` Document Focus mode integration
- [ ] `[Medium]` Create API documentation (if exposing API)
- [ ] `[Easy]` Write developer setup guide (README)
- [ ] `[Easy]` Add code comments for complex logic

### 6.9 App Store Preparation
- [ ] `[Medium]` Create App Store screenshots (iOS)
- [ ] `[Easy]` Write App Store description
- [ ] `[Easy]` Create app preview video (optional)
- [ ] `[Easy]` Setup App Store Connect
- [ ] `[Easy]` Configure app pricing (free or paid)
- [ ] `[Medium]` Submit for App Review (iOS)
- [ ] `[Medium]` Repeat for macOS App Store

### 6.10 Deployment & Launch
- [ ] `[Easy]` Setup production Convex deployment
- [ ] `[Easy]` Deploy web app to production (Vercel)
- [ ] `[Medium]` Setup monitoring (uptime, errors)
- [ ] `[Easy]` Configure custom domain for web app
- [ ] `[Medium]` Setup CI/CD pipeline (GitHub Actions)
- [ ] `[Easy]` Prepare launch announcement
- [ ] `[Easy]` Soft launch to beta testers
- [ ] `[Easy]` Public launch

---

## Optional Future Enhancements

### Team Features (Multi-user collaboration)
- [ ] `[Hard]` Team/workspace concept
- [ ] `[Hard]` Invite team members
- [ ] `[Medium]` Team-level projects and reports
- [ ] `[Medium]` Permissions and roles

### Advanced Automation
- [ ] `[Medium]` Auto-detect idle time and prompt to discard
- [ ] `[Medium]` Location-based triggers (geofencing)
- [ ] `[Hard]` Calendar integration (auto-start timers from calendar events)
- [ ] `[Medium]` Slack/Discord integration

### AI Features
- [ ] `[Hard]` Auto-categorize time entries with AI
- [ ] `[Medium]` Smart project suggestions
- [ ] `[Medium]` Time tracking insights and recommendations

### Additional Platforms
- [ ] `[Hard]` Android app (React Native or native)
- [ ] `[Medium]` Browser extension (Chrome, Firefox)
- [ ] `[Easy]` Apple Watch companion app

---

## Success Checklist

### Core Functionality
- [ ] Timer starts and stops reliably
- [ ] Real-time sync works across all devices (< 1s delay)
- [ ] Manual time entries can be created/edited/deleted
- [ ] Projects and labels can be managed
- [ ] Reports generate accurate data

### iOS Integration
- [ ] Shortcuts actions work correctly
- [ ] Focus mode triggers timer automatically
- [ ] Widgets update in near real-time
- [ ] App works offline and syncs when online

### Quality Assurance
- [ ] No data loss scenarios
- [ ] All screens are responsive
- [ ] Dark mode works everywhere
- [ ] Accessibility features work
- [ ] App is performant (no lag or jank)

### Production Readiness
- [ ] Web app deployed and accessible
- [ ] iOS app approved on App Store
- [ ] macOS app approved on Mac App Store
- [ ] Documentation complete
- [ ] Monitoring and error tracking active

---

**Last Updated**: January 23, 2026
**Total Estimated Tasks**: 350+
**Status**: Planning Phase
