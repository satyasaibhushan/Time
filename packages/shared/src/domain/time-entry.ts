import type {
  FolderId,
  LabelId,
  TimeEntryStatus,
  TimeSegment,
  UserId,
} from "./common";

export interface TimeEntryRecord {
  userId: UserId;
  folderId?: FolderId;
  title: string;
  notes?: string;
  manualLabelIds: LabelId[];
  status: TimeEntryStatus;
  segments: TimeSegment[];
  startedAt: number;
  endedAt?: number;
  durationSeconds?: number;
  createdAt: number;
  updatedAt: number;
}
