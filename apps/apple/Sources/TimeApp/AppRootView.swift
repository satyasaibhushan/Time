import SwiftUI

struct AppRootView: View {
    @State private var store = LocalTimerStore()

    var body: some View {
        TabView {
            TimerDashboardView(store: store)
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
