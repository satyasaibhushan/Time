import type { GenericId } from "convex/values";

export const AUTH_PROVIDERS = ["auth0"] as const;
export type AuthProvider = (typeof AUTH_PROVIDERS)[number];

export const WEEK_START_OPTIONS = ["monday", "sunday"] as const;
export type WeekStart = (typeof WEEK_START_OPTIONS)[number];

export const TIME_FORMAT_OPTIONS = ["12h", "24h"] as const;
export type TimeFormat = (typeof TIME_FORMAT_OPTIONS)[number];

export const TIME_ENTRY_STATUSES = ["running", "paused", "completed"] as const;
export type TimeEntryStatus = (typeof TIME_ENTRY_STATUSES)[number];

export interface TimeSegment {
  startTime: number;
  endTime?: number;
}

export type UserId = GenericId<"users">;
export type FolderId = GenericId<"folders">;
export type LabelId = GenericId<"labels">;
export type TimeEntryId = GenericId<"timeEntries">;
