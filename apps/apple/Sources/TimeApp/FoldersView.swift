import SwiftUI
import TimeCore

struct FoldersView: View {
    @Bindable var store: ConvexTimerStore
    @State private var showingArchived = false
    @State private var editorTarget: FolderEditorTarget?
    @State private var deletingFolder: Folder?

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    TerraPageHeader(
                        kicker: "Structure / folders",
                        title: "Give time a place.",
                        subtitle: "Folders form one hierarchy. Default labels cascade through every child."
                    )

                    archivedToggle

                    if visibleNodes.isEmpty {
                        TerraEmptyState(
                            icon: "folder",
                            title: "No folders yet",
                            message: "Inbox is always available. Add a folder when your time needs more structure."
                        )
                        .terraSurface()
                    } else {
                        LazyVStack(spacing: 10) {
                            ForEach(visibleNodes) { node in
                                FolderRow(
                                    node: node,
                                    labels: node.folder.defaultLabelIds.compactMap(store.label),
                                    onEdit: { editorTarget = FolderEditorTarget(folder: node.folder) },
                                    onAddChild: {
                                        editorTarget = FolderEditorTarget(parentFolderId: node.folder.id)
                                    },
                                    onArchive: {
                                        Task {
                                            _ = await store.setFolderArchived(
                                                node.folder,
                                                archived: !node.folder.archived
                                            )
                                        }
                                    },
                                    onDelete: { deletingFolder = node.folder }
                                )
                            }
                        }
                    }
                }
                .padding(.horizontal, 18)
                .padding(.bottom, 36)
            }
            .background(TimeTheme.canvas.ignoresSafeArea())
            .navigationTitle("Folders")
            .navigationBarTitleDisplayMode(.inline)
            .toolbarBackground(TimeTheme.canvas, for: .navigationBar)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        editorTarget = FolderEditorTarget()
                    } label: {
                        Label("New Folder", systemImage: "plus")
                    }
                    .buttonStyle(.borderedProminent)
                    .buttonBorderShape(.capsule)
                    .tint(TimeTheme.accent)
                }
            }
            .sheet(item: $editorTarget) { target in
                FolderEditorSheet(store: store, target: target)
            }
            .confirmationDialog(
                "Delete this folder?",
                isPresented: Binding(
                    get: { deletingFolder != nil },
                    set: { if !$0 { deletingFolder = nil } }
                ),
                titleVisibility: .visible
            ) {
                Button("Delete Folder", role: .destructive) {
                    guard let deletingFolder else { return }
                    Task { _ = await store.deleteFolder(deletingFolder) }
                    self.deletingFolder = nil
                }
            } message: {
                Text("Entries move to Inbox and direct child folders move to the root.")
            }
        }
    }

    private var archivedToggle: some View {
        HStack {
            VStack(alignment: .leading, spacing: 3) {
                Text("\(store.activeFolders.count) active folders")
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(TimeTheme.ink)
                Text("Inbox remains at the root")
                    .font(.caption)
                    .foregroundStyle(TimeTheme.sage)
            }
            Spacer()
            Toggle("Archived", isOn: $showingArchived)
                .labelsHidden()
                .tint(TimeTheme.moss)
            Text("Archived")
                .font(.caption.weight(.semibold))
                .foregroundStyle(TimeTheme.mutedInk)
        }
        .terraSurface(padding: 14)
    }

    private var visibleNodes: [FolderNode] {
        let folders = store.folders.filter { showingArchived || !$0.archived }
        let ids = Set(folders.map(\.id))
        let grouped = Dictionary(grouping: folders) { folder -> DocumentID? in
            guard let parent = folder.parentFolderId, ids.contains(parent) else { return nil }
            return parent
        }
        var result: [FolderNode] = []

        func append(parent: DocumentID?, depth: Int) {
            for folder in (grouped[parent] ?? []).sorted(by: folderSort) {
                result.append(FolderNode(folder: folder, depth: depth))
                append(parent: folder.id, depth: depth + 1)
            }
        }

        append(parent: nil, depth: 0)
        return result
    }

    private func folderSort(_ lhs: Folder, _ rhs: Folder) -> Bool {
        if lhs.sortOrder == rhs.sortOrder {
            return lhs.name.localizedCaseInsensitiveCompare(rhs.name) == .orderedAscending
        }
        return lhs.sortOrder < rhs.sortOrder
    }
}

private struct FolderNode: Identifiable {
    let folder: Folder
    let depth: Int
    var id: DocumentID { folder.id }
}

private struct FolderRow: View {
    let node: FolderNode
    let labels: [TimeCore.Label]
    let onEdit: () -> Void
    let onAddChild: () -> Void
    let onArchive: () -> Void
    let onDelete: () -> Void

    var body: some View {
        HStack(spacing: 12) {
            if node.depth > 0 {
                Color.clear.frame(width: CGFloat(min(node.depth, 3)) * 16)
            }
            RoundedRectangle(cornerRadius: 10, style: .continuous)
                .fill(node.folder.color.map(Color.init(hex:)) ?? TimeTheme.moss)
                .frame(width: 38, height: 38)
                .overlay {
                    Image(systemName: node.folder.archived ? "archivebox.fill" : "folder.fill")
                        .foregroundStyle(.white.opacity(0.92))
                }

            VStack(alignment: .leading, spacing: 5) {
                Text(node.folder.name)
                    .font(.subheadline.weight(.bold))
                    .foregroundStyle(TimeTheme.ink)
                if labels.isEmpty {
                    Text(node.folder.archived ? "Archived" : "No default labels")
                        .font(.caption)
                        .foregroundStyle(TimeTheme.sage)
                } else {
                    HStack(spacing: 5) {
                        ForEach(labels.prefix(2)) { label in
                            Text(label.name)
                                .font(.caption2.weight(.bold))
                                .foregroundStyle(TimeTheme.mutedInk)
                        }
                        if labels.count > 2 {
                            Text("+\(labels.count - 2)")
                                .font(.caption2.weight(.bold))
                                .foregroundStyle(TimeTheme.sage)
                        }
                    }
                }
            }
            Spacer()
            Menu {
                Button("Edit", systemImage: "pencil", action: onEdit)
                Button("New Subfolder", systemImage: "folder.badge.plus", action: onAddChild)
                Button(
                    node.folder.archived ? "Unarchive" : "Archive",
                    systemImage: node.folder.archived ? "arrow.uturn.backward" : "archivebox",
                    action: onArchive
                )
                Divider()
                Button("Delete", systemImage: "trash", role: .destructive, action: onDelete)
            } label: {
                Image(systemName: "ellipsis")
                    .foregroundStyle(TimeTheme.mutedInk)
                    .frame(width: 34, height: 34)
            }
        }
        .terraSurface(padding: 14)
        .opacity(node.folder.archived ? 0.66 : 1)
    }
}

private struct FolderEditorTarget: Identifiable {
    let id = UUID()
    var folder: Folder?
    var parentFolderId: DocumentID?

    init(folder: Folder? = nil, parentFolderId: DocumentID? = nil) {
        self.folder = folder
        self.parentFolderId = folder?.parentFolderId ?? parentFolderId
    }
}

private struct FolderEditorSheet: View {
    @Environment(\.dismiss) private var dismiss
    @Bindable var store: ConvexTimerStore
    let target: FolderEditorTarget

    @State private var name: String
    @State private var color: String
    @State private var parentFolderId: DocumentID?
    @State private var defaultLabelIds: Set<DocumentID>

    private let colors = ["#5a7d5a", "#c4704f", "#d8a25a", "#7d9184", "#466f8a", "#8b6f91"]

    init(store: ConvexTimerStore, target: FolderEditorTarget) {
        self.store = store
        self.target = target
        _name = State(initialValue: target.folder?.name ?? "")
        _color = State(initialValue: target.folder?.color ?? "#5a7d5a")
        _parentFolderId = State(initialValue: target.parentFolderId)
        _defaultLabelIds = State(initialValue: Set(target.folder?.defaultLabelIds ?? []))
    }

    var body: some View {
        NavigationStack {
            Form {
                Section("Folder") {
                    TextField("Folder name", text: $name)
                    FolderPicker(
                        folders: store.activeFolders,
                        selection: $parentFolderId,
                        excludedFolderId: target.folder?.id
                    )
                }

                if target.folder == nil {
                    Section("Color") {
                        HStack(spacing: 16) {
                            ForEach(colors, id: \.self) { option in
                                Button {
                                    color = option
                                } label: {
                                    Circle()
                                        .fill(Color(hex: option))
                                        .frame(width: 30, height: 30)
                                        .overlay {
                                            if color == option {
                                                Image(systemName: "checkmark")
                                                    .font(.caption.bold())
                                                    .foregroundStyle(.white)
                                            }
                                        }
                                }
                                .buttonStyle(.plain)
                            }
                        }
                    }
                }

                Section {
                    LabelSelectionList(labels: store.labels, selection: $defaultLabelIds)
                } header: {
                    Text("Default Labels")
                } footer: {
                    Text("These labels cascade to entries in this folder and its children.")
                }
            }
            .scrollContentBackground(.hidden)
            .background(TimeTheme.canvas)
            .navigationTitle(target.folder == nil ? "New Folder" : "Edit Folder")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") { save() }
                        .fontWeight(.bold)
                        .disabled(name.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || store.isMutating)
                }
            }
        }
    }

    private func save() {
        Task {
            let success: Bool
            if let folder = target.folder {
                success = await store.updateFolder(
                    folder,
                    name: name,
                    parentFolderId: parentFolderId,
                    defaultLabelIds: defaultLabelIds
                )
            } else {
                success = await store.createFolder(
                    name: name,
                    color: color,
                    parentFolderId: parentFolderId,
                    defaultLabelIds: defaultLabelIds
                )
            }
            if success { dismiss() }
        }
    }
}
