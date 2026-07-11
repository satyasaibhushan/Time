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
