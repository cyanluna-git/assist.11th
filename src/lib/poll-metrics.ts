export function calculatePollParticipationPercent(
  count: number,
  eligibleVoterCount: number,
) {
  if (eligibleVoterCount <= 0) {
    return 0;
  }

  return Math.round((count / eligibleVoterCount) * 1000) / 10;
}
