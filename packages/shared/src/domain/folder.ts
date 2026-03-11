import type { FolderId, LabelId, UserId } from "./common";

export interface FolderRecord {
  userId: UserId;
  name: string;
  color?: string;
  parentFolderId?: FolderId;
  defaultLabelIds: LabelId[];
  archived: boolean;
  sortOrder: number;
  createdAt: number;
  updatedAt: number;
}
