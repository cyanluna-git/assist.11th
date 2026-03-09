"use client";

import { useState } from "react";
import { BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PollCard } from "@/components/polls/poll-card";
import { CreatePollDialog } from "@/components/polls/create-poll-dialog";
import { usePolls } from "@/hooks/use-polls";

type Tab = "active" | "closed";

const PAGE_SIZE = 20;

export function PollsPageClient() {
  const [tab, setTab] = useState<Tab>("active");
  const [limit, setLimit] = useState(PAGE_SIZE);

  const { data: polls, isLoading, isError } = usePolls(tab, limit);

  const hasMore = (polls?.length ?? 0) >= limit;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text-strong">투표</h1>
          <p className="mt-1 text-sm text-text-muted">
            ASSIST 11기 투표 및 설문
          </p>
        </div>
        <CreatePollDialog />
      </div>

      {/* Tab buttons */}
      <div className="flex gap-1 rounded-lg bg-muted p-1">
        <button
          type="button"
          onClick={() => {
            setTab("active");
            setLimit(PAGE_SIZE);
          }}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            tab === "active"
              ? "bg-card text-text-strong shadow-sm"
              : "text-text-muted hover:text-text-default"
          }`}
        >
          진행중
        </button>
        <button
          type="button"
          onClick={() => {
            setTab("closed");
            setLimit(PAGE_SIZE);
          }}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            tab === "closed"
              ? "bg-card text-text-strong shadow-sm"
              : "text-text-muted hover:text-text-default"
          }`}
        >
          마감됨
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="rounded-lg border border-error/20 bg-error/5 p-4 text-center text-sm text-error">
          투표를 불러오는 중 오류가 발생했습니다.
        </div>
      )}

      {/* Empty */}
      {polls && polls.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-lg bg-muted p-12 text-center">
          <BarChart3 className="size-10 text-text-muted opacity-40" />
          <div>
            <p className="text-sm font-medium text-text-muted">
              {tab === "active"
                ? "진행 중인 투표가 없습니다"
                : "마감된 투표가 없습니다"}
            </p>
            <p className="mt-1 text-xs text-text-muted">
              {tab === "active"
                ? "새로운 투표를 만들어 보세요!"
                : "아직 마감된 투표가 없습니다."}
            </p>
          </div>
        </div>
      )}

      {/* Poll list */}
      {polls && polls.length > 0 && (
        <div className="space-y-6">
          <div className="space-y-3">
            {polls.map((poll) => (
              <PollCard key={poll.id} poll={poll} />
            ))}
          </div>

          {hasMore && (
            <div className="pt-2 text-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLimit((prev) => prev + PAGE_SIZE)}
              >
                더보기
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
