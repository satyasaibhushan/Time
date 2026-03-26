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
        "flex flex-col items-center justify-center gap-3 py-16 text-stone-400",
        className,
      )}
    >
      <Loader2 className="size-6 animate-spin text-stone-500" />
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
        "flex flex-col items-center justify-center gap-4 rounded-[1.8rem] border border-dashed border-stone-800/70 bg-stone-950/40 py-16 text-center",
        className,
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-2xl bg-stone-800/60 text-stone-500">
        <Icon className="size-5" />
      </div>
      <div>
        <p className="text-sm font-medium text-stone-300">{title}</p>
        {description && (
          <p className="mt-1 max-w-xs text-sm text-stone-500">{description}</p>
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
        "flex flex-col items-center justify-center gap-4 rounded-[1.8rem] border border-red-900/40 bg-red-950/20 py-16 text-center",
        className,
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-2xl bg-red-950/60 text-red-400">
        <AlertCircle className="size-5" />
      </div>
      <div>
        <p className="text-sm font-medium text-red-300">{title}</p>
        {message && (
          <p className="mt-1 max-w-sm text-sm text-red-400/70">{message}</p>
        )}
      </div>
      {retry && (
        <Button
          variant="outline"
          size="sm"
          onClick={retry}
          className="mt-2 rounded-xl border-red-900/50 text-red-300 hover:bg-red-950/40"
        >
          Try again
        </Button>
      )}
    </div>
  );
}
