"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="surface-panel mx-auto max-w-2xl p-8 text-center md:p-12">
      <p className="page-kicker">Something went wrong</p>
      <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-[var(--terra-pine)]">
        This view could not be loaded.
      </h1>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--terra-sage)]">
        Your tracked time is safe. Try the request again, or refresh the page if
        the problem continues.
      </p>
      <Button onClick={reset} className="signal-button mt-6 gap-2">
        <RotateCcw className="size-4" />
        Try again
      </Button>
    </section>
  );
}

