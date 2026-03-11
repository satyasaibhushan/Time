import type { UserId } from "./common";

export interface LabelRecord {
  userId: UserId;
  name: string;
  color: string;
  createdAt: number;
  updatedAt: number;
}
