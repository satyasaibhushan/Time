export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-950 px-6 text-stone-100">
      <div className="w-full max-w-2xl rounded-3xl border border-stone-800 bg-stone-900 p-10">
        <p className="text-sm uppercase tracking-[0.3em] text-stone-500">
          Phase 1
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">Time</h1>
        <p className="mt-4 max-w-xl text-base text-stone-400">
          Web-first personal time tracking app. Foundation is ready. App shell,
          auth, and timer flows come next.
        </p>
      </div>
    </main>
  );
}
