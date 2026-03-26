"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import {
  Play,
  Pause,
  Square,
  Trash2,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TimerDisplay } from "./timer-display";
import { FolderPicker } from "./folder-picker";
import { LabelPicker } from "./label-picker";

export function TimerWidget({ className }: { className?: string }) {
  const activeTimer = useQuery(api.timeEntries.getActiveTimer, {});
  const inheritedLabels = useQuery(
    api.folders.getInheritedLabels,
    activeTimer?.folderId ? { folderId: activeTimer.folderId } : "skip",
  );

  const startTimer = useMutation(api.timeEntries.startTimer);
  const pauseTimer = useMutation(api.timeEntries.pauseTimer);
  const resumeTimer = useMutation(api.timeEntries.resumeTimer);
  const stopTimer = useMutation(api.timeEntries.stopTimer);
  const discardTimer = useMutation(api.timeEntries.discardTimer);

  // Form state for starting a new timer
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [folderId, setFolderId] = useState<Id<"folders"> | undefined>();
  const [labelIds, setLabelIds] = useState<Id<"labels">[]>([]);
  const [showNotes, setShowNotes] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  // Inherited labels for the form folder (when no active timer)
  const formInheritedLabels = useQuery(
    api.folders.getInheritedLabels,
    folderId ? { folderId } : "skip",
  );

  const handleStart = useCallback(async () => {
    setIsStarting(true);
    try {
      await startTimer({
        title: title || undefined,
        folderId: folderId || undefined,
        manualLabelIds: labelIds.length > 0 ? labelIds : undefined,
      });
      // Reset form
      setTitle("");
      setNotes("");
      setFolderId(undefined);
      setLabelIds([]);
      setShowNotes(false);
    } finally {
      setIsStarting(false);
    }
  }, [startTimer, title, folderId, labelIds]);

  const handlePause = useCallback(async () => {
    if (!activeTimer) return;
    await pauseTimer({ entryId: activeTimer._id });
  }, [pauseTimer, activeTimer]);

  const handleResume = useCallback(async () => {
    if (!activeTimer) return;
    await resumeTimer({ entryId: activeTimer._id });
  }, [resumeTimer, activeTimer]);

  const handleStop = useCallback(async () => {
    if (!activeTimer) return;
    await stopTimer({ entryId: activeTimer._id });
  }, [stopTimer, activeTimer]);

  const handleDiscard = useCallback(async () => {
    if (!activeTimer) return;
    await discardTimer({ entryId: activeTimer._id });
  }, [discardTimer, activeTimer]);

  // Loading state — query hasn't resolved yet
  if (activeTimer === undefined) {
    return (
      <div
        className={cn(
          "rounded-[2rem] border border-stone-800/70 bg-[linear-gradient(145deg,rgba(87,53,20,0.18),rgba(10,10,10,0.3))] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.22)] md:p-8",
          className,
        )}
      >
        <div className="flex flex-col items-center justify-center gap-3 py-12">
          <Loader2 className="size-6 animate-spin text-stone-500" />
          <p className="text-sm text-stone-400">Loading timer...</p>
        </div>
      </div>
    );
  }

  // Active timer (running or paused)
  if (activeTimer) {
    const isRunning = activeTimer.status === "running";
    const isPaused = activeTimer.status === "paused";

    return (
      <div
        className={cn(
          "rounded-[2rem] border shadow-[0_20px_50px_rgba(0,0,0,0.22)] md:p-8",
          isRunning
            ? "border-amber-300/20 bg-[linear-gradient(145deg,rgba(87,53,20,0.22),rgba(10,10,10,0.3))] p-6"
            : "border-stone-800/70 bg-[linear-gradient(145deg,rgba(50,40,30,0.18),rgba(10,10,10,0.3))] p-6",
          className,
        )}
      >
        {/* Status label */}
        <div className="flex items-center gap-2">
          {isRunning && (
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-amber-300 opacity-50" />
              <span className="relative inline-flex size-2 rounded-full bg-amber-300" />
            </span>
          )}
          {isPaused && (
            <span className="inline-flex size-2 rounded-full bg-stone-500" />
          )}
          <span className="text-[11px] uppercase tracking-[0.28em] text-stone-500">
            {isRunning ? "Running" : "Paused"}
          </span>
        </div>

        {/* Timer display */}
        <div className="mt-6 flex items-center justify-center">
          <TimerDisplay
            segments={activeTimer.segments}
            status={activeTimer.status as "running" | "paused" | "completed"}
          />
        </div>

        {/* Title */}
        {activeTimer.title && (
          <p className="mt-5 text-center text-lg font-medium tracking-tight text-stone-200">
            {activeTimer.title}
          </p>
        )}

        {/* Meta row */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {activeTimer.folderId && (
            <FolderPicker
              value={activeTimer.folderId}
              onChange={() => {}}
              className="pointer-events-none opacity-80"
            />
          )}
          {((activeTimer.manualLabelIds &&
            activeTimer.manualLabelIds.length > 0) ||
            (inheritedLabels && inheritedLabels.length > 0)) && (
            <LabelPicker
              value={activeTimer.manualLabelIds ?? []}
              onChange={() => {}}
              inheritedLabelIds={inheritedLabels ?? undefined}
              className="pointer-events-none opacity-80"
            />
          )}
        </div>

        {/* Action buttons */}
        <div className="mt-8 flex items-center justify-center gap-3">
          {isRunning && (
            <Button
              variant="outline"
              size="lg"
              onClick={handlePause}
              className="gap-2 rounded-xl border-stone-700 text-stone-300 hover:bg-stone-800/60"
            >
              <Pause className="size-4" />
              Pause
            </Button>
          )}

          {isPaused && (
            <Button
              size="lg"
              onClick={handleResume}
              className="gap-2 rounded-xl bg-amber-300 text-stone-950 hover:bg-amber-200"
            >
              <Play className="size-4" />
              Resume
            </Button>
          )}

          <Button
            variant="outline"
            size="lg"
            onClick={handleStop}
            className="gap-2 rounded-xl border-stone-700 text-stone-300 hover:bg-stone-800/60"
          >
            <Square className="size-3.5" />
            Stop
          </Button>

          <Button
            variant="ghost"
            size="icon-lg"
            onClick={handleDiscard}
            className="rounded-xl text-stone-400 hover:text-red-400"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>
    );
  }

  // No active timer — show start form
  return (
    <div
      className={cn(
        "rounded-[2rem] border border-stone-800/70 bg-[linear-gradient(145deg,rgba(87,53,20,0.18),rgba(10,10,10,0.3))] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.22)] md:p-8",
        className,
      )}
    >
      <p className="text-[11px] uppercase tracking-[0.28em] text-stone-500">
        Timer
      </p>

      <div className="mt-5 space-y-4">
        {/* Title input */}
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What are you working on?"
          className="h-10 rounded-xl border-stone-800/70 bg-stone-900/60 text-base text-stone-100 placeholder:text-stone-500 focus-visible:border-amber-300/40 focus-visible:ring-amber-300/20"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleStart();
            }
          }}
        />

        {/* Pickers row */}
        <div className="flex flex-wrap items-center gap-2">
          <FolderPicker value={folderId} onChange={setFolderId} />
          <LabelPicker
            value={labelIds}
            onChange={setLabelIds}
            inheritedLabelIds={
              (formInheritedLabels as Id<"labels">[] | undefined) ?? undefined
            }
          />

          <button
            type="button"
            onClick={() => setShowNotes(!showNotes)}
            className="ml-auto inline-flex items-center gap-1 text-xs text-stone-500 transition-colors hover:text-stone-400"
          >
            Notes
            {showNotes ? (
              <ChevronUp className="size-3" />
            ) : (
              <ChevronDown className="size-3" />
            )}
          </button>
        </div>

        {/* Notes textarea */}
        {showNotes && (
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes..."
            className="min-h-[60px] rounded-xl border-stone-800/70 bg-stone-900/60 text-sm text-stone-200 placeholder:text-stone-500 focus-visible:border-amber-300/40 focus-visible:ring-amber-300/20"
          />
        )}

        {/* Start button */}
        <Button
          size="lg"
          onClick={handleStart}
          disabled={isStarting}
          className="w-full gap-2 rounded-xl bg-amber-300 text-base font-medium text-stone-950 hover:bg-amber-200 disabled:opacity-50"
        >
          {isStarting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Play className="size-4" />
          )}
          Start Timer
        </Button>
      </div>
    </div>
  );
}
