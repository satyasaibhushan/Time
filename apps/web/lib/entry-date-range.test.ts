import assert from "node:assert/strict";
import test from "node:test";

import { getEntryDateRange } from "./entry-date-range.ts";

const now = new Date(2026, 6, 12, 14, 30, 45);

test("today begins at local midnight", () => {
  assert.deepEqual(getEntryDateRange("today", now), {
    startDate: new Date(2026, 6, 12).getTime(),
  });
});

test("week is the same rolling seven-day window as mobile", () => {
  assert.deepEqual(getEntryDateRange("week", now), {
    startDate: new Date(2026, 6, 6).getTime(),
  });
});

test("month begins one calendar month ago", () => {
  assert.deepEqual(getEntryDateRange("month", now), {
    startDate: new Date(2026, 5, 12, 14, 30, 45).getTime(),
  });
});

test("all removes date bounds", () => {
  assert.deepEqual(getEntryDateRange("all", now), {});
});
