"use client";

import Link from "next/link";
import { BarChart3, ChevronRight, Users } from "lucide-react";
import { Card, CardHeader, CardTitle, CardAction, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { usePolls } from "@/hooks/use-polls";

export function PollWidget() {
  const { data: polls, isLoading } = usePolls("active", 3);

  return (
    <Card>
      <CardHeader>
        <CardTitle>투표</CardTitle>
        <CardAction>
          <Link
            href="/polls"
            className="flex items-center gap-0.5 text-xs text-text-muted transition-colors hover:text-brand"
          >
            전체보기
            <ChevronRight className="size-3.5" />
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        )}

        {!isLoading && (!polls || polls.length === 0) && (
          <div className="flex flex-col items-center gap-2 py-6 text-text-muted">
            <BarChart3 className="size-8 opacity-40" />
            <p className="text-sm">진행 중인 투표가 없습니다</p>
          </div>
        )}

        {!isLoading && polls && polls.length > 0 && (
          <div className="space-y-2">
            {polls.map((poll) => (
              <Link
                key={poll.id}
                href={`/polls/${poll.id}`}
                className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-muted"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-text-strong">
                    {poll.title}
                  </p>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-text-muted">
                    <span className="flex items-center gap-1">
                      <Users className="size-3" />
                      {poll.totalVotes}명
                    </span>
                    {poll.isMultiple && (
                      <Badge variant="muted" className="text-[10px]">
                        복수
                      </Badge>
                    )}
                  </div>
                </div>
                <ChevronRight className="size-4 shrink-0 text-text-muted" />
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
