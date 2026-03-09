import type { Metadata } from "next";
import { PollDetailClient } from "./poll-detail-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "투표 상세 | ASSIST 11기",
  description: "투표 상세 보기",
};

export default function PollDetailPage() {
  return <PollDetailClient />;
}
