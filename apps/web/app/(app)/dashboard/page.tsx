import { ShellCard } from "@/components/shell-card";
import { SectionPage } from "@/components/section-page";

export default function DashboardPage() {
  return (
    <SectionPage
      eyebrow="Dashboard"
      title="Operational overview for the timer you will build next."
      description="This screen is the future home of the active timer, today totals, and the fast actions that should stay visible across the web app."
      stats={[
        { label: "Active Timer", value: "0" },
        { label: "Today's Hours", value: "00:00" },
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
        <div className="space-y-3">
          {["No entries yet", "Weekly total placeholder", "Month snapshot placeholder"].map(
            (item) => (
              <div
                key={item}
                className="rounded-2xl border border-dashed border-stone-700/80 px-4 py-4 text-sm text-stone-500"
              >
                {item}
              </div>
            )
          )}
        </div>
      </ShellCard>
    </SectionPage>
  );
}
