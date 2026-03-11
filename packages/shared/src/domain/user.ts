import type { AuthProvider, TimeFormat, WeekStart } from "./common";

export interface UserRecord {
  authProvider: AuthProvider;
  authSubject: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
  timezone: string;
  weekStart: WeekStart;
  timeFormat: TimeFormat;
  createdAt: number;
  updatedAt: number;
}
