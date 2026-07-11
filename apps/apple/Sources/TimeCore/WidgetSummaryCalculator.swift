import Foundation

public enum WidgetSummaryCalculator {
    public static func summary(
        for records: [WidgetEntryRecord],
        range: WidgetRange,
        folderId: DocumentID? = nil,
        labelId: DocumentID? = nil,
        now: Date = .now,
        calendar: Calendar = .autoupdatingCurrent
    ) -> WidgetSummary {
        let intervals = bucketIntervals(for: range, now: now, calendar: calendar)
        let filteredRecords = records.filter { record in
            let matchesFolder: Bool
            if folderId == WidgetSnapshotStore.inboxFilterIdentifier {
                matchesFolder = record.folderId == nil
            } else {
                matchesFolder = folderId == nil || record.folderId == folderId
            }
            let matchesLabel = labelId == nil || record.labelIds.contains(labelId ?? "")
            return matchesFolder && matchesLabel
        }

        let buckets = intervals.map { interval in
            let seconds = filteredRecords.reduce(into: 0) { total, record in
                let recordEnd = record.startedAt.addingTimeInterval(TimeInterval(record.durationSeconds))
                let overlapStart = max(record.startedAt, interval.range.lowerBound)
                let overlapEnd = min(recordEnd, interval.range.upperBound)
                total += max(Int(overlapEnd.timeIntervalSince(overlapStart)), 0)
            }

            return WidgetSummaryBucket(
                id: interval.range.lowerBound,
                label: interval.label,
                durationSeconds: seconds
            )
        }

        return WidgetSummary(
            range: range,
            totalSeconds: buckets.reduce(0) { $0 + $1.durationSeconds },
            buckets: buckets
        )
    }

    private static func bucketIntervals(
        for range: WidgetRange,
        now: Date,
        calendar: Calendar
    ) -> [(range: Range<Date>, label: String)] {
        switch range {
        case .day:
            let start = calendar.startOfDay(for: now)
            return (0..<6).compactMap { index in
                guard
                    let lower = calendar.date(byAdding: .hour, value: index * 4, to: start),
                    let upper = calendar.date(byAdding: .hour, value: (index + 1) * 4, to: start)
                else {
                    return nil
                }

                return (lower..<upper, lower.formatted(.dateTime.hour(.defaultDigits(amPM: .abbreviated))))
            }
        case .week:
            guard let week = calendar.dateInterval(of: .weekOfYear, for: now) else {
                return []
            }

            return (0..<7).compactMap { index in
                guard
                    let lower = calendar.date(byAdding: .day, value: index, to: week.start),
                    let upper = calendar.date(byAdding: .day, value: index + 1, to: week.start)
                else {
                    return nil
                }

                return (lower..<upper, lower.formatted(.dateTime.weekday(.narrow)))
            }
        case .month:
            guard let month = calendar.dateInterval(of: .month, for: now) else {
                return []
            }

            var intervals: [(range: Range<Date>, label: String)] = []
            var lower = month.start

            while lower < month.end {
                guard let proposedUpper = calendar.date(byAdding: .day, value: 7, to: lower) else {
                    break
                }

                let upper = min(proposedUpper, month.end)
                let startDay = calendar.component(.day, from: lower)
                let endDay = calendar.component(.day, from: upper.addingTimeInterval(-1))
                intervals.append((lower..<upper, "\(startDay)–\(endDay)"))
                lower = upper
            }

            return intervals
        }
    }
}
