import Auth0
import ConvexAuth0
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
    private let client = ConvexClientWithAuth<Credentials>(
        deploymentUrl: "https://silent-bat-335.eu-west-1.convex.cloud",
        authProvider: Auth0Provider()
    )
    @ObservationIgnored
    private let credentialsManager = CredentialsManager(authentication: Auth0.authentication())
    @ObservationIgnored
    private var didRestore = false

    func restoreIfNeeded() async {
        guard !didRestore else { return }
        didRestore = true

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
        await client.logout()
        timerStore = nil
        errorMessage = nil
        phase = .signedOut
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
