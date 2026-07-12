import AppKit
import SwiftUI

@main
struct TempoMacApp: App {
    init() {
        NSApplication.shared.appearance = NSAppearance(named: .aqua)
    }

    var body: some Scene {
        WindowGroup {
            MacAppRootView()
                .frame(minWidth: 920, minHeight: 640)
                .preferredColorScheme(.light)
        }
        .defaultSize(width: 1_180, height: 780)
        .windowStyle(.hiddenTitleBar)
        .commands {
            SidebarCommands()
        }
    }
}
