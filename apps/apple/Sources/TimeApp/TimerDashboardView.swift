import SwiftUI
import TimeCore

struct TimerDashboardView: View {
    @Bindable var store: ConvexTimerStore
    @State private var notes = ""
    @State private var selectedFolderId: DocumentID?
    @State private var selectedLabelIds: Set<DocumentID> = []
    @State private var showingOptions = false
    @State private var timerTickAnchor = TimerMath.nextWholeSecondBoundary(after: .now)

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 22) {
                    header
                    startComposer
                    timerList
                    recentEntries
                }
                .padding(.horizontal, 18)
                .padding(.bottom, 36)
            }
            .background(TimeTheme.canvas.ignoresSafeArea())
            .toolbarBackground(TimeTheme.canvas, for: .navigationBar)
            .navigationTitle("Tempo")
            .navigationBarTitleDisplayMode(.inline)
            .alert("Couldn’t update timer", isPresented: errorBinding) {
                Button("OK") { store.clearError() }
            } message: {
                Text(store.errorMessage ?? "Please try again.")
            }
        }
    }

    private var errorBinding: Binding<Bool> {
        Binding(
            get: { store.errorMessage != nil },
            set: { if !$0 { store.clearError() } }
        )
    }

    private var header: some View {
        TerraPageHeader(
            kicker: Date.now.formatted(.dateTime.weekday(.wide).day().month(.wide)),
            title: greeting,
            subtitle: todaySeconds > 0
                ? "\(TimeText.duration(todaySeconds)) recorded so far today."
                : "Nothing recorded yet today — the first session sets the tone."
        )
        .padding(.top, 8)
    }

    private var greeting: String {
        let hour = Calendar.current.component(.hour, from: .now)
        let greeting = switch hour {
        case 0..<5: "Up late"
        case 5..<12: "Good morning"
        case 12..<18: "Good afternoon"
        default: "Good evening"
        }
        let firstName = store.profile?.name?.split(separator: " ").first.map(String.init)
        return firstName.map { "\(greeting), \($0)." } ?? "\(greeting)."
    }

    private var todaySeconds: Int {
        let calendar = Calendar.current
        let completed = store.completedEntries
            .filter { calendar.isDateInToday(Date(milliseconds: $0.startedAt)) }
            .reduce(0) { $0 + ($1.durationSeconds ?? 0) }
        let now = Int64((Date.now.timeIntervalSince1970 * 1_000).rounded(.down))
        let active = store.timers
            .filter { calendar.isDateInToday(Date(milliseconds: $0.startedAt)) }
            .reduce(0) { $0 + TimerMath.elapsedSeconds(for: $1, at: now) }
        return completed + active
    }

    private var startComposer: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Text("START A TIMER")
                    .font(.caption.weight(.bold))
                    .tracking(1.4)
                    .foregroundStyle(TimeTheme.sage)
                Spacer()
                liveStatus
            }

            TextField("What are you working on?", text: $store.draftTitle, axis: .vertical)
                .font(.body.weight(.semibold))
                .foregroundStyle(TimeTheme.ink)
                .textInputAutocapitalization(.sentences)
                .submitLabel(.go)
                .onSubmit(start)

            if showingOptions {
                TextField("Notes (optional)", text: $notes, axis: .vertical)
                    .font(.subheadline)
                    .lineLimit(2...4)

                FolderPicker(folders: store.activeFolders, selection: $selectedFolderId)

                DisclosureGroup("Labels · \(selectedLabelIds.count) selected") {
                    VStack(spacing: 12) {
                        LabelSelectionList(labels: store.labels, selection: $selectedLabelIds)
                    }
                    .padding(.top, 10)
                }
                .font(.subheadline.weight(.semibold))
                .tint(TimeTheme.moss)
            }

            HStack(spacing: 10) {
                Button {
                    withAnimation(.easeInOut(duration: 0.2)) { showingOptions.toggle() }
                } label: {
                    Label(folderName, systemImage: "slider.horizontal.3")
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(TimeTheme.mutedInk)
                }
                .buttonStyle(.plain)

                Spacer()

                Button(action: start) {
                    Label("Start", systemImage: "play.fill")
                        .frame(minWidth: 76)
                }
                .buttonStyle(PrimaryCapsuleButtonStyle())
                .disabled(store.isMutating)
            }
        }
        .terraSurface(padding: 20)
    }

    private var liveStatus: some View {
        HStack(spacing: 6) {
            Circle()
                .fill(store.runningCount > 0 ? TimeTheme.gold : TimeTheme.line)
                .frame(width: 7, height: 7)
            Text(store.runningCount > 0 ? "\(store.runningCount) live" : "Idle")
        }
        .font(.caption.weight(.bold))
        .foregroundStyle(store.runningCount > 0 ? TimeTheme.mutedInk : TimeTheme.sage)
        .padding(.horizontal, 9)
        .padding(.vertical, 5)
        .background(TimeTheme.muted, in: Capsule())
    }

    private var folderName: String {
        store.folder(for: selectedFolderId)?.name ?? "Inbox"
    }

    private func start() {
        let title = store.draftTitle
        store.draftTitle = ""
        Task {
            let success = await store.startTimer(
                title: title,
                notes: notes,
                folderId: selectedFolderId,
                labelIds: selectedLabelIds
            )
            if success {
                notes = ""
                selectedFolderId = nil
                selectedLabelIds = []
                showingOptions = false
            } else {
                store.draftTitle = title
            }
        }
    }

    @ViewBuilder
    private var timerList: some View {
        if store.timers.isEmpty {
            TerraEmptyState(
                icon: "timer",
                title: "No active timers",
                message: "Start with one clear intention. Multiple timers will stay on the same second."
            )
            .terraSurface()
        } else {
            TimelineView(.periodic(from: timerTickAnchor, by: 1)) { context in
                LazyVStack(spacing: 14) {
                    ForEach(store.timers) { timer in
                        TimerCard(
                            timer: timer,
                            folderName: store.folder(for: timer.folderId)?.name ?? "Inbox",
                            now: context.date,
                            onToggle: { store.toggleTimer(timer) },
                            onStop: { store.stopTimer(timer) },
                            onDiscard: { store.discardTimer(timer) }
                        )
                    }
                }
            }
        }
    }

    @ViewBuilder
    private var recentEntries: some View {
        if !store.completedEntries.isEmpty {
            VStack(alignment: .leading, spacing: 12) {
                Text("RECENTLY RECORDED")
                    .font(.caption.weight(.bold))
                    .tracking(1.3)
                    .foregroundStyle(TimeTheme.sage)

                ForEach(store.completedEntries.prefix(3)) { entry in
                    HStack(spacing: 12) {
                        VStack(alignment: .leading, spacing: 4) {
                            Text(entry.title.isEmpty ? "Untitled session" : entry.title)
                                .font(.subheadline.weight(.semibold))
                                .foregroundStyle(TimeTheme.ink)
                                .lineLimit(1)
                            Text(Date(milliseconds: entry.startedAt).formatted(date: .abbreviated, time: .shortened))
                                .font(.caption)
                                .foregroundStyle(TimeTheme.sage)
                        }
                        Spacer()
                        Text(TimeText.compactDuration(entry.durationSeconds ?? 0))
                            .font(.caption.monospacedDigit().weight(.bold))
                            .foregroundStyle(TimeTheme.mutedInk)
                    }
                    if entry.id != store.completedEntries.prefix(3).last?.id {
                        Divider().overlay(TimeTheme.line)
                    }
                }
            }
            .terraSurface()
        }
    }
}

private struct TimerCard: View {
    let timer: TimeEntry
    let folderName: String
    let now: Date
    let onToggle: () -> Void
    let onStop: () -> Void
    let onDiscard: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 20) {
            HStack(spacing: 8) {
                Circle()
                    .fill(timer.status == .running ? TimeTheme.gold : TimeTheme.sage)
                    .frame(width: 8, height: 8)
                Text(timer.status == .running ? "TRACKING NOW" : "PAUSED")
                    .font(.caption.weight(.bold))
                    .tracking(1.2)
                Spacer()
                Menu {
                    Button("Discard Timer", systemImage: "trash", role: .destructive, action: onDiscard)
                } label: {
                    Image(systemName: "ellipsis")
                        .foregroundStyle(TimeTheme.softGreen)
                        .frame(width: 32, height: 32)
                }
            }
            .foregroundStyle(TimeTheme.softGreen)

            Text(TimeText.duration(elapsed))
                .font(.system(size: 50, weight: .medium, design: .rounded))
                .monospacedDigit()
                .contentTransition(.numericText())

            VStack(alignment: .leading, spacing: 9) {
                Text(timer.title.isEmpty ? "Untitled session" : timer.title)
                    .font(.headline)
                    .italic(timer.title.isEmpty)
                    .foregroundStyle(timer.title.isEmpty ? TimeTheme.softGreen : Color.white.opacity(0.94))
                HStack {
                    TerraBadge(text: folderName, color: TimeTheme.gold, icon: "folder.fill")
                    Spacer()
                    Button(action: onToggle) {
                        Label(
                            timer.status == .running ? "Pause" : "Resume",
                            systemImage: timer.status == .running ? "pause.fill" : "play.fill"
                        )
                    }
                    .buttonStyle(SecondaryCapsuleButtonStyle())
                    Button(action: onStop) {
                        Image(systemName: "stop.fill")
                    }
                    .buttonStyle(LightCircleButtonStyle())
                }
            }
        }
        .foregroundStyle(Color.white.opacity(0.94))
        .padding(22)
        .background {
            RoundedRectangle(cornerRadius: 28, style: .continuous)
                .fill(TimeTheme.timerSurface)
                .overlay(alignment: .topTrailing) {
                    Circle()
                        .fill(TimeTheme.gold.opacity(0.18))
                        .frame(width: 150, height: 150)
                        .blur(radius: 26)
                        .offset(x: 55, y: -65)
                }
        }
        .clipShape(RoundedRectangle(cornerRadius: 28, style: .continuous))
    }

    private var elapsed: Int {
        let milliseconds = Int64((now.timeIntervalSince1970 * 1_000).rounded(.down))
        return TimerMath.elapsedSeconds(for: timer, at: milliseconds)
    }
}

struct PrimaryCapsuleButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.subheadline.weight(.bold))
            .padding(.horizontal, 18)
            .padding(.vertical, 12)
            .foregroundStyle(Color.white)
            .background(TimeTheme.accent.opacity(configuration.isPressed ? 0.76 : 1), in: Capsule())
            .scaleEffect(configuration.isPressed ? 0.97 : 1)
    }
}

private struct SecondaryCapsuleButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.subheadline.weight(.bold))
            .padding(.horizontal, 14)
            .padding(.vertical, 11)
            .foregroundStyle(Color.white)
            .background(Color.white.opacity(configuration.isPressed ? 0.12 : 0.2), in: Capsule())
    }
}

private struct LightCircleButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .frame(width: 42, height: 42)
            .foregroundStyle(TimeTheme.ink)
            .background(Color.white.opacity(configuration.isPressed ? 0.7 : 0.94), in: Circle())
    }
}
