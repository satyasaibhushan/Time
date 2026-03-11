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
        "rounded-[1.8rem] border border-stone-800/70 bg-stone-950/72 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.22)]",
        accent
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-medium tracking-tight text-stone-100">
            {title}
          </h2>
          <p className="mt-2 text-sm leading-6 text-stone-400">{description}</p>
        </div>
      </div>
      <div className="mt-6">{children}</div>
    </div>
  );
}
