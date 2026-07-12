import Auth0
import ConvexMobile
import Foundation

final class TempoAuthProvider: AuthProvider {
    private let credentialsManager = CredentialsManager(authentication: Auth0.authentication())

    func login(onIdToken _: @escaping @Sendable (String?) -> Void) async throws -> Credentials {
        let credentials = try await Auth0.webAuth()
            .scope("openid profile email offline_access")
            .parameters(["prompt": "select_account"])
            .useEphemeralSession()
            .start()
        _ = credentialsManager.store(credentials: credentials)
        return credentials
    }

    func loginFromCache(onIdToken _: @escaping @Sendable (String?) -> Void) async throws -> Credentials {
        try await credentialsManager.credentials()
    }

    func extractIdToken(from authResult: Credentials) -> String {
        authResult.idToken
    }

    func logout() async throws {
        _ = credentialsManager.clear()
    }
}
