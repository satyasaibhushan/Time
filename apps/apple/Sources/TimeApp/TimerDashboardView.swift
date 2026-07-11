import SwiftUI
import TimeCore

struct TimerDashboardView: View {
    @Bindable var store: LocalTimerStore

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    summary
                    startComposer
                    timerList
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 32)
            }
            .background(TimeTheme.canvas.ignoresSafeArea())
            .navigationTitle("Time")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Settings", systemImage: "gearshape") {}
                        .labelStyle(.iconOnly)
                        .foregroundStyle(TimeTheme.ink)
                }
            }
        }
    }

    private var summary: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Make the next hour count.")
                .font(.system(.title2, design: .rounded, weight: .bold))
                .foregroundStyle(TimeTheme.ink)

            Text(summaryText)
                .font(.subheadline)
                .foregroundStyle(TimeTheme.mutedInk)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.top, 8)
    }

    private var summaryText: String {
        switch store.runningCount {
        case 0:
            "Nothing is running. Start with one clear intention."
        case 1:
            "One timer is moving with you."
        default:
            "\(store.runningCount) timers are moving on the same second."
        }
    }

    private var startComposer: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("START A TIMER")
                .font(.caption.weight(.bold))
                .tracking(1.4)
                .foregroundStyle(TimeTheme.mutedInk)

            TextField("What are you working on?", text: $store.draftTitle)
                .font(.body.weight(.medium))
                .textInputAutocapitalization(.sentences)
                .submitLabel(.go)
                .onSubmit { store.startTimer() }

            HStack {
                Label("Inbox", systemImage: "tray")
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(TimeTheme.mutedInk)

                Spacer()

                Button {
                    store.startTimer()
                } label: {
                    Label("Start", systemImage: "play.fill")
                        .frame(minWidth: 76)
                }
                .buttonStyle(PrimaryCapsuleButtonStyle())
            }
        }
        .padding(20)
        .background(TimeTheme.surface, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
        .overlay {
            RoundedRectangle(cornerRadius: 24, style: .continuous)
                .stroke(TimeTheme.line, lineWidth: 1)
        }
    }

    @ViewBuilder
    private var timerList: some View {
        if store.timers.isEmpty {
            VStack(spacing: 12) {
                Image(systemName: "timer")
                    .font(.system(size: 32, weight: .light))
                Text("Your active timers will appear here.")
                    .font(.subheadline.weight(.medium))
            }
            .foregroundStyle(TimeTheme.mutedInk)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 48)
        } else {
            TimelineView(.periodic(from: .now, by: 1)) { context in
                LazyVStack(spacing: 16) {
                    ForEach(store.timers) { timer in
                        TimerCard(
                            timer: timer,
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
}
private struct TimerCard: View {
    let timer: TimeEntry
    let now: Date
    let onToggle: () -> Void
    let onStop: () -> Void
    let onDiscard: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 22) {
            HStack(spacing: 8) {
                Circle()
                    .fill(timer.status == .running ? TimeTheme.gold : TimeTheme.mutedInk)
                    .frame(width: 8, height: 8)

                Text(timer.status == .running ? "TRACKING NOW" : "PAUSED")
                    .font(.caption.weight(.bold))
                    .tracking(1.2)
            }
            .foregroundStyle(TimeTheme.softGreen)

            Text(elapsed.formattedTimer)
                .font(.system(size: 52, weight: .medium, design: .rounded))
                .monospacedDigit()
                .contentTransition(.numericText())

            Text(timer.title.isEmpty ? "Untitled session" : timer.title)
                .font(.headline)
                .italic(timer.title.isEmpty)
                .foregroundStyle(timer.title.isEmpty ? TimeTheme.softGreen : Color.white.opacity(0.92))

            HStack(spacing: 12) {
                Label("Inbox", systemImage: "tray")
                    .font(.caption.weight(.bold))
                    .padding(.horizontal, 12)
                    .padding(.vertical, 7)
                    .background(TimeTheme.gold, in: Capsule())
                    .foregroundStyle(TimeTheme.ink)

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

                Button(role: .destructive, action: onDiscard) {
                    Image(systemName: "trash")
                }
                .foregroundStyle(TimeTheme.softGreen)
            }
        }
        .foregroundStyle(Color.white.opacity(0.94))
        .padding(22)
        .background(TimeTheme.timerSurface, in: RoundedRectangle(cornerRadius: 28, style: .continuous))
    }

    private var elapsed: Int {
        let milliseconds = Int64((now.timeIntervalSince1970 * 1_000).rounded(.down))
        return TimerMath.elapsedSeconds(for: timer, at: milliseconds)
    }
}

private struct PrimaryCapsuleButtonStyle: ButtonStyle {
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
            .padding(.horizontal, 16)
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

private extension Int {
    var formattedTimer: String {
        let hours = self / 3_600
        let minutes = self % 3_600 / 60
        let seconds = self % 60
        return String(format: "%02d:%02d:%02d", hours, minutes, seconds)
    }
}
