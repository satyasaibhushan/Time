import Foundation
import Testing
@testable import TimeCore

@Test func wholeSecondUsesTheSharedWallClockBoundary() {
    #expect(TimerMath.wholeSecond(12_999) == 12_000)
    #expect(TimerMath.wholeSecond(13_000) == 13_000)
}

@Test func runningSegmentsAdvanceFromTheSameSecond() {
    let now: Int64 = 25_999
    let first = [TimeSegment(startTime: 1_000)]
    let second = [TimeSegment(startTime: 3_000)]

    #expect(TimerMath.elapsedSeconds(for: first, at: TimerMath.wholeSecond(now)) == 24)
    #expect(TimerMath.elapsedSeconds(for: second, at: TimerMath.wholeSecond(now)) == 22)
}

@Test func pausedSegmentsDoNotKeepAdvancing() {
    let segments = [
        TimeSegment(startTime: 1_000, endTime: 6_000),
        TimeSegment(startTime: 10_000, endTime: 13_000),
    ]

    #expect(TimerMath.elapsedSeconds(for: segments, at: 50_000) == 8)
}

@Test func completedEntryUsesItsStoredDuration() {
    let entry = TimeEntry(
        id: "entry-1",
        userId: "user-1",
        title: "Focused work",
        status: .completed,
        segments: [TimeSegment(startTime: 1_000, endTime: 10_000)],
        startedAt: 1_000,
        endedAt: 10_000,
        durationSeconds: 42,
        createdAt: 1_000,
        updatedAt: 10_000
    )

    #expect(TimerMath.elapsedSeconds(for: entry, at: 90_000) == 42)
}

@Test func environmentAcceptsOnlyConvexCloudHTTPSURLs() throws {
    let environment = try NativeEnvironment(
        convexURLString: "https://example-deployment.convex.cloud"
    )

    #expect(environment.convexURL.host == "example-deployment.convex.cloud")
    #expect(throws: NativeEnvironment.ConfigurationError.self) {
        try NativeEnvironment(convexURLString: "http://example.com")
    }
}

@Test func convexModelsDecodeDocumentMetadata() throws {
    let json = """
    {
      "_id": "entry-1",
      "_creationTime": 1000.5,
      "userId": "user-1",
      "title": "",
      "manualLabelIds": [],
      "status": "running",
      "segments": [{ "startTime": 1000 }],
      "startedAt": 1000,
      "createdAt": 1000,
      "updatedAt": 1000
    }
    """

    let entry = try JSONDecoder().decode(TimeEntry.self, from: Data(json.utf8))

    #expect(entry.id == "entry-1")
    #expect(entry.creationTime == 1000.5)
    #expect(entry.status == .running)
}

@Test func widgetSummaryAppliesFolderAndLabelFilters() throws {
    var calendar = Calendar(identifier: .gregorian)
    calendar.timeZone = try #require(TimeZone(secondsFromGMT: 0))
    let now = try #require(calendar.date(from: DateComponents(year: 2026, month: 7, day: 8, hour: 12)))
    let matchingStart = try #require(calendar.date(from: DateComponents(year: 2026, month: 7, day: 8, hour: 9)))
    let records = [
        WidgetEntryRecord(
            id: "matching",
            startedAt: matchingStart,
            durationSeconds: 3_600,
            folderId: "work",
            labelIds: ["focus"]
        ),
        WidgetEntryRecord(
            id: "wrong-label",
            startedAt: matchingStart,
            durationSeconds: 7_200,
            folderId: "work",
            labelIds: ["admin"]
        ),
    ]

    let summary = WidgetSummaryCalculator.summary(
        for: records,
        range: .week,
        folderId: "work",
        labelId: "focus",
        now: now,
        calendar: calendar
    )

    #expect(summary.totalSeconds == 3_600)
    #expect(summary.buckets.count == 7)
}

@Test func widgetDaySummarySplitsEntriesAcrossBuckets() throws {
    var calendar = Calendar(identifier: .gregorian)
    calendar.timeZone = try #require(TimeZone(secondsFromGMT: 0))
    let now = try #require(calendar.date(from: DateComponents(year: 2026, month: 7, day: 8, hour: 12)))
    let start = try #require(calendar.date(from: DateComponents(year: 2026, month: 7, day: 8, hour: 3, minute: 30)))
    let record = WidgetEntryRecord(id: "split", startedAt: start, durationSeconds: 3_600)

    let summary = WidgetSummaryCalculator.summary(
        for: [record],
        range: .day,
        now: now,
        calendar: calendar
    )

    #expect(summary.buckets.map(\.durationSeconds) == [1_800, 1_800, 0, 0, 0, 0])
    #expect(summary.totalSeconds == 3_600)
}

@Test func widgetSummaryTreatsMissingFolderAsInbox() throws {
    var calendar = Calendar(identifier: .gregorian)
    calendar.timeZone = try #require(TimeZone(secondsFromGMT: 0))
    let now = try #require(calendar.date(from: DateComponents(year: 2026, month: 7, day: 8, hour: 12)))
    let start = try #require(calendar.date(from: DateComponents(year: 2026, month: 7, day: 8, hour: 9)))
    let records = [
        WidgetEntryRecord(id: "inbox", startedAt: start, durationSeconds: 1_800),
        WidgetEntryRecord(
            id: "folder",
            startedAt: start,
            durationSeconds: 3_600,
            folderId: "work"
        ),
    ]

    let summary = WidgetSummaryCalculator.summary(
        for: records,
        range: .day,
        folderId: WidgetSnapshotStore.inboxFilterIdentifier,
        now: now,
        calendar: calendar
    )

    #expect(summary.totalSeconds == 1_800)
}
