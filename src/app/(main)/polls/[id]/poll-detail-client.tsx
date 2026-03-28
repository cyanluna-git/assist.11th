"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Check, Copy, Lock, Pencil, Trash2, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PollVoteForm } from "@/components/polls/poll-vote-form";
import { PollResultsChart } from "@/components/polls/poll-results-chart";
import { PollVoterList } from "@/components/polls/poll-voter-list";
import {
  usePoll,
  usePollResults,
  useClosePoll,
  useDeletePoll,
  useRetractVote,
  useUpdatePoll,
} from "@/hooks/use-polls";
import { useCurrentUser } from "@/hooks/use-current-user";
import { formatDate } from "@/lib/format-date";
import { formatPollDeadlineLabel, isPollClosed } from "@/lib/poll-deadline";
import { getPollSharePath } from "@/lib/poll-share";

function toLocalDatetimeValue(iso: string) {
  const date = new Date(iso);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function PollDetailClient() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [copied, setCopied] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [closesAt, setClosesAt] = useState("");

  const { data: poll, isLoading, isError } = usePoll(id);
  const { data: currentUser } = useCurrentUser();
  const closed = poll ? isPollClosed(poll.closesAt) : false;
  const hasVoted = (poll?.userVotedOptionIds?.length ?? 0) > 0;
  const showResults = hasVoted || closed;
  const canManagePoll = !!(
    poll &&
    currentUser &&
    (poll.creatorId === currentUser.id || currentUser.role === "admin")
  );

  const {
    data: results,
    isLoading: resultsLoading,
  } = usePollResults(id, showResults);

  const closePoll = useClosePoll(id);
  const deletePoll = useDeletePoll();
  const retractVote = useRetractVote(id);
  const updatePoll = useUpdatePoll(id);

  useEffect(() => {
    if (!poll || !editOpen) {
      return;
    }

    setDescription(poll.description ?? "");
    setClosesAt(poll.closesAt ? toLocalDatetimeValue(poll.closesAt) : "");
  }, [poll, editOpen]);

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

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canManagePoll) return;

    updatePoll.mutate(
      {
        description: description.trim() || null,
        closesAt: closesAt ? new Date(closesAt).toISOString() : null,
      },
      {
        onSuccess: () => setEditOpen(false),
      },
    );
  };

  const handleCopyShareLink = async () => {
    const sharePath = getPollSharePath(id);
    const shareUrl =
      typeof window === "undefined"
        ? sharePath
        : new URL(sharePath, window.location.origin).toString();

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        window.prompt("아래 링크를 복사하세요.", shareUrl);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("아래 링크를 복사하세요.", shareUrl);
    }
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
            마감: {formatPollDeadlineLabel(poll.closesAt)}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleCopyShareLink}>
            {copied ? (
              <Check data-icon="inline-start" className="size-3.5" />
            ) : (
              <Copy data-icon="inline-start" className="size-3.5" />
            )}
            {copied ? "링크 복사됨" : "공유 링크 복사"}
          </Button>
          {canManagePoll && (
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
              <DialogTrigger
                render={
                  <Button variant="outline" size="sm">
                    <Pencil data-icon="inline-start" className="size-3.5" />
                    투표 수정
                  </Button>
                }
              />
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>투표 수정</DialogTitle>
                  <DialogDescription>
                    본문과 마감일을 수정할 수 있습니다.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="poll-edit-description">본문</Label>
                    <Textarea
                      id="poll-edit-description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="투표 설명을 입력하세요"
                      rows={4}
                      maxLength={5000}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="poll-edit-deadline">마감일</Label>
                    <Input
                      id="poll-edit-deadline"
                      type="datetime-local"
                      value={closesAt}
                      onChange={(e) => setClosesAt(e.target.value)}
                    />
                  </div>
                  {updatePoll.isError && (
                    <p className="text-xs text-error">{updatePoll.error.message}</p>
                  )}
                  <DialogFooter>
                    <DialogClose render={<Button variant="ghost" />}>
                      취소
                    </DialogClose>
                    <Button type="submit" disabled={updatePoll.isPending}>
                      {updatePoll.isPending ? "수정 중..." : "수정"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
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
              eligibleVoterCount={results.eligibleVoterCount}
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
            eligibleVoterCount={poll.eligibleVoterCount}
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
        {canManagePoll && !closed && (
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
        {canManagePoll && (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={deletePoll.isPending}
          >
            <Trash2 data-icon="inline-start" className="size-3.5" />
            {deletePoll.isPending ? "삭제 중..." : "삭제"}
          </Button>
        )}
      </div>
    </div>
  );
}
