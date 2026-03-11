# Time Tracking App - Development Tasks

## Task Management Guide
- Each task has an estimated complexity: `[Easy]`, `[Medium]`, `[Hard]`
- Tasks inside a phase should usually be completed in order
- This plan is intentionally scoped for a personal-use product
- There is no organization or workspace layer; every record belongs directly to one user
- There is no separate project model; folders are the only hierarchy type

---

## Phase 1: Web MVP + Cross-Platform Foundation

**Goal**: Ship a reliable web app first while keeping the backend and data model stable for future iOS and macOS apps.

### 1.1 Repository Foundation
- [x] `[Easy]` Set up the repo as a monorepo
  - `apps/web`
  - `apps/apple` placeholder for future native app work
  - `convex`
  - `packages/shared`
- [x] `[Easy]` Choose and configure the workspace package manager
  - Prefer `pnpm` workspaces for the monorepo
- [x] `[Easy]` Set up TypeScript, ESLint, Prettier, and shared path aliases
- [x] `[Easy]` Create environment variable conventions for web and Convex
- [x] `[Easy]` Create a starter README with setup steps after the first working app shell exists

### 1.2 Web App Setup
- [x] `[Easy]` Initialize Next.js App Router app in `apps/web`
- [x] `[Easy]` Install Tailwind CSS and core utility packages
  - `clsx`
  - `tailwind-merge`
  - `date-fns`
- [x] `[Easy]` Initialize shadcn/ui
- [x] `[Easy]` Create the initial app shell
  - Auth layout
  - Protected app layout
  - Global navigation

### 1.3 Shared Domain Contracts
- [ ] `[Medium]` Create shared TypeScript domain types in `packages/shared`
  - User
  - Folder
  - Label
  - TimeEntry
  - Timer status and segment types
- [ ] `[Medium]` Add shared constants and enums
  - Default colors
  - Time formats
  - Week start options
  - Timer states
- [ ] `[Medium]` Add shared formatting helpers used by the web app

### 1.4 Authentication Foundation
- [ ] `[Medium]` Configure Auth0 for the web app
- [ ] `[Medium]` Enable Google social login in Auth0
- [ ] `[Medium]` Keep email/password login available as a fallback
- [ ] `[Medium]` Connect Auth0 identity to Convex user records
- [ ] `[Medium]` Implement login and sign-up flows
- [ ] `[Easy]` Add protected routes and redirect handling
- [ ] `[Easy]` Add logout flow
- [ ] `[Easy]` Create first-run user provisioning in Convex

### 1.5 Convex Schema
- [ ] `[Hard]` Create `convex/schema.ts`
  - Users table
  - Folders table with `parentFolderId`
  - `Inbox` folder rule
  - Folder `defaultLabelIds`
  - Labels table
  - TimeEntries table with `segments` and timer `status`
- [ ] `[Medium]` Add indexes for common queries
  - By user
  - By folder parent
  - By time range
  - By running or paused timer state
- [ ] `[Medium]` Document invariants in code comments
  - One active timer per user
  - No organization scope
  - Every timer belongs to one folder
  - Every user has one `Inbox` folder

### 1.6 User Queries and Mutations
- [ ] `[Easy]` Add query to fetch current user
- [ ] `[Medium]` Add mutation to update user profile
- [ ] `[Easy]` Add mutation to update user preferences
  - Timezone
  - Time format
  - Week start

### 1.7 Folder Management
- [ ] `[Medium]` Add queries to list root folders and nested folders
- [ ] `[Medium]` Add mutation to create folder
- [ ] `[Medium]` Add mutation to rename folder
- [ ] `[Medium]` Add mutation to move folder under another parent
- [ ] `[Medium]` Add mutation to manage folder default labels
- [ ] `[Medium]` Add logic to resolve inherited labels from the full folder ancestry
- [ ] `[Medium]` Add mutation to archive and unarchive folder
- [ ] `[Hard]` Add folder deletion behavior
  - Move direct child folders to `Inbox`
  - Move timers in the deleted folder to `Inbox`
  - Preserve history

### 1.8 Label Management
- [ ] `[Easy]` Add query to list labels
- [ ] `[Medium]` Add mutation to create label
- [ ] `[Easy]` Add mutation to update label
- [ ] `[Easy]` Add mutation to delete label

### 1.9 Timer Engine
- [ ] `[Hard]` Add query to fetch the current active timer
- [ ] `[Hard]` Add mutation to start a timer
  - Enforce one active timer per user
  - Create the first time segment
  - Default to `Inbox` when no folder is selected
  - Accept title, notes, folder, and labels
  - Apply inherited folder labels automatically
- [ ] `[Hard]` Add mutation to pause a timer
  - Close the current segment
  - Mark entry as `paused`
- [ ] `[Hard]` Add mutation to resume a timer
  - Open a new segment
  - Mark entry as `running`
- [ ] `[Hard]` Add mutation to stop a timer
  - Close the current segment
  - Mark entry as `completed`
  - Compute `durationSeconds`
- [ ] `[Medium]` Add mutation to discard an active timer
- [ ] `[Medium]` Add mutation to continue a previous entry as a new running timer

### 1.10 Manual Entries and Entry CRUD
- [ ] `[Medium]` Add query to list entries by date range
- [ ] `[Medium]` Add query to list recent entries
- [ ] `[Medium]` Add query to list entries with filters
  - Folder
  - Label
  - Date range
- [ ] `[Hard]` Add mutation to create a manual entry with computed duration
- [ ] `[Hard]` Add mutation to edit an existing completed entry
- [ ] `[Easy]` Add mutation to delete an entry

### 1.11 Web UI Foundation
- [ ] `[Easy]` Add core shadcn/ui components
  - Button
  - Input
  - Dialog
  - Select
  - Dropdown Menu
  - Card
  - Table
  - Popover
  - Calendar
  - Command
- [x] `[Medium]` Define a consistent app layout and navigation model
- [ ] `[Medium]` Add reusable empty, loading, and error states

### 1.12 Web Pages
- [x] `[Medium]` Create dashboard page
- [x] `[Medium]` Create entries page
- [x] `[Medium]` Create folders page
- [x] `[Medium]` Create labels page
- [x] `[Easy]` Create settings page

### 1.13 Timer UI
- [ ] `[Hard]` Build the primary timer component
  - Title input
  - Notes input
  - Folder picker
  - Label multi-select
  - Show inherited labels from the selected folder
  - Start, pause, resume, stop, discard controls
- [ ] `[Medium]` Implement live second-by-second timer display
- [ ] `[Medium]` Handle optimistic UI for timer actions
- [ ] `[Medium]` Reconcile timer state with server responses
- [ ] `[Medium]` Add clear error handling for invalid state transitions

### 1.14 Folders UI
- [ ] `[Hard]` Build folder tree UI with nested display
- [ ] `[Easy]` Show the built-in `Inbox` folder clearly
- [ ] `[Medium]` Build folder create and rename dialog
- [ ] `[Medium]` Build folder move flow
- [ ] `[Medium]` Build folder default label management
- [ ] `[Easy]` Add archive filters

### 1.15 Labels UI
- [ ] `[Medium]` Build labels management page
- [ ] `[Medium]` Build label create and edit dialog
- [ ] `[Easy]` Add color picker for labels

### 1.16 Entries UI
- [ ] `[Hard]` Build entries list grouped by date
- [ ] `[Medium]` Build manual entry dialog
- [ ] `[Medium]` Build edit entry dialog
- [ ] `[Medium]` Add filters for folder, label, and date
- [ ] `[Easy]` Add continue action on previous entries
- [ ] `[Medium]` Add pagination or infinite scroll

### 1.17 Basic Personal Reporting
- [ ] `[Medium]` Add dashboard stats for today and this week
- [ ] `[Medium]` Add this month total
- [ ] `[Medium]` Add simple breakdown by folder
- [ ] `[Medium]` Add simple breakdown by label

### 1.18 Non-Goals for the Web MVP
- [ ] `[Easy]` Do not build offline mode for the web app
- [ ] `[Easy]` Do not build billing, invoicing, clients, or organization features
- [ ] `[Easy]` Do not build team or sharing features

### 1.19 Testing and Deployment
- [ ] `[Medium]` Test timer start, pause, resume, stop, and discard flows
- [ ] `[Medium]` Test hierarchy edge cases
  - Nested folder creation
  - Moving folders
  - Deleting folders and moving contents to `Inbox`
  - Applying inherited folder labels from ancestors
- [ ] `[Medium]` Test auth and user provisioning flow
- [ ] `[Easy]` Test Google login end-to-end
- [ ] `[Medium]` Test date and timezone handling
- [ ] `[Easy]` Fix TypeScript and lint errors
- [ ] `[Easy]` Test responsive layouts
- [ ] `[Medium]` Add error boundaries
- [ ] `[Easy]` Deploy web app and Convex backend

---

## Phase 2: iOS App Core

**Goal**: Reuse the same backend and timer model in a native iPhone app.

### 2.1 Native App Foundation
- [ ] `[Easy]` Create the SwiftUI iOS project in `apps/apple`
- [ ] `[Easy]` Mirror the domain vocabulary from the web app
- [ ] `[Medium]` Connect the app to Convex
- [ ] `[Medium]` Implement the same Auth0 auth flow for iOS

### 2.2 iOS Core Features
- [ ] `[Hard]` Build timer screen with start, pause, resume, and stop
- [ ] `[Medium]` Build folder browsing
- [ ] `[Medium]` Build labels support
- [ ] `[Medium]` Build entries list and manual entry creation
- [ ] `[Medium]` Verify real-time sync with the web app

---

## Phase 3: macOS App and Apple Automation

**Goal**: Extend the same model to desktop Apple workflows without backend redesign.

### 3.1 macOS App
- [ ] `[Medium]` Add a macOS target
- [ ] `[Medium]` Adapt navigation and layouts for macOS
- [ ] `[Medium]` Reuse the same timer, entry, and organization model

### 3.2 Automation and Widgets
- [ ] `[Medium]` Add App Intents for start, pause, resume, and stop
- [ ] `[Medium]` Add widgets for current timer and daily total
- [ ] `[Hard]` Add Focus mode integration after the base app is stable

---

## Phase 4: Reporting, Export, and Refinement

**Goal**: Improve long-term usefulness for personal tracking.

### 4.1 Reporting
- [ ] `[Medium]` Add better daily, weekly, and monthly reporting views
- [ ] `[Medium]` Add richer folder and label breakdowns

### 4.2 Export
- [ ] `[Medium]` Add CSV export
- [ ] `[Easy]` Add JSON export
- [ ] `[Easy]` Skip PDF unless it becomes genuinely useful

### 4.3 Quality
- [ ] `[Medium]` Improve accessibility
- [ ] `[Medium]` Improve performance for large entry histories
- [ ] `[Medium]` Add observability and error tracking

---

## Open Product Decisions
- [x] Timers can start with an empty title
- [x] There is no separate project model; folders are the only hierarchy type
- [x] Deleting a folder moves contents to `Inbox`
- [ ] Decide whether archived folders should still appear in filters by default
- [x] Default labels from parent folders cascade into child folders

---

## Success Checklist

### Web MVP
- [ ] Authentication works reliably
- [ ] Google login works reliably
- [ ] The app enforces one active timer per user
- [ ] Timer start, pause, resume, and stop work correctly
- [ ] Folders, sub-folders, and labels can be managed cleanly
- [ ] Inherited folder labels are applied correctly to timers
- [ ] Entries can be created manually and edited later
- [ ] The app is good enough for daily personal use

### Foundation
- [ ] No organization model exists anywhere in the schema or UI
- [ ] The backend schema can be reused for iOS and macOS
- [ ] The web app does not require major backend redesign before native apps begin

---

**Last Updated**: March 11, 2026
**Status**: Planning Phase - Revised for personal-use web MVP
