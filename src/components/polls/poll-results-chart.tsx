"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { PollResultOption } from "@/types/poll";

interface PollResultsChartProps {
  options: PollResultOption[];
  totalVoters: number;
  userVotedOptionIds?: string[];
}

const BAR_COLOR = "var(--color-brand)";
const BAR_COLOR_VOTED = "var(--color-brand-dark)";

export function PollResultsChart({
  options,
  totalVoters,
  userVotedOptionIds = [],
}: PollResultsChartProps) {
  const data = options.map((opt) => ({
    name: opt.text,
    votes: opt.voteCount,
    percentage: opt.percentage,
    id: opt.id,
  }));

  if (data.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-text-muted">
        선택지가 없습니다
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {options.map((opt) => {
          const isVoted = userVotedOptionIds.includes(opt.id);
          return (
            <div key={opt.id} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span
                  className={`${
                    isVoted
                      ? "font-medium text-text-strong"
                      : "text-text-default"
                  }`}
                >
                  {opt.text}
                  {isVoted && (
                    <span className="ml-1 text-xs text-brand">(내 투표)</span>
                  )}
                </span>
                <span className="text-xs text-text-muted">
                  {opt.voteCount}표 ({opt.percentage}%)
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isVoted ? "bg-brand-dark" : "bg-brand"
                  }`}
                  style={{ width: `${opt.percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-text-muted">
        총 {totalVoters}명 투표
      </p>

      {/* Recharts horizontal bar chart */}
      <div className="mt-4 h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
          >
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              width={100}
              tick={{ fontSize: 12, fill: "var(--color-text-muted)" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              formatter={(value, _name, props) => {
                const pct = (props.payload as Record<string, unknown>)?.percentage ?? 0;
                return [`${value}표 (${pct}%)`, "투표"];
              }}
              contentStyle={{
                fontSize: 12,
                borderRadius: 8,
                border: "1px solid var(--color-border)",
              }}
            />
            <Bar dataKey="votes" radius={[0, 4, 4, 0]} maxBarSize={24}>
              {data.map((entry) => (
                <Cell
                  key={entry.id}
                  fill={
                    userVotedOptionIds.includes(entry.id)
                      ? BAR_COLOR_VOTED
                      : BAR_COLOR
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
