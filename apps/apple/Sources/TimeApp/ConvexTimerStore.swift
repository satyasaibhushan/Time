import Combine
import ConvexMobile
import Foundation
import Observation
import TimeCore
import WidgetKit

@MainActor
@Observable
final class ConvexTimerStore {
    var draftTitle = ""
    private(set) var timers: [TimeEntry] = []
    private(set) var completedEntries: [TimeEntry] = []
    private(set) var folders: [Folder] = []
    private(set) var labels: [TimeCore.Label] = []
    private(set) var pendingMutationCount = 0
    private(set) var errorMessage: String?

    @ObservationIgnored
    private let client: ConvexClient
    @ObservationIgnored
    private var subscriptions: Set<AnyCancellable> = []

    init(client: ConvexClient) {
        self.client = client
        subscribeToBackend()
    }

    var runningCount: Int {
        timers.count { $0.status == .running }
    }

    var isMutating: Bool {
        pendingMutationCount > 0
    }

    func startTimer() {
        let title = draftTitle.trimmingCharacters(in: .whitespacesAndNewlines)
        draftTitle = ""
        mutate {
            let _: DocumentID = try await self.client.mutation(
                ConvexAPI.TimeEntries.start,
                with: ["title": title]
            )
        }
    }

    func toggleTimer(_ timer: TimeEntry) {
        let mutation = timer.status == .running
            ? ConvexAPI.TimeEntries.pause
            : ConvexAPI.TimeEntries.resume
        mutate {
            let _: DocumentID = try await self.client.mutation(
                mutation,
                with: ["entryId": timer.id]
            )
        }
    }

    func stopTimer(_ timer: TimeEntry) {
        mutate {
            let _: DocumentID = try await self.client.mutation(
                ConvexAPI.TimeEntries.stop,
                with: ["entryId": timer.id]
            )
        }
    }

    func discardTimer(_ timer: TimeEntry) {
        mutate {
            let _: DocumentID = try await self.client.mutation(
                ConvexAPI.TimeEntries.discard,
                with: ["entryId": timer.id]
            )
        }
    }

    func clearError() {
        errorMessage = nil
    }

    private func subscribeToBackend() {
        subscribe(
            client.subscribe(
                to: ConvexAPI.TimeEntries.listActive,
                yielding: [TimeEntry].self
            )
        ) { store, timers in
            store.timers = timers
        }

        subscribe(
            client.subscribe(
                to: ConvexAPI.TimeEntries.listRecent,
                with: ["limit": 1_000],
                yielding: [TimeEntry].self
            )
        ) { store, entries in
            store.completedEntries = entries
        }

        subscribe(
            client.subscribe(
                to: ConvexAPI.Folders.listAll,
                yielding: [Folder].self
            )
        ) { store, folders in
            store.folders = folders
        }

        subscribe(
            client.subscribe(
                to: ConvexAPI.Labels.list,
                yielding: [TimeCore.Label].self
            )
        ) { store, labels in
            store.labels = labels
        }
    }

    private func subscribe<Value>(
        _ publisher: AnyPublisher<Value, ClientError>,
        apply: @escaping (ConvexTimerStore, Value) -> Void
    ) {
        publisher
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    guard case .failure(let error) = completion else { return }
                    self?.errorMessage = error.localizedDescription
                },
                receiveValue: { [weak self] value in
                    guard let self else { return }
                    apply(self, value)
                    self.publishWidgetSnapshot()
                }
            )
            .store(in: &subscriptions)
    }

    private func mutate(_ operation: @escaping () async throws -> Void) {
        pendingMutationCount += 1
        errorMessage = nil

        Task {
            defer { pendingMutationCount -= 1 }
            do {
                try await operation()
            } catch {
                errorMessage = error.localizedDescription
            }
        }
    }

    private func publishWidgetSnapshot(now: Date = .now) {
        let nowMilliseconds = Int64((now.timeIntervalSince1970 * 1_000).rounded(.down))
        let foldersById = Dictionary(uniqueKeysWithValues: folders.map { ($0.id, $0) })
        let activeSnapshots = timers.map { timer in
            WidgetTimerSnapshot(
                id: timer.id,
                title: timer.title,
                folderName: timer.folderId.flatMap { foldersById[$0]?.name } ?? "Inbox",
                status: timer.status,
                elapsedSeconds: TimerMath.elapsedSeconds(for: timer, at: nowMilliseconds),
                capturedAt: now
            )
        }
        let records = completedEntries.compactMap { entry -> WidgetEntryRecord? in
            guard let durationSeconds = entry.durationSeconds else { return nil }
            return WidgetEntryRecord(
                id: entry.id,
                startedAt: Date(timeIntervalSince1970: TimeInterval(entry.startedAt) / 1_000),
                durationSeconds: durationSeconds,
                folderId: entry.folderId,
                labelIds: effectiveLabelIds(for: entry, foldersById: foldersById)
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
            ] + folders.filter { !$0.archived }.map {
                WidgetFilterOption(id: $0.id, name: $0.name)
            },
            labels: labels.map { WidgetFilterOption(id: $0.id, name: $0.name) }
        )

        if WidgetSnapshotStore.save(snapshot) {
            WidgetCenter.shared.reloadAllTimelines()
        }
    }

    private func effectiveLabelIds(
        for entry: TimeEntry,
        foldersById: [DocumentID: Folder]
    ) -> [DocumentID] {
        var result = Set(entry.manualLabelIds)
        var folderId = entry.folderId

        while let currentId = folderId, let folder = foldersById[currentId] {
            result.formUnion(folder.defaultLabelIds)
            folderId = folder.parentFolderId
        }

        return Array(result)
    }
}
