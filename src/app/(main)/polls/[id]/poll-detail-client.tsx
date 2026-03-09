"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Trash2, Lock, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { PollVoteForm } from "@/components/polls/poll-vote-form";
import { PollResultsChart } from "@/components/polls/poll-results-chart";
import { PollVoterList } from "@/components/polls/poll-voter-list";
import {
  usePoll,
  usePollResults,
  useClosePoll,
  useDeletePoll,
  useRetractVote,
} from "@/hooks/use-polls";
import { formatDate } from "@/lib/format-date";

function isPollClosed(closesAt: string | null): boolean {
  if (!closesAt) return false;
  return new Date(closesAt) <= new Date();
}

export function PollDetailClient() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: poll, isLoading, isError } = usePoll(id);
  const closed = poll ? isPollClosed(poll.closesAt) : false;
  const hasVoted = (poll?.userVotedOptionIds?.length ?? 0) > 0;
  const showResults = hasVoted || closed;

  const {
    data: results,
    isLoading: resultsLoading,
  } = usePollResults(id, showResults);

  const closePoll = useClosePoll(id);
  const deletePoll = useDeletePoll();
  const retractVote = useRetractVote(id);

  const handleClose = () => {
    if (!confirm("투표를 마감하시겠습니까?")) return;
    closePoll.mutate();
  };

  const handleDelete = () => {
    if (!confirm("투표를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) return;
    deletePoll.mutate(id, {
      onSuccess: () => router.push("/polls"),
    });
  };

  const handleRetract = () => {
    if (!confirm("투표를 취소하시겠습니까?")) return;
    retractVote.mutate();
  };

  // Loading
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  // Error
  if (isError || !poll) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => router.push("/polls")}>
          <ArrowLeft data-icon="inline-start" className="size-3.5" />
          목록으로
        </Button>
        <div className="rounded-lg border border-error/20 bg-error/5 p-4 text-center text-sm text-error">
          투표를 불러오는 중 오류가 발생했습니다.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back */}
      <Button variant="ghost" size="sm" onClick={() => router.push("/polls")}>
        <ArrowLeft data-icon="inline-start" className="size-3.5" />
        목록으로
      </Button>

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-text-strong">
                {poll.title}
              </h1>
              {closed ? (
                <Badge variant="muted">마감</Badge>
              ) : (
                <Badge variant="default">진행중</Badge>
              )}
            </div>
            {poll.description && (
              <p className="mt-1 text-sm text-text-muted">
                {poll.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-text-muted">
          <Avatar
            src={poll.creatorAvatar}
            name={poll.creatorName ?? "?"}
            size="sm"
          />
          <span>{poll.creatorName ?? "알 수 없음"}</span>
          <span>&middot;</span>
          <span>{formatDate(poll.createdAt)}</span>
          {poll.isMultiple && (
            <Badge variant="muted" className="text-[10px]">
              복수선택
            </Badge>
          )}
          {poll.isAnonymous && (
            <Badge variant="muted" className="text-[10px]">
              익명
            </Badge>
          )}
        </div>

        {poll.closesAt && !closed && (
          <p className="text-xs text-warning">
            마감: {new Date(poll.closesAt).toLocaleString("ko-KR")}
          </p>
        )}
      </div>

      {/* Content area: vote form or results */}
      <div className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
        {!showResults ? (
          /* State 1: Active, not voted -> show vote form */
          <PollVoteForm
            pollId={poll.id}
            options={poll.options}
            isMultiple={poll.isMultiple}
          />
        ) : resultsLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : results ? (
          /* State 2/3: Voted or closed -> show results */
          <div className="space-y-6">
            <PollResultsChart
              options={results.options}
              totalVoters={results.totalVoters}
              userVotedOptionIds={poll.userVotedOptionIds}
            />
            {/* Voter list for non-anonymous polls */}
            {!poll.isAnonymous && (
              <PollVoterList options={results.options} />
            )}
          </div>
        ) : (
          /* Fallback: show basic results from poll detail */
          <PollResultsChart
            options={poll.options.map((o) => ({
              ...o,
              voters: undefined,
            }))}
            totalVoters={poll.totalVoters}
            userVotedOptionIds={poll.userVotedOptionIds}
          />
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        {/* Retract vote: only if voted and poll is not closed */}
        {hasVoted && !closed && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRetract}
            disabled={retractVote.isPending}
          >
            <Undo2 data-icon="inline-start" className="size-3.5" />
            {retractVote.isPending ? "취소 중..." : "투표 취소"}
          </Button>
        )}

        {/* Close poll: only for creator, active poll */}
        {!closed && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClose}
            disabled={closePoll.isPending}
          >
            <Lock data-icon="inline-start" className="size-3.5" />
            {closePoll.isPending ? "마감 중..." : "투표 마감"}
          </Button>
        )}

        {/* Delete poll */}
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          disabled={deletePoll.isPending}
        >
          <Trash2 data-icon="inline-start" className="size-3.5" />
          {deletePoll.isPending ? "삭제 중..." : "삭제"}
        </Button>
      </div>
    </div>
  );
}
