import AppIntents
import Charts
import SwiftUI
import TimeCore
import WidgetKit

struct SummaryWidgetEntry: TimelineEntry {
    let date: Date
    let summary: WidgetSummary
    let filterDescription: String
}

struct SummaryWidgetProvider: AppIntentTimelineProvider {
    func placeholder(in context: Context) -> SummaryWidgetEntry {
        makeEntry(
            configuration: SummaryWidgetIntent(range: .week),
            snapshot: WidgetPreviewData.snapshot,
            now: .now
        )
    }

    func snapshot(
        for configuration: SummaryWidgetIntent,
        in context: Context
    ) async -> SummaryWidgetEntry {
        makeEntry(configuration: configuration, snapshot: loadedSnapshot, now: .now)
    }

    func timeline(
        for configuration: SummaryWidgetIntent,
        in context: Context
    ) async -> Timeline<SummaryWidgetEntry> {
        let now = Date.now
        let entry = makeEntry(configuration: configuration, snapshot: loadedSnapshot, now: now)
        let refreshDate = Calendar.current.date(byAdding: .minute, value: 15, to: now) ?? now
        return Timeline(entries: [entry], policy: .after(refreshDate))
    }

    private var loadedSnapshot: WidgetSnapshot {
        WidgetSnapshotStore.load() ?? .empty
    }

    private func makeEntry(
        configuration: SummaryWidgetIntent,
        snapshot: WidgetSnapshot,
        now: Date
    ) -> SummaryWidgetEntry {
        let summary = WidgetSummaryCalculator.summary(
            for: snapshot.entries,
            range: configuration.range.widgetRange,
            folderId: configuration.folder?.id,
            labelId: configuration.label?.id,
            now: now
        )
        let filters = [configuration.folder?.name, configuration.label?.name].compactMap { $0 }

        return SummaryWidgetEntry(
            date: now,
            summary: summary,
            filterDescription: filters.isEmpty ? "All time" : filters.joined(separator: " · ")
        )
    }
}

struct SummaryWidgetView: View {
    let entry: SummaryWidgetEntry

    var body: some View {
        HStack(spacing: 18) {
            VStack(alignment: .leading, spacing: 5) {
                Text(entry.summary.range.rawValue.uppercased())
                    .font(.caption2.weight(.bold))
                    .tracking(1)
                    .foregroundStyle(WidgetPalette.mutedInk)

                Text(entry.summary.totalSeconds.compactDuration)
                    .font(.system(.title, design: .rounded, weight: .bold))
                    .foregroundStyle(WidgetPalette.ink)
                    .minimumScaleFactor(0.7)

                Spacer(minLength: 0)

                Text(entry.filterDescription)
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(WidgetPalette.mutedInk)
                    .lineLimit(1)
            }
            .frame(width: 94, alignment: .leading)

            Chart(entry.summary.buckets) { bucket in
                BarMark(
                    x: .value("Bucket", bucket.label),
                    y: .value("Seconds", bucket.durationSeconds)
                )
                .foregroundStyle(WidgetPalette.accent.gradient)
                .cornerRadius(4)
            }
            .chartYAxis(.hidden)
            .chartXAxis {
                AxisMarks { value in
                    AxisValueLabel {
                        if let label = value.as(String.self) {
                            Text(label)
                                .font(.system(size: 8, weight: .semibold))
                                .foregroundStyle(WidgetPalette.mutedInk)
                        }
                    }
                    AxisGridLine().foregroundStyle(WidgetPalette.line.opacity(0.5))
                }
            }
        }
        .containerBackground(for: .widget) {
            WidgetPalette.surface
        }
    }
}

struct SummaryWidget: Widget {
    let kind = "SummaryWidget"

    var body: some WidgetConfiguration {
        AppIntentConfiguration(
            kind: kind,
            intent: SummaryWidgetIntent.self,
            provider: SummaryWidgetProvider()
        ) { entry in
            SummaryWidgetView(entry: entry)
        }
        .configurationDisplayName("Tracked time")
        .description("Compare your tracked time by day, week, or month with optional filters.")
        .supportedFamilies([.systemMedium])
    }
}

private extension Int {
    var compactDuration: String {
        let hours = self / 3_600
        let minutes = self % 3_600 / 60

        if hours > 0 {
            return "\(hours)h \(minutes)m"
        }

        return "\(minutes)m"
    }
}
