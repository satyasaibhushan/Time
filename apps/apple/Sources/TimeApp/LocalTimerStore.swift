import Foundation
import Observation
import TimeCore

@MainActor
@Observable
final class LocalTimerStore {
    var draftTitle = ""
    private(set) var timers: [TimeEntry]

    init(timers: [TimeEntry] = []) {
        self.timers = timers
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

        timers.removeAll { $0.status == .completed }
    }

    func discardTimer(_ timer: TimeEntry) {
        timers.removeAll { $0.id == timer.id }
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
}

private extension Date {
    var wholeSecondMilliseconds: Int64 {
        let milliseconds = Int64((timeIntervalSince1970 * 1_000).rounded(.down))
        return TimerMath.wholeSecond(milliseconds)
    }
}
