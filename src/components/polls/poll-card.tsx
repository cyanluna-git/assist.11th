"use client";

import Link from "next/link";
import { Users, CheckCircle2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { formatDate } from "@/lib/format-date";
import type { PollSummary } from "@/types/poll";

interface PollCardProps {
  poll: PollSummary;
}

function isPollClosed(closesAt: string | null): boolean {
  if (!closesAt) return false;
  return new Date(closesAt) <= new Date();
}

export function PollCard({ poll }: PollCardProps) {
  const closed = isPollClosed(poll.closesAt);

  return (
    <Link
      href={`/polls/${poll.id}`}
      className="group block rounded-xl bg-card p-4 ring-1 ring-foreground/10 transition-shadow hover:ring-foreground/20"
    >
      <div className="flex items-start gap-3">
        <Avatar
          src={poll.creatorAvatar}
          name={poll.creatorName ?? "?"}
          size="sm"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-medium text-text-strong">
              {poll.title}
            </h3>
            {closed ? (
              <Badge variant="muted" className="shrink-0">
                마감
              </Badge>
            ) : (
              <Badge variant="default" className="shrink-0">
                진행중
              </Badge>
            )}
          </div>
          {poll.description && (
            <p className="mt-0.5 line-clamp-1 text-xs text-text-muted">
              {poll.description}
            </p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted">
            <span className="flex items-center gap-1">
              <Users className="size-3" />
              {poll.totalVotes}명 투표
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="size-3" />
              {poll.optionCount}개 선택지
            </span>
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
          <div className="mt-2 flex items-center gap-2 text-xs text-text-muted">
            <span>{poll.creatorName ?? "알 수 없음"}</span>
            <span>&middot;</span>
            <span>{formatDate(poll.createdAt)}</span>
            {poll.closesAt && !closed && (
              <>
                <span>&middot;</span>
                <span className="flex items-center gap-0.5 text-warning">
                  <Clock className="size-3" />
                  {formatDate(poll.closesAt)} 마감
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
