import SwiftUI

struct AppRootView: View {
    @State private var session = AppSession()

    var body: some View {
        Group {
            switch session.phase {
            case .loading:
                ProgressView("Connecting to Time…")
                    .tint(TimeTheme.accent)
            case .signedOut:
                LoginView(session: session)
            case .signedIn:
                if let store = session.timerStore {
                    authenticatedApp(store: store)
                } else {
                    ProgressView("Loading your timers…")
                }
            }
        }
        .task {
            await session.restoreIfNeeded()
        }
    }

    private func authenticatedApp(store: ConvexTimerStore) -> some View {
        TabView {
            TimerDashboardView(
                store: store,
                onLogout: { Task { await session.logout() } }
            )
            .tabItem {
                Label("Timers", systemImage: "timer")
            }

            PlaceholderView(
                title: "Entries",
                message: "Your completed sessions will live here.",
                systemImage: "list.bullet.rectangle"
            )
            .tabItem {
                Label("Entries", systemImage: "list.bullet.rectangle")
            }

            PlaceholderView(
                title: "Organize",
                message: "Folders and labels are coming next.",
                systemImage: "folder"
            )
            .tabItem {
                Label("Organize", systemImage: "folder")
            }
        }
        .tint(TimeTheme.accent)
    }
}

private struct LoginView: View {
    let session: AppSession

    var body: some View {
        VStack(spacing: 24) {
            Image(systemName: "timer")
                .font(.system(size: 56, weight: .light))
                .foregroundStyle(TimeTheme.accent)

            VStack(spacing: 8) {
                Text("Time")
                    .font(.system(.largeTitle, design: .rounded, weight: .bold))
                    .foregroundStyle(TimeTheme.ink)
                Text("Sign in to sync timers across the web, iPhone, and widgets.")
                    .multilineTextAlignment(.center)
                    .foregroundStyle(TimeTheme.mutedInk)
            }

            if let errorMessage = session.errorMessage {
                Text(errorMessage)
                    .font(.footnote)
                    .foregroundStyle(.red)
                    .multilineTextAlignment(.center)
            }

            Button {
                Task { await session.login() }
            } label: {
                Label("Continue with Auth0", systemImage: "person.crop.circle.badge.checkmark")
                    .font(.headline)
                    .padding(.horizontal, 22)
                    .padding(.vertical, 14)
            }
            .buttonStyle(.borderedProminent)
            .tint(TimeTheme.accent)
        }
        .padding(32)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(TimeTheme.canvas.ignoresSafeArea())
    }
}
private struct PlaceholderView: View {
    let title: String
    let message: String
    let systemImage: String

    var body: some View {
        NavigationStack {
            ContentUnavailableView(title, systemImage: systemImage, description: Text(message))
                .navigationTitle(title)
        }
    }
}
