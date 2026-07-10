"use client";

import { useSyncExternalStore } from "react";

import { toWholeSecond } from "@/lib/timer-state";

type ClockListener = () => void;

let clockSecond = toWholeSecond(Date.now());
let clockTimeout: ReturnType<typeof setTimeout> | undefined;
const listeners = new Set<ClockListener>();

function scheduleNextSecond(): void {
  if (listeners.size === 0 || clockTimeout !== undefined) return;

  const delay = Math.max(8, 1_000 - (Date.now() % 1_000) + 4);
  clockTimeout = setTimeout(() => {
    clockTimeout = undefined;
    const nextSecond = toWholeSecond(Date.now());
    if (nextSecond !== clockSecond) {
      clockSecond = nextSecond;
      for (const listener of listeners) listener();
    }
    scheduleNextSecond();
  }, delay);
}

function subscribe(listener: ClockListener): () => void {
  listeners.add(listener);
  clockSecond = toWholeSecond(Date.now());
  scheduleNextSecond();

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && clockTimeout !== undefined) {
      clearTimeout(clockTimeout);
      clockTimeout = undefined;
    }
  };
}

function getSnapshot(): number {
  return clockSecond;
}

const subscribeToNothing = () => () => {};
const getZero = () => 0;

/** One shared wall-clock tick for every running timer on the page. */
export function useWholeSecondClock(enabled = true): number {
  return useSyncExternalStore(
    enabled ? subscribe : subscribeToNothing,
    enabled ? getSnapshot : getZero,
    getZero,
  );
}
