import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  formatPollDeadlineLabel,
  getPollStatusLabel,
} from "@/lib/poll-deadline";
import {
  buildPollShareOptionSummary,
  getPollOgImageUrl,
  getPollShareData,
  getPollShareUrl,
} from "@/lib/poll-share";
import { getSiteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const poll = await getPollShareData(id);

  if (!poll) {
    return {
      title: "투표 공유 | aSSiST 11기",
    };
  }

  const title = `${poll.title} | 투표 공유`;
  const description = poll.description ?? "aSSiST 11기 투표 링크";
  const url = getPollShareUrl(poll.id);
  const image = getPollOgImageUrl(poll.id);

  return {
    metadataBase: new URL(getSiteUrl()),
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: "aSSiST 11기",
      type: "article",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: `${poll.title} 투표 미리보기`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function PollSharePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const poll = await getPollShareData(id);

  if (!poll) {
    notFound();
  }

  const topOptions = buildPollShareOptionSummary(poll.options, 3);
  const detailPath = `/polls/${poll.id}`;

  return (
    <main className="min-h-dvh bg-[radial-gradient(circle_at_top_left,_rgba(15,77,129,0.12),_transparent_32%),linear-gradient(180deg,_#f7fafc,_#eef2f7)] px-4 py-10">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="space-y-3">
          <p className="text-sm font-medium text-brand">Poll Share</p>
          <div className="space-y-2">
            <h1 className="font-display text-3xl font-semibold tracking-tight text-text-strong">
              {poll.title}
            </h1>
            <p className="whitespace-pre-wrap text-sm leading-6 text-text-muted">
              {poll.description ?? "설명이 없는 투표입니다."}
            </p>
          </div>
        </div>

        <section className="rounded-[28px] border border-line-subtle bg-surface p-6 shadow-sm">
          <div className="flex flex-wrap gap-2">
            <Badge variant="default">{getPollStatusLabel(poll.closesAt)}</Badge>
            <Badge variant="muted">마감 {formatPollDeadlineLabel(poll.closesAt)}</Badge>
            <Badge variant="muted">투표 {poll.totalVoters}명</Badge>
            {poll.isMultiple && <Badge variant="muted">복수선택</Badge>}
            {poll.isAnonymous && <Badge variant="muted">익명</Badge>}
          </div>

          <div className="mt-5 space-y-3">
            <h2 className="text-sm font-semibold text-text-strong">핵심 선택지</h2>
            <div className="space-y-2">
              {topOptions.map((option, index) => (
                <div
                  key={`${option}-${index}`}
                  className="rounded-2xl border border-line-subtle bg-canvas/60 px-4 py-3 text-sm text-text-main"
                >
                  {option}
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="flex flex-wrap gap-3">
          <Link href={detailPath}>
            <Button>투표 열기</Button>
          </Link>
          <p className="inline-flex items-center rounded-lg px-1 text-sm text-text-muted">
            공유 링크: {getPollShareUrl(poll.id)}
          </p>
        </div>
      </div>
    </main>
  );
}
