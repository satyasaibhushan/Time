import type { TimeFormat, WeekStart } from "../domain/common";

function pad(value: number) {
  return value.toString().padStart(2, "0");
}

export function formatDurationClock(
  totalSeconds: number,
  options?: { includeSeconds?: boolean },
) {
  const safeTotalSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeTotalSeconds / 3600);
  const minutes = Math.floor((safeTotalSeconds % 3600) / 60);
  const seconds = safeTotalSeconds % 60;

  if (options?.includeSeconds) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }

  return `${pad(hours)}:${pad(minutes)}`;
}

export function formatWeekStartLabel(weekStart: WeekStart) {
  return weekStart === "monday" ? "Mon" : "Sun";
}

export function formatTimeFormatLabel(timeFormat: TimeFormat) {
  return timeFormat === "24h" ? "24h" : "12h";
}
