import SwiftUI
import TimeCore

struct LabelsView: View {
    @Bindable var store: ConvexTimerStore
    @State private var editingLabel: TimeCore.Label?
    @State private var creatingLabel = false
    @State private var deletingLabel: TimeCore.Label?

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    TerraPageHeader(
                        kicker: "Signal / labels",
                        title: "Mark what matters.",
                        subtitle: "Reusable labels can be added directly or inherited from a folder."
                    )

                    if store.labels.isEmpty {
                        TerraEmptyState(
                            icon: "tag",
                            title: "No labels yet",
                            message: "Create a signal you can reuse across folders and entries."
                        )
                        .terraSurface()
                    } else {
                        LazyVStack(spacing: 10) {
                            ForEach(store.labels.sorted(by: labelSort)) { label in
                                LabelRow(
                                    label: label,
                                    usageCount: usageCount(for: label),
                                    onEdit: { editingLabel = label },
                                    onDelete: { deletingLabel = label }
                                )
                            }
                        }
                    }
                }
                .padding(.horizontal, 18)
                .padding(.bottom, 36)
            }
            .background(TimeTheme.canvas.ignoresSafeArea())
            .navigationTitle("Labels")
            .navigationBarTitleDisplayMode(.inline)
            .toolbarBackground(TimeTheme.canvas, for: .navigationBar)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        creatingLabel = true
                    } label: {
                        Label("New Label", systemImage: "plus")
                    }
                    .buttonStyle(.borderedProminent)
                    .buttonBorderShape(.capsule)
                    .tint(TimeTheme.accent)
                }
            }
            .sheet(isPresented: $creatingLabel) {
                LabelEditorSheet(store: store, label: nil)
            }
            .sheet(item: $editingLabel) { label in
                LabelEditorSheet(store: store, label: label)
            }
            .confirmationDialog(
                "Delete this label?",
                isPresented: Binding(
                    get: { deletingLabel != nil },
                    set: { if !$0 { deletingLabel = nil } }
                ),
                titleVisibility: .visible
            ) {
                Button("Delete Label", role: .destructive) {
                    guard let deletingLabel else { return }
                    Task { _ = await store.deleteLabel(deletingLabel) }
                    self.deletingLabel = nil
                }
            } message: {
                Text("It will also be removed from folders and entries.")
            }
        }
    }

    private func labelSort(_ lhs: TimeCore.Label, _ rhs: TimeCore.Label) -> Bool {
        lhs.name.localizedCaseInsensitiveCompare(rhs.name) == .orderedAscending
    }

    private func usageCount(for label: TimeCore.Label) -> Int {
        let entryCount = store.completedEntries.count { $0.manualLabelIds.contains(label.id) }
        let folderCount = store.folders.count { $0.defaultLabelIds.contains(label.id) }
        return entryCount + folderCount
    }
}

private struct LabelRow: View {
    let label: TimeCore.Label
    let usageCount: Int
    let onEdit: () -> Void
    let onDelete: () -> Void

    var body: some View {
        HStack(spacing: 13) {
            Circle()
                .fill(Color(hex: label.color))
                .frame(width: 34, height: 34)
                .overlay {
                    Image(systemName: "tag.fill")
                        .font(.caption)
                        .foregroundStyle(.white.opacity(0.92))
                }

            VStack(alignment: .leading, spacing: 3) {
                Text(label.name)
                    .font(.subheadline.weight(.bold))
                    .foregroundStyle(TimeTheme.ink)
                Text(usageCount == 1 ? "Used once" : "Used \(usageCount) times")
                    .font(.caption)
                    .foregroundStyle(TimeTheme.sage)
            }
            Spacer()
            Menu {
                Button("Edit", systemImage: "pencil", action: onEdit)
                Button("Delete", systemImage: "trash", role: .destructive, action: onDelete)
            } label: {
                Image(systemName: "ellipsis")
                    .foregroundStyle(TimeTheme.mutedInk)
                    .frame(width: 34, height: 34)
            }
        }
        .terraSurface(padding: 14)
    }
}

private struct LabelEditorSheet: View {
    @Environment(\.dismiss) private var dismiss
    @Bindable var store: ConvexTimerStore
    let label: TimeCore.Label?

    @State private var name: String
    @State private var color: String

    private let colors = ["#5a7d5a", "#c4704f", "#d8a25a", "#7d9184", "#466f8a", "#8b6f91", "#ad6572", "#4f8078"]

    init(store: ConvexTimerStore, label: TimeCore.Label?) {
        self.store = store
        self.label = label
        _name = State(initialValue: label?.name ?? "")
        _color = State(initialValue: label?.color ?? "#5a7d5a")
    }

    var body: some View {
        NavigationStack {
            Form {
                Section("Label") {
                    TextField("Label name", text: $name)
                }

                Section("Color") {
                    LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 4), spacing: 18) {
                        ForEach(colors, id: \.self) { option in
                            Button {
                                color = option
                            } label: {
                                Circle()
                                    .fill(Color(hex: option))
                                    .frame(width: 42, height: 42)
                                    .overlay {
                                        if color == option {
                                            Image(systemName: "checkmark")
                                                .font(.headline.bold())
                                                .foregroundStyle(.white)
                                        }
                                    }
                            }
                            .buttonStyle(.plain)
                        }
                    }
                    .padding(.vertical, 8)
                }

                Section("Preview") {
                    TerraBadge(text: name.isEmpty ? "Label" : name, color: Color(hex: color), icon: "tag.fill")
                }
            }
            .scrollContentBackground(.hidden)
            .background(TimeTheme.canvas)
            .navigationTitle(label == nil ? "New Label" : "Edit Label")
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
            if let label {
                success = await store.updateLabel(label, name: name, color: color)
            } else {
                success = await store.createLabel(name: name, color: color)
            }
            if success { dismiss() }
        }
    }
}
