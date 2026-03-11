import { auth0 } from "@/lib/auth0";
import { formatDurationClock } from "@time/shared";
import { CurrentUserStatus } from "@/components/current-user-status";
import { ShellCard } from "@/components/shell-card";
import { SectionPage } from "@/components/section-page";

export default async function DashboardPage() {
  const session = await auth0.getSession();

  if (!session) {
    return null;
  }

  const displayName =
    session.user.name ?? session.user.nickname ?? "Personal account";

  return (
    <SectionPage
      eyebrow="Dashboard"
      title="Operational overview for the timer you will build next."
      description="This screen is the future home of the active timer, today totals, and the fast actions that should stay visible across the web app."
      stats={[
        { label: "Active Timer", value: "0" },
        { label: "Today's Hours", value: formatDurationClock(0) },
      ]}
    >
      <ShellCard
        title="Current timer zone"
        description="The primary timer composer belongs here. Folder selection, inherited labels, notes, and start or pause controls will all live in this block."
        accent="bg-[linear-gradient(145deg,rgba(87,53,20,0.18),rgba(10,10,10,0.3))]"
      >
        <div className="grid gap-3 text-sm text-stone-400">
          <div className="rounded-2xl border border-stone-800 bg-stone-900/70 p-4">
            Empty title allowed
          </div>
          <div className="rounded-2xl border border-stone-800 bg-stone-900/70 p-4">
            Inbox fallback when no folder is chosen
          </div>
          <div className="rounded-2xl border border-stone-800 bg-stone-900/70 p-4">
            Inherited labels preview
          </div>
        </div>
      </ShellCard>

      <ShellCard
        title="Recent pulse"
        description="A concise stream of the latest entries belongs here, with continue and edit affordances once the data layer exists."
      >
        <div className="grid gap-4">
          <div className="rounded-[1.8rem] border border-amber-300/20 bg-[linear-gradient(145deg,rgba(87,53,20,0.24),rgba(10,10,10,0.4))] p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-4">
                {session.user.picture ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    alt={displayName}
                    className="size-14 rounded-[1.4rem] border border-amber-300/20 object-cover shadow-[0_12px_30px_rgba(0,0,0,0.28)]"
                    src={session.user.picture}
                  />
                ) : (
                  <div className="flex size-14 items-center justify-center rounded-[1.4rem] bg-amber-300 text-lg font-semibold text-stone-950">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="text-[11px] uppercase tracking-[0.28em] text-amber-200/70">
                    Current User
                  </div>
                  <h3 className="mt-2 truncate text-xl font-medium tracking-tight text-stone-50">
                    {displayName}
                  </h3>
                  <p className="mt-1 truncate text-sm text-stone-300">
                    {session.user.email ?? "Authenticated with Auth0"}
                  </p>
                </div>
              </div>

              <a
                className="inline-flex shrink-0 items-center justify-center rounded-2xl border border-stone-700 bg-stone-950/75 px-4 py-2 text-sm font-medium text-stone-100 transition hover:border-stone-600 hover:bg-stone-900"
                href="/auth/logout"
              >
                Log out
              </a>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div
                className="rounded-2xl border border-stone-800/80 bg-stone-950/75 px-4 py-4"
              >
                <div className="text-[11px] uppercase tracking-[0.24em] text-stone-500">
                  Provider
                </div>
                <div className="mt-2 text-sm text-stone-200">Auth0</div>
              </div>
              <div className="rounded-2xl border border-stone-800/80 bg-stone-950/75 px-4 py-4">
                <div className="text-[11px] uppercase tracking-[0.24em] text-stone-500">
                  App Sync
                </div>
                <div className="mt-2 text-sm text-stone-200">
                  <CurrentUserStatus />
                </div>
              </div>
              <div className="rounded-2xl border border-stone-800/80 bg-stone-950/75 px-4 py-4">
                <div className="text-[11px] uppercase tracking-[0.24em] text-stone-500">
                  Identity
                </div>
                <div className="mt-2 truncate text-sm text-stone-200">
                  {session.user.sub}
                </div>
              </div>
            </div>
          </div>

          {["No entries yet", "Weekly total placeholder", "Month snapshot placeholder"].map(
            (item) => (
              <div
                key={item}
                className="rounded-2xl border border-dashed border-stone-700/80 px-4 py-4 text-sm text-stone-500"
              >
                {item}
              </div>
            ),
          )}
        </div>
      </ShellCard>
    </SectionPage>
  );
}
