"use client";

import type { PollResultOption } from "@/types/poll";

interface PollVoterListProps {
  options: PollResultOption[];
}

export function PollVoterList({ options }: PollVoterListProps) {
  const hasVoters = options.some((opt) => opt.voters && opt.voters.length > 0);

  if (!hasVoters) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-text-strong">투표 현황</h4>
      <div className="space-y-2">
        {options.map((opt) => (
          <div key={opt.id} className="rounded-lg bg-muted/50 p-3">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-sm font-medium text-text-strong">
                {opt.text}
              </span>
              <span className="text-xs text-text-muted">
                {opt.voteCount}표
              </span>
            </div>
            {opt.voters && opt.voters.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {opt.voters.map((voter) => (
                  <span
                    key={voter.id}
                    className="inline-block rounded-md bg-card px-2 py-0.5 text-xs text-text-default ring-1 ring-foreground/10"
                  >
                    {voter.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-text-muted">아직 투표 없음</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
