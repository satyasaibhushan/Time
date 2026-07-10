import { AlertCircle, Inbox, Loader2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// ---------------------------------------------------------------------------
// Loading state
// ---------------------------------------------------------------------------

export function LoadingState({
  message = "Loading...",
  className,
}: {
  message?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-16 text-[var(--terra-sage)]",
        className,
      )}
    >
      <Loader2 className="size-6 animate-spin text-[var(--terra-moss)]" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-[1.8rem] border border-dashed border-[var(--input)] bg-[var(--card)]/60 py-16 text-center",
        className,
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-2xl bg-[var(--muted)] text-[var(--terra-sage)]">
        <Icon className="size-5" />
      </div>
      <div>
        <p className="text-sm font-semibold text-[var(--terra-pine)]">{title}</p>
        {description && (
          <p className="mt-1 max-w-xs text-sm text-[var(--terra-sage)]">{description}</p>
        )}
      </div>
      {action && (
        <Button
          variant="outline"
          size="sm"
          onClick={action.onClick}
          className="mt-2 rounded-xl"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Error state
// ---------------------------------------------------------------------------

export function ErrorState({
  title = "Something went wrong",
  message,
  retry,
  className,
}: {
  title?: string;
  message?: string;
  retry?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-[1.8rem] border border-[var(--terra-clay)]/30 bg-[var(--terra-clay)]/10 py-16 text-center",
        className,
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-2xl bg-[var(--terra-clay)]/15 text-[var(--terra-clay)]">
        <AlertCircle className="size-5" />
      </div>
      <div>
        <p className="text-sm font-semibold text-[#8a4630]">{title}</p>
        {message && (
          <p className="mt-1 max-w-sm text-sm text-[#8a4630]/80">{message}</p>
        )}
      </div>
      {retry && (
        <Button
          variant="outline"
          size="sm"
          onClick={retry}
          className="mt-2 rounded-xl border-[var(--terra-clay)]/40 text-[#8a4630] hover:bg-[var(--terra-clay)]/15"
        >
          Try again
        </Button>
      )}
    </div>
  );
}
