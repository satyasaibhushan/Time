import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function ShellCard({
  title,
  description,
  accent,
  children,
}: {
  title: string;
  description: string;
  accent?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "surface-panel border border-[var(--border)] p-5",
        accent
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-medium tracking-tight text-[var(--terra-pine)]">
            {title}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--terra-sage)]">{description}</p>
        </div>
      </div>
      <div className="mt-6">{children}</div>
    </div>
  );
}
