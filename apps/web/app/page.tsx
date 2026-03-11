import { redirect } from "next/navigation";
import { auth0 } from "@/lib/auth0";

export default async function Home() {
  const session = await auth0.getSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(210,166,95,0.18),_transparent_26%),radial-gradient(circle_at_bottom_right,_rgba(122,161,255,0.12),_transparent_24%),linear-gradient(180deg,_#17120d_0%,_#0e0b08_100%)] px-4 py-6 text-stone-100 md:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl flex-col justify-between rounded-[2.5rem] border border-stone-800/80 bg-stone-950/72 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.45)] backdrop-blur md:p-8">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-16">
          <section className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-300/10 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-amber-200/80">
              Authentication Foundation
            </div>
            <h1 className="mt-6 max-w-2xl font-serif text-5xl tracking-tight text-stone-50 md:text-6xl">
              Sign in once, then keep the timer flow scoped to your own data.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-stone-400">
              This app is personal, but it still needs a real identity layer.
              Auth0 now owns login, logout, callback handling, and route
              protection for the web app.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="/auth/login"
                className="inline-flex items-center justify-center rounded-2xl bg-stone-100 px-5 py-3 text-sm font-medium text-stone-950 transition hover:bg-stone-200"
              >
                Log in
              </a>
              <a
                href="/auth/login?screen_hint=signup"
                className="inline-flex items-center justify-center rounded-2xl border border-stone-700 bg-stone-900/70 px-5 py-3 text-sm font-medium text-stone-100 transition hover:border-stone-600 hover:bg-stone-900"
              >
                Sign up
              </a>
            </div>
          </section>

          <aside className="grid gap-4 self-start">
            <div className="rounded-[2rem] border border-stone-800/70 bg-[linear-gradient(145deg,rgba(38,29,23,0.96),rgba(16,13,10,0.92))] p-6">
              <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">
                What&apos;s live
              </p>
              <div className="mt-4 space-y-3 text-sm text-stone-300">
                <div className="rounded-2xl border border-stone-800 bg-stone-900/70 px-4 py-4">
                  Auth0 session handling
                </div>
                <div className="rounded-2xl border border-stone-800 bg-stone-900/70 px-4 py-4">
                  Protected app routes
                </div>
                <div className="rounded-2xl border border-stone-800 bg-stone-900/70 px-4 py-4">
                  Logout flow in the shell
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-amber-300/20 bg-amber-300/8 p-6 text-sm leading-7 text-amber-100/90">
              Next slice: map the Auth0 identity into Convex and auto-create the
              `users` row on first authenticated request.
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
