import SwiftUI
import TimeCore

enum WidgetPalette {
    static let surface = Color(red: 0.96, green: 0.96, blue: 0.92)
    static let timerSurface = Color(red: 0.08, green: 0.20, blue: 0.15)
    static let accent = Color(red: 0.10, green: 0.30, blue: 0.22)
    static let ink = Color(red: 0.08, green: 0.20, blue: 0.15)
    static let mutedInk = Color(red: 0.38, green: 0.46, blue: 0.40)
    static let softGreen = Color(red: 0.64, green: 0.73, blue: 0.64)
    static let gold = Color(red: 0.89, green: 0.60, blue: 0.25)
    static let line = Color(red: 0.84, green: 0.85, blue: 0.79)
}

enum WidgetPreviewData {
    static let runningTimer = WidgetTimerSnapshot(
        id: "preview-timer",
        title: "Focused work",
        folderName: "Inbox",
        status: .running,
        elapsedSeconds: 3_742,
        capturedAt: .now
    )

    static let snapshot: WidgetSnapshot = {
        let calendar = Calendar.current
        let now = Date.now
        let entries = (0..<7).compactMap { offset -> WidgetEntryRecord? in
            guard let date = calendar.date(byAdding: .day, value: -offset, to: now) else {
                return nil
            }

            return WidgetEntryRecord(
                id: "preview-\(offset)",
                startedAt: date,
                durationSeconds: (offset + 1) * 1_200,
                folderId: "inbox",
                labelIds: ["focus"]
            )
        }

        return WidgetSnapshot(
            capturedAt: now,
            activeTimers: [runningTimer],
            entries: entries,
            folders: [WidgetFilterOption(id: "inbox", name: "Inbox")],
            labels: [WidgetFilterOption(id: "focus", name: "Focus")]
        )
    }()
}
