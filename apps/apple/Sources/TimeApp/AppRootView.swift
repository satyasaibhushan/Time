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
            TimerDashboardView(store: store)
            .tabItem {
                Label("Now", systemImage: "gauge.with.dots.needle.50percent")
            }

            EntriesView(store: store)
            .tabItem {
                Label("Log", systemImage: "book.closed")
            }

            FoldersView(store: store)
            .tabItem {
                Label("Folders", systemImage: "folder")
            }

            LabelsView(store: store)
            .tabItem {
                Label("Labels", systemImage: "tag")
            }

            SettingsView(
                store: store,
                onLogout: { Task { await session.logout() } }
            )
            .tabItem {
                Label("Setup", systemImage: "gearshape")
            }
        }
        .tint(TimeTheme.accent)
        .toolbarBackground(TimeTheme.surface, for: .tabBar)
        .alert("Something went wrong", isPresented: errorBinding(for: store)) {
            Button("OK") { store.clearError() }
        } message: {
            Text(store.errorMessage ?? "Please try again.")
        }
    }

    private func errorBinding(for store: ConvexTimerStore) -> Binding<Bool> {
        Binding(
            get: { store.errorMessage != nil },
            set: { if !$0 { store.clearError() } }
        )
    }
}

private struct LoginView: View {
    let session: AppSession

    var body: some View {
        VStack(spacing: 26) {
            Image(systemName: "timer")
                .font(.system(size: 56, weight: .light))
                .foregroundStyle(TimeTheme.accent)

            VStack(spacing: 10) {
                Text("Tempo")
                    .font(.system(.largeTitle, design: .rounded, weight: .bold))
                    .foregroundStyle(TimeTheme.ink)
                Text("Pick up where you left off.")
                    .font(.system(.title2, design: .serif, weight: .semibold))
                    .foregroundStyle(TimeTheme.ink)
                Text("Log in or create an account to keep your timers and history synced across web and iPhone.")
                    .multilineTextAlignment(.center)
                    .foregroundStyle(TimeTheme.mutedInk)
                    .fixedSize(horizontal: false, vertical: true)
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
                HStack {
                    Text("Continue to Tempo")
                    Spacer()
                    Image(systemName: "arrow.up.right")
                }
                .frame(maxWidth: .infinity)
            }
            .buttonStyle(PrimaryCapsuleButtonStyle())
            .frame(maxWidth: 360)
        }
        .padding(32)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(TimeTheme.canvas.ignoresSafeArea())
    }
}
