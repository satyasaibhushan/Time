import { ShellCard } from "@/components/shell-card";
import { SectionPage } from "@/components/section-page";

export default function EntriesPage() {
  return (
    <SectionPage
      eyebrow="Entries"
      title="A chronological workspace for edits, manual entries, and continuation."
      description="Entries will eventually group by day, filter by folder or label, and support manual backfilling without losing the lightweight feel of a personal tool."
      stats={[
        { label: "Filters", value: "3" },
        { label: "Grouping", value: "Day" },
      ]}
    >
      <ShellCard
        title="Timeline column"
        description="The main list should stay dense, scan-friendly, and date-grouped."
      >
        <div className="space-y-3">
          {["Today", "Yesterday", "Earlier this week"].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-stone-800 bg-stone-900/65 px-4 py-4 text-sm text-stone-300"
            >
              {item}
            </div>
          ))}
        </div>
      </ShellCard>

      <ShellCard
        title="Manual entry tools"
        description="Manual creation and editing can stay in dialogs, but the shell already reserves space for that control model."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {["Date range", "Folder filter", "Label filter", "Continue action"].map(
            (item) => (
              <div
                key={item}
                className="rounded-2xl border border-dashed border-stone-700/80 px-4 py-6 text-sm text-stone-500"
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
