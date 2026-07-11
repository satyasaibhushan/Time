// swift-tools-version: 6.2

import PackageDescription

let package = Package(
    name: "TimeApple",
    platforms: [
        .iOS(.v17),
        .macOS(.v14),
    ],
    products: [
        .library(name: "TimeCore", targets: ["TimeCore"]),
    ],
    targets: [
        .target(name: "TimeCore"),
        .testTarget(name: "TimeCoreTests", dependencies: ["TimeCore"]),
    ]
)
