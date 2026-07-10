export interface ReportingFolder {
  _id: string;
  parentFolderId?: string;
  defaultLabelIds: string[];
}

export interface ReportingEntry {
  folderId?: string;
  manualLabelIds: string[];
  durationSeconds?: number;
  segments: Array<{ startTime: number; endTime?: number }>;
}

export function entryDurationSeconds(
  entry: ReportingEntry,
  now = Date.now(),
): number {
  if (entry.durationSeconds !== undefined) return entry.durationSeconds;

  const milliseconds = entry.segments.reduce(
    (total, segment) =>
      total + Math.max(0, (segment.endTime ?? now) - segment.startTime),
    0,
  );
  return Math.floor(milliseconds / 1_000);
}

export function effectiveLabelIds(
  entry: ReportingEntry,
  foldersById: Map<string, ReportingFolder>,
): Set<string> {
  const labelIds = new Set(entry.manualLabelIds);
  let folder = entry.folderId ? foldersById.get(entry.folderId) : undefined;
  const visited = new Set<string>();

  while (folder && !visited.has(folder._id)) {
    visited.add(folder._id);
    for (const labelId of folder.defaultLabelIds) labelIds.add(labelId);
    folder = folder.parentFolderId
      ? foldersById.get(folder.parentFolderId)
      : undefined;
  }

  return labelIds;
}

export function totalTrackedSeconds(
  entries: ReportingEntry[],
  now = Date.now(),
): number {
  return entries.reduce(
    (total, entry) => total + entryDurationSeconds(entry, now),
    0,
  );
}

