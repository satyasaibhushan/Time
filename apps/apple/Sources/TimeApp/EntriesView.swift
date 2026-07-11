import SwiftUI
import TimeCore

struct EntriesView: View {
    @Bindable var store: ConvexTimerStore
    @State private var searchText = ""
    @State private var folderFilter = "all"
    @State private var labelFilter = "all"
    @State private var range: EntryRange = .week
    @State private var creatingEntry = false
    @State private var editingEntry: TimeEntry?
    @State private var deletingEntry: TimeEntry?

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    TerraPageHeader(
                        kicker: "Record / entries",
                        title: "See where time went.",
                        subtitle: "Search, filter, continue, or correct any completed session."
                    )
                    filters
                    summary
                    entriesList
                }
                .padding(.horizontal, 18)
                .padding(.bottom, 36)
            }
            .background(TimeTheme.canvas.ignoresSafeArea())
            .navigationTitle("Log")
            .navigationBarTitleDisplayMode(.inline)
            .toolbarBackground(TimeTheme.canvas, for: .navigationBar)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        creatingEntry = true
                    } label: {
                        Label("Add Entry", systemImage: "plus")
                    }
                    .buttonStyle(.borderedProminent)
                    .buttonBorderShape(.capsule)
                    .tint(TimeTheme.accent)
                }
            }
            .searchable(text: $searchText, prompt: "Search entries")
            .sheet(isPresented: $creatingEntry) {
                EntryEditorSheet(store: store, entry: nil)
            }
            .sheet(item: $editingEntry) { entry in
                EntryEditorSheet(store: store, entry: entry)
            }
            .confirmationDialog(
                "Delete this entry?",
                isPresented: Binding(
                    get: { deletingEntry != nil },
                    set: { if !$0 { deletingEntry = nil } }
                ),
                titleVisibility: .visible
            ) {
                Button("Delete Entry", role: .destructive) {
                    guard let deletingEntry else { return }
                    Task { _ = await store.deleteEntry(deletingEntry) }
                    self.deletingEntry = nil
                }
            } message: {
                Text("This permanently removes the recorded session.")
            }
        }
    }

    private var filters: some View {
        VStack(spacing: 12) {
            Picker("Range", selection: $range) {
                ForEach(EntryRange.allCases) { range in
                    Text(range.title).tag(range)
                }
            }
            .pickerStyle(.segmented)

            HStack(spacing: 10) {
                Menu {
                    Picker("Folder", selection: $folderFilter) {
                        Text("All folders").tag("all")
                        Text("Inbox").tag("inbox")
                        ForEach(store.activeFolders) { folder in
                            Text(folder.name).tag(folder.id)
                        }
                    }
                } label: {
                    FilterPill(
                        icon: "folder",
                        text: selectedFolderName,
                        active: folderFilter != "all"
                    )
                }

                Menu {
                    Picker("Label", selection: $labelFilter) {
                        Text("All labels").tag("all")
                        ForEach(store.labels) { label in
                            Text(label.name).tag(label.id)
                        }
                    }
                } label: {
                    FilterPill(
                        icon: "tag",
                        text: selectedLabelName,
                        active: labelFilter != "all"
                    )
                }

                Spacer(minLength: 0)

                if folderFilter != "all" || labelFilter != "all" {
                    Button("Clear") {
                        folderFilter = "all"
                        labelFilter = "all"
                    }
                    .font(.caption.weight(.bold))
                    .foregroundStyle(TimeTheme.clay)
                }
            }
        }
        .terraSurface(padding: 14)
    }

    private var selectedFolderName: String {
        if folderFilter == "all" { return "Folders" }
        if folderFilter == "inbox" { return "Inbox" }
        return store.folder(for: folderFilter)?.name ?? "Folders"
    }

    private var selectedLabelName: String {
        guard labelFilter != "all" else { return "Labels" }
        return store.label(for: labelFilter)?.name ?? "Labels"
    }

    private var summary: some View {
        HStack(alignment: .firstTextBaseline) {
            VStack(alignment: .leading, spacing: 3) {
                Text("TRACKED")
                    .font(.caption2.weight(.bold))
                    .tracking(1.2)
                    .foregroundStyle(TimeTheme.sage)
                Text(TimeText.duration(filteredEntries.reduce(0) { $0 + ($1.durationSeconds ?? 0) }))
                    .font(.system(.title2, design: .rounded, weight: .bold))
                    .monospacedDigit()
                    .foregroundStyle(TimeTheme.ink)
            }
            Spacer()
            Text("\(filteredEntries.count) sessions")
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(TimeTheme.mutedInk)
        }
        .terraSurface()
    }

    @ViewBuilder
    private var entriesList: some View {
        if filteredEntries.isEmpty {
            TerraEmptyState(
                icon: "book.closed",
                title: "No matching entries",
                message: "Adjust the filters or add a manual session."
            )
            .terraSurface()
        } else {
            LazyVStack(spacing: 12) {
                ForEach(filteredEntries) { entry in
                    EntryRow(
                        entry: entry,
                        folder: store.folder(for: entry.folderId),
                        labels: entry.manualLabelIds.compactMap(store.label),
                        onContinue: { Task { _ = await store.continueEntry(entry) } },
                        onEdit: { editingEntry = entry },
                        onDelete: { deletingEntry = entry }
                    )
                }
            }
        }
    }

    private var filteredEntries: [TimeEntry] {
        let calendar = Calendar.current
        let now = Date.now
        let startDate: Date? = switch range {
        case .all: nil
        case .today: calendar.startOfDay(for: now)
        case .week: calendar.date(byAdding: .day, value: -6, to: calendar.startOfDay(for: now))
        case .month: calendar.date(byAdding: .month, value: -1, to: now)
        }

        return store.completedEntries.filter { entry in
            if let startDate, Date(milliseconds: entry.startedAt) < startDate { return false }
            if folderFilter == "inbox", entry.folderId != nil { return false }
            if folderFilter != "all", folderFilter != "inbox", entry.folderId != folderFilter { return false }
            if labelFilter != "all", !effectiveLabelIds(for: entry).contains(labelFilter) { return false }
            if !searchText.isEmpty {
                let haystack = "\(entry.title) \(entry.notes ?? "")".localizedLowercase
                if !haystack.contains(searchText.localizedLowercase) { return false }
            }
            return true
        }
    }

    private func effectiveLabelIds(for entry: TimeEntry) -> Set<DocumentID> {
        var ids = Set(entry.manualLabelIds)
        var folderId = entry.folderId
        var visited: Set<DocumentID> = []
        while let current = folderId, !visited.contains(current), let folder = store.folder(for: current) {
            visited.insert(current)
            ids.formUnion(folder.defaultLabelIds)
            folderId = folder.parentFolderId
        }
        return ids
    }
}

private enum EntryRange: String, CaseIterable, Identifiable {
    case today
    case week
    case month
    case all

    var id: Self { self }
    var title: String { rawValue.capitalized }
}

private struct FilterPill: View {
    let icon: String
    let text: String
    let active: Bool

    var body: some View {
        Label(text, systemImage: icon)
            .font(.caption.weight(.bold))
            .lineLimit(1)
            .padding(.horizontal, 11)
            .padding(.vertical, 8)
            .foregroundStyle(active ? Color.white : TimeTheme.mutedInk)
            .background(active ? TimeTheme.moss : TimeTheme.muted, in: Capsule())
    }
}

private struct EntryRow: View {
    let entry: TimeEntry
    let folder: Folder?
    let labels: [TimeCore.Label]
    let onContinue: () -> Void
    let onEdit: () -> Void
    let onDelete: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack(alignment: .top, spacing: 12) {
                VStack(alignment: .leading, spacing: 5) {
                    Text(entry.title.isEmpty ? "Untitled session" : entry.title)
                        .font(.headline)
                        .italic(entry.title.isEmpty)
                        .foregroundStyle(TimeTheme.ink)
                    Text(Date(milliseconds: entry.startedAt).formatted(date: .abbreviated, time: .shortened))
                        .font(.caption)
                        .foregroundStyle(TimeTheme.sage)
                }
                Spacer()
                Text(TimeText.compactDuration(entry.durationSeconds ?? 0))
                    .font(.subheadline.monospacedDigit().weight(.bold))
                    .foregroundStyle(TimeTheme.ink)
            }

            if let notes = entry.notes, !notes.isEmpty {
                Text(notes)
                    .font(.subheadline)
                    .foregroundStyle(TimeTheme.mutedInk)
                    .lineLimit(2)
            }

            HStack(spacing: 7) {
                TerraBadge(text: folder?.name ?? "Inbox", color: TimeTheme.gold, icon: "folder.fill")
                ForEach(labels.prefix(2)) { label in
                    TerraBadge(text: label.name, color: Color(hex: label.color))
                }
                Spacer()
                Menu {
                    Button("Continue", systemImage: "play.fill", action: onContinue)
                    Button("Edit", systemImage: "pencil", action: onEdit)
                    Button("Delete", systemImage: "trash", role: .destructive, action: onDelete)
                } label: {
                    Image(systemName: "ellipsis.circle")
                        .font(.title3)
                        .foregroundStyle(TimeTheme.mutedInk)
                }
            }
        }
        .terraSurface()
    }
}

private struct EntryEditorSheet: View {
    @Environment(\.dismiss) private var dismiss
    @Bindable var store: ConvexTimerStore
    let entry: TimeEntry?

    @State private var title: String
    @State private var notes: String
    @State private var folderId: DocumentID?
    @State private var labelIds: Set<DocumentID>
    @State private var start: Date
    @State private var end: Date

    init(store: ConvexTimerStore, entry: TimeEntry?) {
        self.store = store
        self.entry = entry
        _title = State(initialValue: entry?.title ?? "")
        _notes = State(initialValue: entry?.notes ?? "")
        _folderId = State(initialValue: entry?.folderId)
        _labelIds = State(initialValue: Set(entry?.manualLabelIds ?? []))
        _start = State(initialValue: entry.map { Date(milliseconds: $0.startedAt) } ?? Date.now.addingTimeInterval(-3_600))
        _end = State(initialValue: entry?.endedAt.map(Date.init(milliseconds:)) ?? .now)
    }

    var body: some View {
        NavigationStack {
            Form {
                Section("Session") {
                    TextField("What did you work on?", text: $title)
                    TextField("Notes", text: $notes, axis: .vertical)
                        .lineLimit(2...5)
                }

                Section("Time") {
                    DatePicker("Started", selection: $start)
                    DatePicker("Ended", selection: $end)
                    if end <= start {
                        Text("End time must be after start time.")
                            .font(.caption)
                            .foregroundStyle(TimeTheme.destructive)
                    }
                }

                Section("Folder") {
                    FolderPicker(folders: store.activeFolders, selection: $folderId)
                        .labelsHidden()
                }

                Section("Labels") {
                    LabelSelectionList(labels: store.labels, selection: $labelIds)
                }
            }
            .scrollContentBackground(.hidden)
            .background(TimeTheme.canvas)
            .navigationTitle(entry == nil ? "Add Entry" : "Edit Entry")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") { save() }
                        .fontWeight(.bold)
                        .disabled(end <= start || store.isMutating)
                }
            }
        }
    }

    private func save() {
        Task {
            let success: Bool
            if let entry {
                success = await store.editEntry(
                    entry,
                    title: title,
                    notes: notes,
                    folderId: folderId,
                    labelIds: labelIds,
                    start: start,
                    end: end
                )
            } else {
                success = await store.createManualEntry(
                    title: title,
                    notes: notes,
                    folderId: folderId,
                    labelIds: labelIds,
                    start: start,
                    end: end
                )
            }
            if success { dismiss() }
        }
    }
}
