import SwiftUI
import TimeCore

struct TerraPageHeader: View {
    let kicker: String
    let title: String
    let subtitle: String

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(kicker.uppercased())
                .font(.caption2.weight(.bold))
                .tracking(1.4)
                .foregroundStyle(TimeTheme.sage)
            Text(title)
                .font(.system(.title2, design: .rounded, weight: .bold))
                .foregroundStyle(TimeTheme.ink)
            Text(subtitle)
                .font(.subheadline)
                .foregroundStyle(TimeTheme.mutedInk)
                .fixedSize(horizontal: false, vertical: true)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

struct TerraSurfaceModifier: ViewModifier {
    var padding: CGFloat = 18

    func body(content: Content) -> some View {
        content
            .padding(padding)
            .background(TimeTheme.surface, in: RoundedRectangle(cornerRadius: 22, style: .continuous))
            .overlay {
                RoundedRectangle(cornerRadius: 22, style: .continuous)
                    .stroke(TimeTheme.line.opacity(0.9), lineWidth: 1)
            }
    }
}

extension View {
    func terraSurface(padding: CGFloat = 18) -> some View {
        modifier(TerraSurfaceModifier(padding: padding))
    }
}

struct TerraBadge: View {
    let text: String
    var color = TimeTheme.gold
    var icon: String?

    var body: some View {
        HStack(spacing: 5) {
            if let icon {
                Image(systemName: icon)
                    .font(.caption2.weight(.bold))
            }
            Text(text)
                .lineLimit(1)
        }
        .font(.caption.weight(.bold))
        .padding(.horizontal, 10)
        .padding(.vertical, 6)
        .foregroundStyle(TimeTheme.ink)
        .background(color.opacity(0.88), in: Capsule())
    }
}

struct TerraEmptyState: View {
    let icon: String
    let title: String
    let message: String

    var body: some View {
        VStack(spacing: 12) {
            Image(systemName: icon)
                .font(.system(size: 30, weight: .light))
            Text(title)
                .font(.headline)
                .foregroundStyle(TimeTheme.ink)
            Text(message)
                .font(.subheadline)
                .multilineTextAlignment(.center)
        }
        .foregroundStyle(TimeTheme.mutedInk)
        .frame(maxWidth: .infinity)
        .padding(.vertical, 42)
    }
}

struct FolderPicker: View {
    let folders: [Folder]
    @Binding var selection: DocumentID?
    var excludedFolderId: DocumentID?

    var body: some View {
        Picker("Folder", selection: $selection) {
            Label("Inbox", systemImage: "tray").tag(DocumentID?.none)
            ForEach(folders.filter { $0.id != excludedFolderId }) { folder in
                Text(folder.name).tag(DocumentID?.some(folder.id))
            }
        }
    }
}

struct LabelSelectionList: View {
    let labels: [TimeCore.Label]
    @Binding var selection: Set<DocumentID>

    var body: some View {
        if labels.isEmpty {
            Text("No labels yet")
                .foregroundStyle(TimeTheme.mutedInk)
        } else {
            ForEach(labels) { label in
                Button {
                    if selection.contains(label.id) {
                        selection.remove(label.id)
                    } else {
                        selection.insert(label.id)
                    }
                } label: {
                    HStack {
                        Circle()
                            .fill(Color(hex: label.color))
                            .frame(width: 10, height: 10)
                        Text(label.name)
                            .foregroundStyle(TimeTheme.ink)
                        Spacer()
                        if selection.contains(label.id) {
                            Image(systemName: "checkmark")
                                .font(.caption.weight(.bold))
                                .foregroundStyle(TimeTheme.moss)
                        }
                    }
                }
                .buttonStyle(.plain)
            }
        }
    }
}

enum TimeText {
    static func duration(_ seconds: Int) -> String {
        let hours = seconds / 3_600
        let minutes = seconds % 3_600 / 60
        let remainingSeconds = seconds % 60
        return String(format: "%02d:%02d:%02d", hours, minutes, remainingSeconds)
    }

    static func compactDuration(_ seconds: Int) -> String {
        let hours = seconds / 3_600
        let minutes = seconds % 3_600 / 60
        if hours > 0 { return "\(hours)h \(minutes)m" }
        if minutes > 0 { return "\(minutes)m" }
        return "\(max(seconds, 0))s"
    }
}

extension Date {
    init(milliseconds: Int64) {
        self.init(timeIntervalSince1970: TimeInterval(milliseconds) / 1_000)
    }

    var millisecondsSince1970: Int64 {
        Int64((timeIntervalSince1970 * 1_000).rounded(.down))
    }
}
