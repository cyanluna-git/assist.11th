import assert from "node:assert/strict";
import test from "node:test";
import {
  formatPollDeadlineLabel,
  getPollStatusLabel,
  isPollClosed,
} from "@/lib/poll-deadline";
import {
  buildPollShareOptionSummary,
  getPollOgImageUrl,
  getPollSharePath,
  getPollShareUrl,
} from "@/lib/poll-share";

test("buildPollShareOptionSummary picks the top-voted options first", () => {
  const summary = buildPollShareOptionSummary(
    [
      { id: "1", text: "참석", voteCount: 6, percentage: 60 },
      { id: "2", text: "미참", voteCount: 1, percentage: 10 },
      { id: "3", text: "온라인", voteCount: 3, percentage: 30 },
      { id: "4", text: "보류", voteCount: 0, percentage: 0 },
    ],
    3,
  );

  assert.deepEqual(summary, ["참석", "온라인", "미참"]);
});

test("poll share helpers build stable public URLs", () => {
  assert.equal(getPollSharePath("poll-1"), "/share/polls/poll-1");
  assert.match(getPollShareUrl("poll-1"), /\/share\/polls\/poll-1$/);
  assert.match(getPollOgImageUrl("poll-1"), /\/share\/polls\/poll-1\/opengraph-image$/);
});

test("poll share status and deadline formatting remain human-readable", () => {
  assert.equal(getPollStatusLabel("2999-03-20T08:07:00.000Z"), "진행중");
  assert.equal(getPollStatusLabel("2000-03-20T08:07:00.000Z"), "마감");
  assert.match(formatPollDeadlineLabel("2026-03-20T08:07:00.000Z"), /2026/);
  assert.equal(formatPollDeadlineLabel(null), "마감 없음");
});

test("future poll deadlines do not render as already closed", () => {
  const now = new Date("2026-03-16T00:00:00.000Z");
  const formatted = formatPollDeadlineLabel("2026-03-20T08:07:00.000Z");

  assert.equal(isPollClosed("2026-03-20T08:07:00.000Z", now), false);
  assert.equal(getPollStatusLabel("2026-03-20T08:07:00.000Z", now), "진행중");
  assert.match(formatted, /2026/);
  assert.match(formatted, /5:07|17:07/);
});
