import Foundation
import Observation
import TimeCore
import WidgetKit

@MainActor
@Observable
final class LocalTimerStore {
    var draftTitle = ""
    private(set) var timers: [TimeEntry]
    private(set) var completedEntries: [TimeEntry]

    init(timers: [TimeEntry] = [], completedEntries: [TimeEntry] = []) {
        self.timers = timers
        self.completedEntries = completedEntries
        publishWidgetSnapshot()
    }

    var runningCount: Int {
        timers.count { $0.status == .running }
    }

    func startTimer(now: Date = .now) {
        let timestamp = now.wholeSecondMilliseconds
        let trimmedTitle = draftTitle.trimmingCharacters(in: .whitespacesAndNewlines)
        let timer = TimeEntry(
            id: UUID().uuidString,
            userId: "local-user",
            title: trimmedTitle,
            status: .running,
            segments: [TimeSegment(startTime: timestamp)],
            startedAt: timestamp,
            createdAt: timestamp,
            updatedAt: timestamp
        )

        timers.insert(timer, at: 0)
        draftTitle = ""
        publishWidgetSnapshot(now: now)
    }

    func toggleTimer(_ timer: TimeEntry, now: Date = .now) {
        let timestamp = now.wholeSecondMilliseconds

        switch timer.status {
        case .running:
            update(timer) { entry in
                TimeEntry(
                    id: entry.id,
                    creationTime: entry.creationTime,
                    userId: entry.userId,
                    folderId: entry.folderId,
                    title: entry.title,
                    notes: entry.notes,
                    manualLabelIds: entry.manualLabelIds,
                    status: .paused,
                    segments: closingLastSegment(in: entry.segments, at: timestamp),
                    startedAt: entry.startedAt,
                    endedAt: entry.endedAt,
                    durationSeconds: entry.durationSeconds,
                    createdAt: entry.createdAt,
                    updatedAt: timestamp
                )
            }
        case .paused:
            update(timer) { entry in
                TimeEntry(
                    id: entry.id,
                    creationTime: entry.creationTime,
                    userId: entry.userId,
                    folderId: entry.folderId,
                    title: entry.title,
                    notes: entry.notes,
                    manualLabelIds: entry.manualLabelIds,
                    status: .running,
                    segments: entry.segments + [TimeSegment(startTime: timestamp)],
                    startedAt: entry.startedAt,
                    endedAt: entry.endedAt,
                    durationSeconds: entry.durationSeconds,
                    createdAt: entry.createdAt,
                    updatedAt: timestamp
                )
            }
        case .completed:
            break
        }

        publishWidgetSnapshot(now: now)
    }

    func stopTimer(_ timer: TimeEntry, now: Date = .now) {
        let timestamp = now.wholeSecondMilliseconds

        update(timer) { entry in
            let segments = closingLastSegment(in: entry.segments, at: timestamp)
            return TimeEntry(
                id: entry.id,
                creationTime: entry.creationTime,
                userId: entry.userId,
                folderId: entry.folderId,
                title: entry.title,
                notes: entry.notes,
                manualLabelIds: entry.manualLabelIds,
                status: .completed,
                segments: segments,
                startedAt: entry.startedAt,
                endedAt: timestamp,
                durationSeconds: TimerMath.elapsedSeconds(for: segments, at: timestamp),
                createdAt: entry.createdAt,
                updatedAt: timestamp
            )
        }

        let stoppedTimers = timers.filter { $0.status == .completed }
        completedEntries.insert(contentsOf: stoppedTimers, at: 0)
        timers.removeAll { $0.status == .completed }
        publishWidgetSnapshot(now: now)
    }

    func discardTimer(_ timer: TimeEntry) {
        timers.removeAll { $0.id == timer.id }
        publishWidgetSnapshot()
    }

    private func update(
        _ timer: TimeEntry,
        transform: (TimeEntry) -> TimeEntry
    ) {
        guard let index = timers.firstIndex(where: { $0.id == timer.id }) else {
            return
        }

        timers[index] = transform(timers[index])
    }

    private func closingLastSegment(
        in segments: [TimeSegment],
        at timestamp: Int64
    ) -> [TimeSegment] {
        guard let last = segments.last, last.endTime == nil else {
            return segments
        }

        return segments.dropLast() + [TimeSegment(startTime: last.startTime, endTime: timestamp)]
    }

    private func publishWidgetSnapshot(now: Date = .now) {
        let nowMilliseconds = now.wholeSecondMilliseconds
        let activeSnapshots = timers.map { timer in
            WidgetTimerSnapshot(
                id: timer.id,
                title: timer.title,
                folderName: timer.folderId == nil ? "Inbox" : nil,
                status: timer.status,
                elapsedSeconds: TimerMath.elapsedSeconds(for: timer, at: nowMilliseconds),
                capturedAt: now
            )
        }
        let records = completedEntries.compactMap { entry -> WidgetEntryRecord? in
            guard let durationSeconds = entry.durationSeconds else {
                return nil
            }

            return WidgetEntryRecord(
                id: entry.id,
                startedAt: Date(timeIntervalSince1970: TimeInterval(entry.startedAt) / 1_000),
                durationSeconds: durationSeconds,
                folderId: entry.folderId,
                labelIds: entry.manualLabelIds
            )
        }
        let snapshot = WidgetSnapshot(
            capturedAt: now,
            activeTimers: activeSnapshots,
            entries: records,
            folders: [
                WidgetFilterOption(
                    id: WidgetSnapshotStore.inboxFilterIdentifier,
                    name: "Inbox"
                ),
            ]
        )

        if WidgetSnapshotStore.save(snapshot) {
            WidgetCenter.shared.reloadAllTimelines()
        }
    }
}

private extension Date {
    var wholeSecondMilliseconds: Int64 {
        let milliseconds = Int64((timeIntervalSince1970 * 1_000).rounded(.down))
        return TimerMath.wholeSecond(milliseconds)
    }
}
