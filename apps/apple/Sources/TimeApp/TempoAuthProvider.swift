import Auth0
import ConvexMobile
import Foundation

final class TempoAuthProvider: AuthProvider {
#if os(macOS)
    private let sessionCredentials = MacSessionCredentials()
#else
    private let credentialsManager = CredentialsManager(authentication: Auth0.authentication())
#endif

    func login(onIdToken _: @escaping @Sendable (String?) -> Void) async throws -> Credentials {
        let credentials = try await Auth0.webAuth()
            .scope("openid profile email offline_access")
            .parameters(["prompt": "select_account"])
            .useEphemeralSession()
            .start()
#if os(macOS)
        await sessionCredentials.store(credentials)
#else
        _ = credentialsManager.store(credentials: credentials)
#endif
        return credentials
    }

    func loginFromCache(onIdToken: @escaping @Sendable (String?) -> Void) async throws -> Credentials {
#if os(macOS)
        do {
            let credentials = try await sessionCredentials.validCredentials()
            onIdToken(credentials.idToken)
            return credentials
        } catch {
            onIdToken(nil)
            throw error
        }
#else
        try await credentialsManager.credentials()
#endif
    }

    func extractIdToken(from authResult: Credentials) -> String {
        authResult.idToken
    }

    func logout() async throws {
#if os(macOS)
        await sessionCredentials.clear()
#else
        _ = credentialsManager.clear()
#endif
    }
}

#if os(macOS)
private actor MacSessionCredentials {
    private var credentials: Credentials?

    func store(_ credentials: Credentials) {
        self.credentials = credentials
    }

    func clear() {
        credentials = nil
    }

    func validCredentials() async throws -> Credentials {
        guard let currentCredentials = credentials else {
            throw CredentialsManagerError.noCredentials
        }
        guard currentCredentials.expiresIn <= Date().addingTimeInterval(60) else {
            return currentCredentials
        }
        guard let refreshToken = currentCredentials.refreshToken else {
            self.credentials = nil
            throw CredentialsManagerError.noRefreshToken
        }

        let renewed = try await Auth0.authentication()
            .renew(withRefreshToken: refreshToken)
            .start()
        let refreshedCredentials = Credentials(
            accessToken: renewed.accessToken,
            tokenType: renewed.tokenType,
            idToken: renewed.idToken,
            refreshToken: renewed.refreshToken ?? refreshToken,
            expiresIn: renewed.expiresIn,
            scope: renewed.scope,
            recoveryCode: renewed.recoveryCode
        )
        self.credentials = refreshedCredentials
        return refreshedCredentials
    }
}
#endif
