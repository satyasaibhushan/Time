import {
  formatTimeFormatLabel,
  formatWeekStartLabel,
} from "@time/shared";
import { ShellCard } from "@/components/shell-card";
import { SectionPage } from "@/components/section-page";

export default function SettingsPage() {
  return (
    <SectionPage
      eyebrow="Settings"
      title="Personal preferences, auth identity, and the defaults that shape the rest of the app."
      description="This area will stay compact: timezone, week start, time format, and account controls. Personal software should keep settings sharp, not sprawling."
      stats={[
        { label: "Time Format", value: formatTimeFormatLabel("24h") },
        { label: "Week Start", value: formatWeekStartLabel("monday") },
      ]}
    >
      <ShellCard
        title="Preferences"
        description="These are the first stable settings we know the data model needs."
      >
        <div className="space-y-3">
          {["Timezone", "Week start", "Time format"].map((item) => (
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
        title="Account"
        description="Auth0 and Google login wiring will surface here once we connect the auth flow."
      >
        <div className="space-y-3 text-sm text-stone-400">
          <div className="rounded-2xl border border-dashed border-stone-700/80 px-4 py-4">
            Auth provider status
          </div>
          <div className="rounded-2xl border border-dashed border-stone-700/80 px-4 py-4">
            Logout action
          </div>
        </div>
      </ShellCard>
    </SectionPage>
  );
}
