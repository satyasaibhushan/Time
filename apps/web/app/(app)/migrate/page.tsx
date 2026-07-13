"use client";

import { useState } from "react";
import { ConvexHttpClient } from "convex/browser";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { CheckCircle2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/states";

const migrationTargetUrl = process.env.NEXT_PUBLIC_MIGRATION_CONVEX_URL;

type MigrationResult = {
  folders: number;
  labels: number;
  entries: number;
};

export default function MigrationPage() {
  const snapshot = useQuery(api.migration.exportCurrentUserData, {});
  const [result, setResult] = useState<MigrationResult>();
  const [error, setError] = useState<string>();
  const [isMigrating, setIsMigrating] = useState(false);

  async function migrate() {
    if (!snapshot || !migrationTargetUrl) return;

    setError(undefined);
    setIsMigrating(true);
    try {
      const tokenResponse = await fetch("/api/auth/convex-token", {
        cache: "no-store",
      });
      if (!tokenResponse.ok) {
        throw new Error("Your login expired. Sign in again and retry.");
      }

      const tokenData = (await tokenResponse.json()) as { token?: string };
      if (!tokenData.token) {
        throw new Error("Could not obtain a migration token.");
      }

      const target = new ConvexHttpClient(migrationTargetUrl);
      target.setAuth(tokenData.token);
      const imported = await target.mutation(api.migration.importCurrentUserData, {
        snapshot,
      });
      const verified = await target.query(api.migration.importStatus, {
        sourceUserId: snapshot.sourceUserId,
      });

      if (
        !verified ||
        verified.folderCount !== imported.folders ||
        verified.labelCount !== imported.labels ||
        verified.entryCount !== imported.entries
      ) {
        throw new Error("The target did not confirm the imported record counts.");
      }

      setResult(imported);
    } catch (migrationError) {
      setError(
        migrationError instanceof Error
          ? migrationError.message
          : "Migration failed safely before the deployment switch.",
      );
    } finally {
      setIsMigrating(false);
    }
  }

  if (snapshot === undefined) {
    return <LoadingState message="Preparing your data..." />;
  }

  return (
    <section className="mx-auto grid max-w-2xl gap-6">
      <div className="page-hero">
        <p className="page-kicker">System / migration</p>
        <h1 className="page-title">Move Tempo safely.</h1>
        <p className="page-subtitle">
          Copy your profile, folders, labels, and time entries to the reachable
          production service before Tempo switches over.
        </p>
      </div>

      <div className="surface-panel grid gap-5 p-6">
        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            ["Folders", snapshot.folders.length],
            ["Labels", snapshot.labels.length],
            ["Entries", snapshot.entries.length],
          ].map(([label, count]) => (
            <div className="rounded-2xl bg-[var(--terra-mist)] p-4" key={label}>
              <p className="text-2xl font-semibold text-[var(--terra-pine)]">
                {count}
              </p>
              <p className="text-sm text-[var(--terra-sage)]">{label}</p>
            </div>
          ))}
        </div>

        {!migrationTargetUrl && (
          <p className="text-sm text-red-700">
            The migration target is not configured in this environment.
          </p>
        )}
        {error && <p className="text-sm text-red-700">{error}</p>}
        {result ? (
          <div className="flex items-center gap-3 rounded-2xl bg-[var(--terra-mist)] p-4 text-[var(--terra-pine)]">
            <CheckCircle2 className="size-5" />
            <span>
              Verified {result.entries} entries, {result.folders} folders, and{" "}
              {result.labels} labels in the new production service.
            </span>
          </div>
        ) : (
          <Button
            className="signal-button rounded-xl"
            disabled={isMigrating || !migrationTargetUrl}
            onClick={migrate}
          >
            {isMigrating && <Loader2 className="size-4 animate-spin" />}
            {isMigrating ? "Copying and verifying..." : "Copy and verify data"}
          </Button>
        )}
      </div>
    </section>
  );
}
