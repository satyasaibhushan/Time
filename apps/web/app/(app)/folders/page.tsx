import { ShellCard } from "@/components/shell-card";
import { SectionPage } from "@/components/section-page";

export default function FoldersPage() {
  return (
    <SectionPage
      eyebrow="Folders"
      title="One recursive hierarchy. Inbox at the root. No split between folders and projects."
      description="This section will manage the full tree, inherited labels, archive state, and the move-to-Inbox behavior when a folder disappears."
      stats={[
        { label: "Hierarchy", value: "1" },
        { label: "Fallback", value: "Inbox" },
      ]}
    >
      <ShellCard
        title="Hierarchy canvas"
        description="The eventual tree should be easy to scan and move through, with room for nesting without feeling enterprise-heavy."
      >
        <div className="space-y-3 text-sm text-stone-300">
          <div className="rounded-2xl border border-amber-300/20 bg-amber-300/8 px-4 py-4">
            Inbox
          </div>
          <div className="ml-4 rounded-2xl border border-stone-800 bg-stone-900/65 px-4 py-4">
            Work
          </div>
          <div className="ml-8 rounded-2xl border border-stone-800 bg-stone-900/65 px-4 py-4">
            Product
          </div>
        </div>
      </ShellCard>

      <ShellCard
        title="Folder rules"
        description="The shell reserves space for folder defaults and operational rules before we wire the backend."
      >
        <ul className="space-y-3 text-sm text-stone-400">
          <li className="rounded-2xl border border-stone-800 bg-stone-900/65 px-4 py-4">
            Default labels inherit through all ancestors
          </li>
          <li className="rounded-2xl border border-stone-800 bg-stone-900/65 px-4 py-4">
            Deleted folder content moves to Inbox
          </li>
          <li className="rounded-2xl border border-stone-800 bg-stone-900/65 px-4 py-4">
            Archive should preserve history, not hide data forever
          </li>
        </ul>
      </ShellCard>
    </SectionPage>
  );
}
