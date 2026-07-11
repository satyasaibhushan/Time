import AppIntents
import TimeCore

enum SummaryRangeIntent: String, AppEnum {
    case day
    case week
    case month

    static let typeDisplayRepresentation = TypeDisplayRepresentation(name: "Range")
    static let caseDisplayRepresentations: [Self: DisplayRepresentation] = [
        .day: "Day",
        .week: "Week",
        .month: "Month",
    ]

    var widgetRange: WidgetRange {
        WidgetRange(rawValue: rawValue) ?? .week
    }
}

struct FolderFilterEntity: AppEntity {
    static let typeDisplayRepresentation = TypeDisplayRepresentation(name: "Folder")
    static let defaultQuery = FolderFilterQuery()

    let id: String
    let name: String

    var displayRepresentation: DisplayRepresentation {
        DisplayRepresentation(title: "\(name)")
    }
}

struct FolderFilterQuery: EntityQuery {
    func entities(for identifiers: [String]) async throws -> [FolderFilterEntity] {
        folderEntities.filter { identifiers.contains($0.id) }
    }

    func suggestedEntities() async throws -> [FolderFilterEntity] {
        folderEntities
    }

    private var folderEntities: [FolderFilterEntity] {
        (WidgetSnapshotStore.load()?.folders ?? []).map {
            FolderFilterEntity(id: $0.id, name: $0.name)
        }
    }
}

struct LabelFilterEntity: AppEntity {
    static let typeDisplayRepresentation = TypeDisplayRepresentation(name: "Label")
    static let defaultQuery = LabelFilterQuery()

    let id: String
    let name: String

    var displayRepresentation: DisplayRepresentation {
        DisplayRepresentation(title: "\(name)")
    }
}

struct LabelFilterQuery: EntityQuery {
    func entities(for identifiers: [String]) async throws -> [LabelFilterEntity] {
        labelEntities.filter { identifiers.contains($0.id) }
    }

    func suggestedEntities() async throws -> [LabelFilterEntity] {
        labelEntities
    }

    private var labelEntities: [LabelFilterEntity] {
        (WidgetSnapshotStore.load()?.labels ?? []).map {
            LabelFilterEntity(id: $0.id, name: $0.name)
        }
    }
}

struct SummaryWidgetIntent: WidgetConfigurationIntent {
    static let title: LocalizedStringResource = "Tracked time"
    static let description = IntentDescription(
        "Choose a time range and optionally narrow the widget to one folder or label."
    )

    @Parameter(title: "Range", default: .week)
    var range: SummaryRangeIntent

    @Parameter(title: "Folder")
    var folder: FolderFilterEntity?

    @Parameter(title: "Label")
    var label: LabelFilterEntity?

    init() {}

    init(
        range: SummaryRangeIntent,
        folder: FolderFilterEntity? = nil,
        label: LabelFilterEntity? = nil
    ) {
        self.range = range
        self.folder = folder
        self.label = label
    }
}
