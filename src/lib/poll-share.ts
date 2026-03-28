import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { pollOptions, pollVotes, polls } from "@/db/schema";
import { toAbsoluteUrl } from "@/lib/site-url";

export interface PollShareData {
  id: string;
  title: string;
  description: string | null;
  isMultiple: boolean;
  isAnonymous: boolean;
  closesAt: string | null;
  createdAt: string;
  totalVoters: number;
  options: Array<{
    id: string;
    text: string;
    voteCount: number;
    percentage: number;
  }>;
}

export function buildPollShareOptionSummary(
  options: PollShareData["options"],
  limit = 3,
) {
  const topOptions = options
    .slice()
    .sort((a, b) => b.voteCount - a.voteCount || a.text.localeCompare(b.text, "ko-KR"))
    .slice(0, limit);

  return topOptions.map((option) => option.text);
}

export function getPollSharePath(pollId: string) {
  return `/share/polls/${pollId}`;
}

export function getPollShareUrl(pollId: string) {
  return toAbsoluteUrl(getPollSharePath(pollId));
}

export function getPollOgImageUrl(pollId: string) {
  return toAbsoluteUrl(`${getPollSharePath(pollId)}/opengraph-image`);
}

export async function getPollShareData(pollId: string): Promise<PollShareData | null> {
  const poll = await db
    .select({
      id: polls.id,
      title: polls.title,
      description: polls.description,
      isMultiple: polls.isMultiple,
      isAnonymous: polls.isAnonymous,
      closesAt: polls.closesAt,
      createdAt: polls.createdAt,
    })
    .from(polls)
    .where(eq(polls.id, pollId))
    .then((rows) => rows[0] ?? null);

  if (!poll) {
    return null;
  }

  const options = await db
    .select({
      id: pollOptions.id,
      text: pollOptions.text,
      voteCount: sql<number>`COUNT(${pollVotes.id})`,
    })
    .from(pollOptions)
    .leftJoin(pollVotes, eq(pollVotes.pollOptionId, pollOptions.id))
    .where(eq(pollOptions.pollId, pollId))
    .groupBy(pollOptions.id, pollOptions.text);

  const totalVoters = await db
    .select({
      count: sql<number>`COUNT(DISTINCT ${pollVotes.userId})`,
    })
    .from(pollVotes)
    .innerJoin(pollOptions, eq(pollVotes.pollOptionId, pollOptions.id))
    .where(eq(pollOptions.pollId, pollId))
    .then((rows) => Number(rows[0]?.count ?? 0));

  const totalVoteCount = options.reduce((sum, option) => sum + Number(option.voteCount), 0);

  return {
    id: poll.id,
    title: poll.title,
    description: poll.description,
    isMultiple: poll.isMultiple,
    isAnonymous: poll.isAnonymous,
    closesAt: poll.closesAt?.toISOString() ?? null,
    createdAt: poll.createdAt.toISOString(),
    totalVoters,
    options: options.map((option) => ({
      id: option.id,
      text: option.text,
      voteCount: Number(option.voteCount),
      percentage:
        totalVoteCount > 0
          ? Math.round((Number(option.voteCount) / totalVoteCount) * 1000) / 10
          : 0,
    })),
  };
}
