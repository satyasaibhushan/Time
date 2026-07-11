import SwiftUI

struct SettingsView: View {
    @Bindable var store: ConvexTimerStore
    let onLogout: () -> Void

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    TerraPageHeader(
                        kicker: "Account / setup",
                        title: "Keep Tempo yours.",
                        subtitle: "Your account, synchronization status, and widget setup in one quiet place."
                    )

                    profileCard
                    syncCard
                    widgetCard

                    Button(role: .destructive, action: onLogout) {
                        Label("Sign Out", systemImage: "rectangle.portrait.and.arrow.right")
                            .font(.subheadline.weight(.bold))
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 13)
                    }
                    .buttonStyle(.bordered)
                    .buttonBorderShape(.capsule)
                    .tint(TimeTheme.destructive)
                }
                .padding(.horizontal, 18)
                .padding(.bottom, 36)
            }
            .background(TimeTheme.canvas.ignoresSafeArea())
            .navigationTitle("Setup")
            .navigationBarTitleDisplayMode(.inline)
            .toolbarBackground(TimeTheme.canvas, for: .navigationBar)
        }
    }

    private var profileCard: some View {
        HStack(spacing: 14) {
            AsyncImage(url: store.profile?.avatarUrl.flatMap(URL.init(string:))) { image in
                image.resizable().scaledToFill()
            } placeholder: {
                Text(initial)
                    .font(.title3.bold())
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .background(TimeTheme.clay)
            }
            .frame(width: 54, height: 54)
            .clipShape(Circle())

            VStack(alignment: .leading, spacing: 4) {
                Text(store.profile?.name ?? "Tempo user")
                    .font(.headline)
                    .foregroundStyle(TimeTheme.ink)
                Text(store.profile?.email ?? "Signed in with Auth0")
                    .font(.caption)
                    .foregroundStyle(TimeTheme.sage)
                    .lineLimit(1)
            }
            Spacer()
        }
        .terraSurface()
    }

    private var initial: String {
        String((store.profile?.name ?? store.profile?.email ?? "T").prefix(1)).uppercased()
    }

    private var syncCard: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack {
                Label("Convex sync", systemImage: "checkmark.icloud.fill")
                    .font(.headline)
                    .foregroundStyle(TimeTheme.ink)
                Spacer()
                Text("LIVE")
                    .font(.caption2.bold())
                    .tracking(1)
                    .foregroundStyle(TimeTheme.moss)
                    .padding(.horizontal, 9)
                    .padding(.vertical, 5)
                    .background(TimeTheme.muted, in: Capsule())
            }

            HStack {
                Metric(value: "\(store.timers.count)", label: "Active")
                Divider().frame(height: 34)
                Metric(value: "\(store.completedEntries.count)", label: "Entries")
                Divider().frame(height: 34)
                Metric(value: "\(store.activeFolders.count)", label: "Folders")
                Divider().frame(height: 34)
                Metric(value: "\(store.labels.count)", label: "Labels")
            }
        }
        .terraSurface()
    }

    private var widgetCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            Label("Home Screen widgets", systemImage: "rectangle.3.group.fill")
                .font(.headline)
                .foregroundStyle(TimeTheme.ink)
            Text("Add the compact widget for the current timer, or the wide summary widget for a filtered day, week, or month.")
                .font(.subheadline)
                .foregroundStyle(TimeTheme.mutedInk)
            Text("Long-press the Home Screen → Edit → Add Widget → Tempo")
                .font(.caption.weight(.semibold))
                .foregroundStyle(TimeTheme.moss)
        }
        .terraSurface()
    }
}

private struct Metric: View {
    let value: String
    let label: String

    var body: some View {
        VStack(spacing: 3) {
            Text(value)
                .font(.headline.monospacedDigit())
                .foregroundStyle(TimeTheme.ink)
            Text(label)
                .font(.caption2)
                .foregroundStyle(TimeTheme.sage)
        }
        .frame(maxWidth: .infinity)
    }
}
