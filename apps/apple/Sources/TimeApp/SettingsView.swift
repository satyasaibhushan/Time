import SwiftUI
import TimeCore

struct SettingsView: View {
    @Bindable var store: ConvexTimerStore
    let onLogout: () -> Void
    @State private var editingProfile = false
    @State private var editingPreferences = false
    @State private var name = ""
    @State private var email = ""
    @State private var timezone = ""
    @State private var weekStart = WeekStart.monday
    @State private var timeFormat = TimeFormat.twentyFourHour

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    #if os(macOS)
                    TerraPageHeader(
                        kicker: "System / setup",
                        title: "Tune the instrument.",
                        subtitle: "Personal settings that shape how the app displays time and organizes your day."
                    )

                    LazyVGrid(
                        columns: [GridItem(.flexible()), GridItem(.flexible())],
                        alignment: .leading,
                        spacing: 20
                    ) {
                        macProfileCard
                        macPreferencesCard
                    }

                    macAccountCard
                    widgetCard
                    #else
                    TerraPageHeader(
                        kicker: "Account / setup",
                        title: "Keep Tempo yours.",
                        subtitle: setupSubtitle
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
                    #endif
                }
                .padding(.horizontal, 18)
                .padding(.bottom, 36)
            }
            .background(TimeTheme.canvas.ignoresSafeArea())
            .navigationTitle("Setup")
            .timeNavigationChrome()
            .onAppear(perform: syncDrafts)
            .onChange(of: store.profile) { _, _ in
                if !editingProfile && !editingPreferences { syncDrafts() }
            }
        }
    }

    #if os(macOS)
    private var macProfileCard: some View {
        VStack(alignment: .leading, spacing: 20) {
            settingsCardHeader(
                title: "Profile",
                subtitle: "Your display name and email.",
                editing: editingProfile,
                action: { editingProfile = true }
            )

            if editingProfile {
                TerraLabeledTextField(label: "Name", text: $name)
                TerraLabeledTextField(label: "Email", text: $email)
                settingsActions(
                    cancel: {
                        syncDrafts()
                        editingProfile = false
                    },
                    save: {
                        Task {
                            if await store.updateProfile(name: name, email: email) {
                                editingProfile = false
                            }
                        }
                    }
                )
            } else {
                TerraReadout(label: "Name", value: store.profile?.name ?? "Not set")
                TerraReadout(label: "Email", value: store.profile?.email ?? "Not set")
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .terraSurface(padding: 22)
    }

    private var macPreferencesCard: some View {
        VStack(alignment: .leading, spacing: 20) {
            settingsCardHeader(
                title: "Preferences",
                subtitle: "Timezone, time format, and week start.",
                editing: editingPreferences,
                action: { editingPreferences = true }
            )

            if editingPreferences {
                TerraLabeledTextField(label: "Timezone", text: $timezone)
                TerraChoiceField(
                    label: "Time Format",
                    options: [
                        ("24h", TimeFormat.twentyFourHour),
                        ("12h", TimeFormat.twelveHour),
                    ],
                    selection: $timeFormat
                )
                TerraChoiceField(
                    label: "Week Start",
                    options: [
                        ("Monday", WeekStart.monday),
                        ("Sunday", WeekStart.sunday),
                    ],
                    selection: $weekStart
                )
                settingsActions(
                    cancel: {
                        syncDrafts()
                        editingPreferences = false
                    },
                    save: {
                        Task {
                            if await store.updatePreferences(
                                timezone: timezone,
                                timeFormat: timeFormat,
                                weekStart: weekStart
                            ) {
                                editingPreferences = false
                            }
                        }
                    }
                )
            } else {
                TerraReadout(label: "Timezone", value: store.profile?.timezone ?? TimeZone.current.identifier)
                TerraReadout(label: "Time Format", value: store.profile?.timeFormat.rawValue ?? "24h")
                TerraReadout(label: "Week Start", value: (store.profile?.weekStart.rawValue ?? "monday").capitalized)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .terraSurface(padding: 22)
    }

    private var macAccountCard: some View {
        VStack(alignment: .leading, spacing: 20) {
            VStack(alignment: .leading, spacing: 6) {
                Text("Account")
                    .font(.system(size: 18, weight: .medium))
                    .foregroundStyle(TimeTheme.ink)
                Text("Auth provider and session management.")
                    .font(.subheadline)
                    .foregroundStyle(TimeTheme.sage)
            }

            HStack {
                TerraReadout(label: "Provider", value: "Auth0 (Google + Email)")
                Button("Log out", action: onLogout)
                    .buttonStyle(TerraOutlineButtonStyle())
            }
        }
        .terraSurface(padding: 22)
    }

    private func settingsCardHeader(
        title: String,
        subtitle: String,
        editing: Bool,
        action: @escaping () -> Void
    ) -> some View {
        HStack(alignment: .top) {
            VStack(alignment: .leading, spacing: 6) {
                Text(title)
                    .font(.system(size: 18, weight: .medium))
                    .foregroundStyle(TimeTheme.ink)
                Text(subtitle)
                    .font(.subheadline)
                    .foregroundStyle(TimeTheme.sage)
            }
            Spacer()
            if !editing {
                Button(action: action) {
                    Label("Edit", systemImage: "pencil")
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(TimeTheme.sage)
                }
                .buttonStyle(.plain)
            }
        }
    }

    private func settingsActions(cancel: @escaping () -> Void, save: @escaping () -> Void) -> some View {
        HStack(spacing: 8) {
            Button(action: cancel) {
                Label("Cancel", systemImage: "xmark")
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(TerraOutlineButtonStyle())
            .disabled(store.isMutating)

            Button(action: save) {
                Label("Save", systemImage: "checkmark")
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(PrimaryCapsuleButtonStyle())
            .disabled(store.isMutating)
        }
    }
    #endif

    private func syncDrafts() {
        name = store.profile?.name ?? ""
        email = store.profile?.email ?? ""
        timezone = store.profile?.timezone ?? TimeZone.current.identifier
        weekStart = store.profile?.weekStart ?? .monday
        timeFormat = store.profile?.timeFormat ?? .twentyFourHour
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
            Label(widgetTitle, systemImage: "rectangle.3.group.fill")
                .font(.headline)
                .foregroundStyle(TimeTheme.ink)
            Text(widgetDescription)
                .font(.subheadline)
                .foregroundStyle(TimeTheme.mutedInk)
            Text(widgetInstruction)
                .font(.caption.weight(.semibold))
                .foregroundStyle(TimeTheme.moss)
        }
        .terraSurface()
    }

    private var setupSubtitle: String {
        #if os(macOS)
        "Your account, synchronization status, and widget setup in one quiet place."
        #else
        "Your account, synchronization status, and widget setup in one quiet place."
        #endif
    }

    private var widgetTitle: String {
        #if os(macOS)
        "Desktop widgets"
        #else
        "Home Screen widgets"
        #endif
    }

    private var widgetDescription: String {
        #if os(macOS)
        "Add the compact current-timer widget or a configurable day, week, or month summary to your desktop."
        #else
        "Add the compact widget for the current timer, or the wide summary widget for a filtered day, week, or month."
        #endif
    }

    private var widgetInstruction: String {
        #if os(macOS)
        "Control-click the desktop → Edit Widgets → Tempo"
        #else
        "Long-press the Home Screen → Edit → Add Widget → Tempo"
        #endif
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

#if os(macOS)
private struct TerraReadout: View {
    let label: String
    let value: String

    var body: some View {
        VStack(alignment: .leading, spacing: 5) {
            Text(label.uppercased())
                .font(.system(size: 11, weight: .semibold))
                .tracking(1)
                .foregroundStyle(TimeTheme.sage)
            Text(value)
                .font(.subheadline)
                .foregroundStyle(TimeTheme.ink)
                .lineLimit(1)
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 12)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(TimeTheme.muted.opacity(0.5), in: RoundedRectangle(cornerRadius: 16, style: .continuous))
        .overlay {
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .stroke(TimeTheme.line, lineWidth: 1)
        }
    }
}

private struct TerraLabeledTextField: View {
    let label: String
    @Binding var text: String

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(label.uppercased())
                .font(.system(size: 11, weight: .semibold))
                .tracking(1)
                .foregroundStyle(TimeTheme.sage)
            TextField(label, text: $text)
                .textFieldStyle(.plain)
                .font(.subheadline)
                .foregroundStyle(TimeTheme.ink)
                .padding(.horizontal, 14)
                .frame(height: 40)
                .background(TimeTheme.muted.opacity(0.5), in: RoundedRectangle(cornerRadius: 12, style: .continuous))
                .overlay {
                    RoundedRectangle(cornerRadius: 12, style: .continuous)
                        .stroke(TimeTheme.line, lineWidth: 1)
                }
        }
    }
}

private struct TerraChoiceField<Value: Hashable>: View {
    let label: String
    let options: [(String, Value)]
    @Binding var selection: Value

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(label.uppercased())
                .font(.system(size: 11, weight: .semibold))
                .tracking(1)
                .foregroundStyle(TimeTheme.sage)
            HStack(spacing: 8) {
                ForEach(Array(options.enumerated()), id: \.offset) { _, option in
                    Button {
                        selection = option.1
                    } label: {
                        Text(option.0)
                            .font(.subheadline.weight(.medium))
                            .foregroundStyle(selection == option.1 ? TimeTheme.moss : TimeTheme.mutedInk)
                            .frame(maxWidth: .infinity)
                            .frame(height: 38)
                            .background(
                                selection == option.1 ? TimeTheme.moss.opacity(0.1) : TimeTheme.surface,
                                in: RoundedRectangle(cornerRadius: 12, style: .continuous)
                            )
                            .overlay {
                                RoundedRectangle(cornerRadius: 12, style: .continuous)
                                    .stroke(
                                        selection == option.1 ? TimeTheme.moss.opacity(0.3) : TimeTheme.line,
                                        lineWidth: 1
                                    )
                            }
                    }
                    .buttonStyle(.plain)
                }
            }
        }
    }
}

private struct TerraOutlineButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.subheadline.weight(.medium))
            .foregroundStyle(TimeTheme.ink)
            .padding(.horizontal, 16)
            .padding(.vertical, 10)
            .background(
                configuration.isPressed ? TimeTheme.secondary : TimeTheme.surface,
                in: RoundedRectangle(cornerRadius: 12, style: .continuous)
            )
            .overlay {
                RoundedRectangle(cornerRadius: 12, style: .continuous)
                    .stroke(TimeTheme.line, lineWidth: 1)
            }
    }
}
#endif
