import assert from "node:assert/strict";
import test from "node:test";

import {
  effectiveLabelIds,
  entryDurationSeconds,
  totalTrackedSeconds,
  type ReportingFolder,
} from "./reporting.ts";

test("effective labels include manual and every folder ancestor", () => {
  const folders = new Map<string, ReportingFolder>([
    ["root", { _id: "root", defaultLabelIds: ["client"] }],
    [
      "child",
      {
        _id: "child",
        parentFolderId: "root",
        defaultLabelIds: ["billable"],
      },
    ],
  ]);

  assert.deepEqual(
    [...effectiveLabelIds(
      {
        folderId: "child",
        manualLabelIds: ["focus"],
        segments: [],
      },
      folders,
    )].sort(),
    ["billable", "client", "focus"],
  );
});

test("folder cycles do not loop while resolving inherited labels", () => {
  const folders = new Map<string, ReportingFolder>([
    [
      "a",
      { _id: "a", parentFolderId: "b", defaultLabelIds: ["one"] },
    ],
    [
      "b",
      { _id: "b", parentFolderId: "a", defaultLabelIds: ["two"] },
    ],
  ]);

  assert.deepEqual(
    [...effectiveLabelIds(
      { folderId: "a", manualLabelIds: [], segments: [] },
      folders,
    )].sort(),
    ["one", "two"],
  );
});

test("report totals use closed and open timer segments", () => {
  const entries = [
    {
      manualLabelIds: [],
      segments: [{ startTime: 1_000, endTime: 4_000 }],
    },
    {
      manualLabelIds: [],
      segments: [{ startTime: 5_000 }],
    },
  ];

  assert.equal(entryDurationSeconds(entries[0], 10_000), 3);
  assert.equal(totalTrackedSeconds(entries, 10_000), 8);
});

