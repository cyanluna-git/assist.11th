import assert from "node:assert/strict";
import test from "node:test";
import { calculatePollParticipationPercent } from "@/lib/poll-metrics";

test("calculatePollParticipationPercent uses eligible voters as denominator", () => {
  assert.equal(calculatePollParticipationPercent(6, 20), 30);
  assert.equal(calculatePollParticipationPercent(1, 3), 33.3);
  assert.equal(calculatePollParticipationPercent(0, 20), 0);
  assert.equal(calculatePollParticipationPercent(4, 0), 0);
});
