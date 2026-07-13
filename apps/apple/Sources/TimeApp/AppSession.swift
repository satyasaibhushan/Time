import Auth0
import ConvexMobile
import Foundation
import Observation
import TimeCore

@MainActor
@Observable
final class AppSession {
    enum Phase: Equatable {
        case loading
        case signedOut
        case signedIn
    }

    private(set) var phase: Phase = .loading
    private(set) var timerStore: ConvexTimerStore?
    private(set) var errorMessage: String?

    @ObservationIgnored
    private let client: ConvexClientWithAuth<Credentials>
#if !os(macOS)
    @ObservationIgnored
    private let credentialsManager = CredentialsManager(authentication: Auth0.authentication())
#endif
    @ObservationIgnored
    private var didRestore = false

    init() {
        do {
            let environment = try NativeEnvironment.configured()
            client = ConvexClientWithAuth<Credentials>(
                deploymentUrl: environment.convexURL.absoluteString,
                authProvider: TempoAuthProvider()
            )
        } catch {
            preconditionFailure("Tempo configuration error: \(error.localizedDescription)")
        }
    }

    func restoreIfNeeded() async {
        guard !didRestore else { return }
        didRestore = true

#if os(macOS)
        phase = .signedOut
#else
        let credentialsManager = credentialsManager
        let hasCachedSession = await Task.detached {
            credentialsManager.hasValid() || credentialsManager.canRenew()
        }.value

        guard hasCachedSession else {
            phase = .signedOut
            return
        }

        switch await client.loginFromCache() {
        case .success:
            await activateAuthenticatedSession()
        case .failure:
            phase = .signedOut
        }
#endif
    }

    func login() async {
        phase = .loading
        errorMessage = nil

        switch await client.login() {
        case .success:
            await activateAuthenticatedSession()
        case .failure(let error):
            errorMessage = error.localizedDescription
            phase = .signedOut
        }
    }

    func logout() async {
#if !os(macOS)
        _ = credentialsManager.clear()
#endif
        timerStore = nil
        errorMessage = nil
        phase = .signedOut
        await client.logout()
    }

    private func activateAuthenticatedSession() async {
        do {
            let timezone = TimeZone.current.identifier
            let _: DocumentID = try await client.mutation(
                ConvexAPI.Users.ensureCurrent,
                with: ["timezone": timezone]
            )
            timerStore = ConvexTimerStore(client: client)
            phase = .signedIn
        } catch {
            errorMessage = error.localizedDescription
            phase = .signedOut
        }
    }
}
