import { ShellCard } from "@/components/shell-card";
import { SectionPage } from "@/components/section-page";

const swatches = [
  "bg-amber-300",
  "bg-red-300",
  "bg-emerald-300",
  "bg-sky-300",
  "bg-fuchsia-300",
  "bg-lime-300",
];

export default function LabelsPage() {
  return (
    <SectionPage
      eyebrow="Labels"
      title="Reusable labels with inheritance from folders and manual additions on entries."
      description="Labels are lightweight, but the rules are important: folder defaults cascade downward, while timers may still add extra labels directly."
      stats={[
        { label: "Inheritance", value: "On" },
        { label: "Mode", value: "Hybrid" },
      ]}
    >
      <ShellCard
        title="Label library"
        description="This page will become the compact home for color and naming decisions."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {["Deep Work", "Admin", "Writing", "Planning"].map((label, index) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-2xl border border-stone-800 bg-stone-900/65 px-4 py-4 text-sm text-stone-200"
            >
              <span className={`size-3 rounded-full ${swatches[index]}`} />
              {label}
            </div>
          ))}
        </div>
      </ShellCard>

      <ShellCard
        title="Inheritance model"
        description="This clarifies the rules we already agreed on, so the UI later stays obvious."
      >
        <div className="space-y-3 text-sm text-stone-400">
          <div className="rounded-2xl border border-stone-800 bg-stone-900/65 px-4 py-4">
            Parent folder labels cascade into descendants
          </div>
          <div className="rounded-2xl border border-stone-800 bg-stone-900/65 px-4 py-4">
            Selected folder labels apply automatically to timers
          </div>
          <div className="rounded-2xl border border-stone-800 bg-stone-900/65 px-4 py-4">
            Timer-specific labels can still be added manually
          </div>
        </div>
      </ShellCard>
    </SectionPage>
  );
}
