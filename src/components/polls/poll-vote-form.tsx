"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useVote } from "@/hooks/use-polls";
import type { PollOption } from "@/types/poll";

interface PollVoteFormProps {
  pollId: string;
  options: PollOption[];
  isMultiple: boolean;
}

export function PollVoteForm({
  pollId,
  options,
  isMultiple,
}: PollVoteFormProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const vote = useVote(pollId);

  const toggle = (optionId: string) => {
    if (isMultiple) {
      setSelected((prev) =>
        prev.includes(optionId)
          ? prev.filter((id) => id !== optionId)
          : [...prev, optionId],
      );
    } else {
      setSelected([optionId]);
    }
  };

  const handleSubmit = () => {
    if (selected.length === 0) return;
    vote.mutate(selected);
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-text-muted">
        {isMultiple ? "복수 선택 가능" : "하나만 선택"}
      </p>
      <div className="space-y-2">
        {options.map((option) => {
          const isSelected = selected.includes(option.id);
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => toggle(option.id)}
              className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                isSelected
                  ? "border-brand bg-brand/5 text-text-strong"
                  : "border-border bg-card text-text-default hover:border-foreground/20"
              }`}
            >
              <span
                className={`flex size-5 shrink-0 items-center justify-center ${
                  isMultiple ? "rounded" : "rounded-full"
                } border-2 transition-colors ${
                  isSelected
                    ? "border-brand bg-brand"
                    : "border-foreground/20 bg-transparent"
                }`}
              >
                {isSelected && (
                  <svg
                    className="size-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </span>
              <span className="flex-1">{option.text}</span>
            </button>
          );
        })}
      </div>
      <Button
        onClick={handleSubmit}
        disabled={selected.length === 0 || vote.isPending}
        className="w-full"
      >
        {vote.isPending ? "투표 중..." : "투표하기"}
      </Button>
      {vote.isError && (
        <p className="text-center text-xs text-error">
          {vote.error.message}
        </p>
      )}
    </div>
  );
}
