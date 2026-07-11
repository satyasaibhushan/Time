import Foundation

public enum WidgetRange: String, Codable, CaseIterable, Sendable {
    case day
    case week
    case month
}

public struct WidgetFilterOption: Codable, Equatable, Identifiable, Sendable {
    public let id: DocumentID
    public let name: String

    public init(id: DocumentID, name: String) {
        self.id = id
        self.name = name
    }
}

public struct WidgetTimerSnapshot: Codable, Equatable, Identifiable, Sendable {
    public let id: DocumentID
    public let title: String
    public let folderName: String?
    public let status: TimerStatus
    public let elapsedSeconds: Int
    public let capturedAt: Date

    public init(
        id: DocumentID,
        title: String,
        folderName: String? = nil,
        status: TimerStatus,
        elapsedSeconds: Int,
        capturedAt: Date
    ) {
        self.id = id
        self.title = title
        self.folderName = folderName
        self.status = status
        self.elapsedSeconds = elapsedSeconds
        self.capturedAt = capturedAt
    }

    public var timerStartDate: Date {
        capturedAt.addingTimeInterval(TimeInterval(-elapsedSeconds))
    }
}

public struct WidgetEntryRecord: Codable, Equatable, Identifiable, Sendable {
    public let id: DocumentID
    public let startedAt: Date
    public let durationSeconds: Int
    public let folderId: DocumentID?
    public let labelIds: [DocumentID]

    public init(
        id: DocumentID,
        startedAt: Date,
        durationSeconds: Int,
        folderId: DocumentID? = nil,
        labelIds: [DocumentID] = []
    ) {
        self.id = id
        self.startedAt = startedAt
        self.durationSeconds = durationSeconds
        self.folderId = folderId
        self.labelIds = labelIds
    }
}

public struct WidgetSnapshot: Codable, Equatable, Sendable {
    public let capturedAt: Date
    public let activeTimers: [WidgetTimerSnapshot]
    public let entries: [WidgetEntryRecord]
    public let folders: [WidgetFilterOption]
    public let labels: [WidgetFilterOption]

    public init(
        capturedAt: Date,
        activeTimers: [WidgetTimerSnapshot] = [],
        entries: [WidgetEntryRecord] = [],
        folders: [WidgetFilterOption] = [],
        labels: [WidgetFilterOption] = []
    ) {
        self.capturedAt = capturedAt
        self.activeTimers = activeTimers
        self.entries = entries
        self.folders = folders
        self.labels = labels
    }

    public static let empty = WidgetSnapshot(capturedAt: .distantPast)
}

public struct WidgetSummaryBucket: Equatable, Identifiable, Sendable {
    public let id: Date
    public let label: String
    public let durationSeconds: Int

    public init(id: Date, label: String, durationSeconds: Int) {
        self.id = id
        self.label = label
        self.durationSeconds = durationSeconds
    }
}

public struct WidgetSummary: Equatable, Sendable {
    public let range: WidgetRange
    public let totalSeconds: Int
    public let buckets: [WidgetSummaryBucket]

    public init(range: WidgetRange, totalSeconds: Int, buckets: [WidgetSummaryBucket]) {
        self.range = range
        self.totalSeconds = totalSeconds
        self.buckets = buckets
    }
}

public enum WidgetSnapshotStore {
    public static let appGroupIdentifier = "group.fun.bhushan.time"
    public static let inboxFilterIdentifier = "__inbox__"
    private static let snapshotKey = "time.widget.snapshot.v1"

    @discardableResult
    public static func save(
        _ snapshot: WidgetSnapshot,
        suiteName: String = appGroupIdentifier
    ) -> Bool {
        guard
            let defaults = UserDefaults(suiteName: suiteName),
            let data = try? JSONEncoder().encode(snapshot)
        else {
            return false
        }

        defaults.set(data, forKey: snapshotKey)
        return true
    }

    public static func load(
        suiteName: String = appGroupIdentifier
    ) -> WidgetSnapshot? {
        guard
            let defaults = UserDefaults(suiteName: suiteName),
            let data = defaults.data(forKey: snapshotKey)
        else {
            return nil
        }

        return try? JSONDecoder().decode(WidgetSnapshot.self, from: data)
    }
}
