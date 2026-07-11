import { startOfDay, subDays, subMonths } from "date-fns";

export type EntryDatePreset = "today" | "week" | "month" | "all";

export function getEntryDateRange(
  preset: EntryDatePreset,
  now = new Date(),
): { startDate?: number; endDate?: number } {
  switch (preset) {
    case "today":
      return { startDate: startOfDay(now).getTime() };
    case "week":
      return { startDate: subDays(startOfDay(now), 6).getTime() };
    case "month":
      return { startDate: subMonths(now, 1).getTime() };
    case "all":
      return {};
  }
}
