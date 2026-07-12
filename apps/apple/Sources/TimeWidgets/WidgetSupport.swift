import SwiftUI
import TimeCore

enum WidgetPalette {
    static let surface = Color(widgetHex: 0xF7F8F2)
    static let timerSurface = Color(widgetHex: 0x22372B)
    static let accent = Color(widgetHex: 0x22372B)
    static let ink = Color(widgetHex: 0x22372B)
    static let mutedInk = Color(widgetHex: 0x57705F)
    static let softGreen = Color(widgetHex: 0x7D9184)
    static let gold = Color(widgetHex: 0xD8A25A)
    static let line = Color(widgetHex: 0xDEE2D3)
}

private extension Color {
    init(widgetHex value: UInt32) {
        self.init(
            .sRGB,
            red: Double((value >> 16) & 0xFF) / 255,
            green: Double((value >> 8) & 0xFF) / 255,
            blue: Double(value & 0xFF) / 255,
            opacity: 1
        )
    }
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
