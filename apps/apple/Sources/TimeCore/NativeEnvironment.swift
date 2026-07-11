import Foundation

public struct NativeEnvironment: Equatable, Sendable {
    public enum ConfigurationError: Error, Equatable {
        case missingConvexURL
        case invalidConvexURL(String)
    }

    public let convexURL: URL

    public init(convexURLString: String) throws {
        guard !convexURLString.isEmpty else {
            throw ConfigurationError.missingConvexURL
        }

        guard
            let url = URL(string: convexURLString),
            url.scheme == "https",
            url.host?.hasSuffix(".convex.cloud") == true
        else {
            throw ConfigurationError.invalidConvexURL(convexURLString)
        }

        convexURL = url
    }
}
