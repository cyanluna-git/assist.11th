"use client";

import { useState } from "react";
import { FileText, GitCompareArrows, Scale, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* ────────────────────────────────────────────────────
   Section-by-section comparison data
   ──────────────────────────────────────────────────── */

type DiffType = "same" | "modified" | "added" | "removed";

interface ComparisonSection {
  id: string;
  chapter: string;
  article: string;
  draft: string | null;
  revised: string | null;
  diff: DiffType;
  note?: string;
}

const SECTIONS: ComparisonSection[] = [
  /* ── 제1장 총칙 ── */
  {
    id: "art1",
    chapter: "제1장 총칙",
    article: "제1조 (명칭)",
    draft: "본 조직은 'AI전략경영 석사과정 제11기 원우회'(이하 '본 회')라 칭한다.",
    revised: "본 조직은 'AI전략경영 석사과정 제11기 원우회'(이하 '본 회')라 칭한다.",
    diff: "same",
  },
  {
    id: "art2",
    chapter: "제1장 총칙",
    article: "제2조 (목적)",
    draft:
      "본 회는 회원 간의 친목 도모, 학술 정보 공유 및 AI 비즈니스 네트워크 구축을 통해 원우 공동의 발전과 화합을 목적으로 한다.",
    revised:
      "본 회는 회원 간의 친목 도모, 학술 정보 공유 및 AI 비즈니스 네트워크 구축을 통해 원우 공동의 발전과 화합을 목적으로 한다.",
    diff: "same",
  },
  {
    id: "art3",
    chapter: "제1장 총칙",
    article: "제3조 (소재지)",
    draft:
      "본 회의 사무처는 해당 교육기관 내 지정 장소 또는 온라인 공식 커뮤니티(단톡방 등)에 둔다.",
    revised:
      "본 회의 사무처는 해당 교육기관 내 지정 장소 또는 온라인 공식 커뮤니티(단톡방 등)에 둔다.",
    diff: "same",
  },
  /* ── 제2장 회원 ── */
  {
    id: "art4",
    chapter: "제2장 회원 및 권리·의무",
    article: "제4조 (회원 자격)",
    draft:
      "본 회의 회원은 AI전략경영 석사과정 제1기에 재학 중인 원우 전원으로 한다.",
    revised:
      "본 회의 회원은 AI전략경영 석사과정 제1기에 재학 중인 원우 전원으로 한다. 단, 졸업 후에는 동문회원으로 그 자격이 전환된다.",
    diff: "modified",
    note: "졸업 후 동문회원 전환 규정 추가",
  },
  {
    id: "art5",
    chapter: "제2장 회원 및 권리·의무",
    article: "제5조 (권리와 의무)",
    draft: `• 본 회의 운영에 관한 의결권과 선거권을 가진다.
• 본 회가 주최하는 모든 행사에 참여하고 혜택을 받을 권리가 있다.
• 본 규정을 준수하고, 정해진 연회비를 납부할 의무를 가진다.
• 원우회 네트워크를 이용하여 타 회원에게 금전적 손실을 입히는 해위, 공동체 윤리에 어긋나는 행위, 회원 간의 불화를 지속적으로 조장하는 행위 등을 금지한다.`,
    revised: `• 본 회의 운영에 관한 의결권과 선거권을 가진다.
• 본 회가 주최하는 모든 행사에 참여하고 혜택을 받을 권리가 있다.
• 본 규정을 준수하고, 정해진 연회비를 납부할 의무를 가진다.
• 원우회 네트워크를 이용하여 타 회원에게 금전적 손실을 입히는 행위, 공동체 윤리에 어긋나는 행위, 회원 간의 불화를 지속적으로 조장하는 행위 등을 금지한다.
  → 본 항을 위반할 시 임원진 회의를 거쳐 경고, 회원 자격 정지 또는 제명할 수 있다.`,
    diff: "modified",
    note: '"해위" → "행위" 오타 수정, 위반 시 제재 조항 추가',
  },
  /* ── 제3장 조직 ── */
  {
    id: "art6",
    chapter: "제3장 조직 및 임원",
    article: "제6조 (임원의 구성)",
    draft: `• 회장 (1인): 본 회를 대표하며 업무 전반을 총괄하고 모든 회의를 주재한다.
• 부회장 (2인): 회장의 총괄업무를 보좌하며, 회장 유고 시 그 직무를 대행한다.
• 총무 (1인): 본 회의 재무 관리, 회계 기록 및 행정 실무를 담당한다.
• 학술팀장 (1인): AI 관련 최신 트렌드 공유, 정기 학술 세미나 기획, 스터디 그룹 운영 및 학업 자료 아카이빙
• 대외협력팀장 (1인): 대외 경조사 공지 및 원우 비즈니스 홍보와 공식 소통 채널 관리
• 오락팀장 (1인): 정기 회식 및 종강 파티 등 각종 행사의 레크리에이션 기획
• 감사 (1인): 회계 집행의 적정성과 운영 전반 감독, 학기별 1회 이상 결산 보고
→ 각 팀장은 필요시 약간명의 팀원을 구성하여 운영 가능`,
    revised: `• 회장 (1인): 본 회를 대표하며 업무 전반을 총괄하고 모든 회의를 주재한다.
• 부회장 (2인): 회장의 총괄업무를 보좌하며, 회장 유고 시 그 직무를 대행한다.
• 총무 (1인): 본 회의 재무 관리, 회계 기록 및 행정 실무를 담당한다.
• 학술팀장 (2인): AI 관련 최신 트렌드 공유, 정기 학술 세미나 기획, 스터디 그룹 운영 및 학업 자료 아카이빙
• 대외협력팀장 (2인): 대외 경조사 공지 및 원우 비즈니스 홍보와 공식 소통 채널 관리
• 오락팀장 (2인): 정기 회식 및 종강 파티 등 각종 행사의 레크리에이션 기획
• 감사 (2인): 회계 집행의 적정성과 운영 전반 감독, 학기별 1회 이상 결산 보고
→ 각 팀장은 필요시 약간명의 팀원을 구성하여 운영 가능`,
    diff: "modified",
    note: "학술/대외협력/오락/감사 모두 1인→2인 증원 (총 임원 8인→12인)",
  },
  {
    id: "art7",
    chapter: "제3장 조직 및 임원",
    article: "제7조 (임원의 선출 및 임기)",
    draft:
      "임원의 임기는 1년을 원칙으로 하되, 원우들의 동의 하에 연임할 수 있다.",
    revised:
      "임원의 임기는 1년을 원칙으로 하되, 총회 참석 인원의 과반수 찬성 하에 연임할 수 있다.",
    diff: "modified",
    note: '"원우들의 동의" → "총회 참석 인원의 과반수 찬성" 연임 요건 구체화',
  },
  /* ── 제4장 총회 (신설) ── */
  {
    id: "art8-new",
    chapter: "제4장 총회 및 의결",
    article: "제8조 (총회 및 의결 기준)",
    draft: null,
    revised:
      "본 회의 총회는 재적 회원 과반수의 출석으로 개회하고, 출석 회원 과반수의 찬성으로 의결한다. 가부동수일 경우 회장이 결정권을 가진다.",
    diff: "added",
    note: "제4장 전체 신설 — 의결 정족수 규정",
  },
  /* ── 재정 ── */
  {
    id: "art-fee",
    chapter: "재정 및 행사 운영",
    article: "연회비 및 납부 (가안 제8조 → 수정안 제9조)",
    draft: `• 본 회의 연회비는 1인당 연 금 ㅇㅇ만 원(₩000,000)으로 정한다.
• 회원은 학기 초 지정된 기일 내에 일시 납부하는 것을 원칙으로 한다.`,
    revised: `(추가) 본 회의 회계 연도는 매년 3월 1일부터 익년 2월 말일까지로 한다.
• 본 회의 연회비는 1인당 연 금 일십만 원(₩100,000)으로 정한다.
• 회원은 학기 초 지정된 기일 내에 일시 납부하는 것을 원칙으로 한다.
• 지정된 기일 내 연회비 미납 시, 경조사 지원 및 원우회 주최 행사 참여에 제한을 둘 수 있다.`,
    diff: "modified",
    note: "금액 확정(10만원), 회계연도 신설(3/1~2/28), 미납 제재 추가",
  },
  {
    id: "art-event",
    chapter: "재정 및 행사 운영",
    article: "행사 운영 원칙 (가안 제9조 → 수정안 제10조)",
    draft: `• 본 회가 주최하는 정기 회식, 세미나, 종강 파티 등 모든 공식적인 행사의 비용은 원우회비에서 지출하는 것을 원칙으로 한다.
• 공식 행사 외 소수 인원의 번개 모임이나 사적인 모임은 해당 참여자가 자율적으로 비용을 부담한다.`,
    revised: `• 본 회가 주최하는 정기 회식, 세미나, 종강 파티 등 모든 공식적인 행사의 비용은 원우회비에서 지출하는 것을 원칙으로 한다.
• 공식 행사 외 소수 인원의 번개 모임이나 사적인 모임은 해당 참여자가 자율적으로 비용을 부담한다.`,
    diff: "same",
  },
  {
    id: "art-spend",
    chapter: "재정 및 행사 운영",
    article: "지출 용도 (가안 제10조 → 수정안 제11조)",
    draft:
      "회비는 공식 행사비(식사 및 대관), 경조사 지원, 원우 수첩 및 기념품 제작, 학술 자료 구매비 등으로 사용한다.",
    revised:
      "회비는 공식 행사비(식사 및 대관), 경조사 지원, 원우 수첩 및 기념품 제작, 학술 자료 구매비 등으로 사용한다.",
    diff: "same",
  },
  {
    id: "art-acc",
    chapter: "재정 및 행사 운영",
    article: "회계 투명성 (가안 제11조 → 수정안 제12조)",
    draft:
      "총무는 모든 지출 내역을 디지털 장부에 기록하고, 영수증을 첨부하여 분기별 1회 이상 전체 원우에게 투명하게 공개한다.",
    revised:
      "총무는 모든 지출 내역을 디지털 장부에 기록하고, 영수증을 첨부하여 분기별 1회 이상 전체 원우에게 투명하게 공개한다.",
    diff: "same",
  },
  /* ── 경조사 ── */
  {
    id: "art-cere",
    chapter: "경조사 지원 규정",
    article: "경조사 범위 및 기준 (가안 제12조 → 수정안 제13조)",
    draft: `• 회원 본인 및 배우자 부모상: 원우회 명의의 조화 송부 및 조의금 전달
• 회원 본인 및 자녀 결혼: 원우회 명의의 축하 화환 송부
• 기타 특수한 상황은 임원진 협의를 거쳐 결정한다.`,
    revised: `• 회원 본인 및 배우자 부모상: 원우회 명의의 조화 송부 및 조의금 전달
• 회원 본인 및 자녀 결혼: 원우회 명의의 축하 화환 송부
• 기타 특수한 상황은 임원진 협의를 거쳐 결정한다.`,
    diff: "same",
  },
  /* ── 보칙 ── */
  {
    id: "art-eti",
    chapter: "커뮤니티 에티켓 및 보칙",
    article: "상호 존중 및 온라인 예절 (가안 제13조 → 수정안 제14조)",
    draft:
      "세대가 공존하는 조직의 특성상 상호 존중을 원칙으로 하고, 공식 단톡방에서의 비방, 정치적 발언, 과도한 개인 홍보 활동을 금지하며 상호 예의를 준수한다.",
    revised:
      "세대가 공존하는 조직의 특성상 상호 존중을 원칙으로 하고, 공식 단톡방에서의 비방, 정치적 발언, 과도한 개인 홍보 활동을 금지하며 상호 예의를 준수한다.",
    diff: "same",
  },
  {
    id: "art-eff",
    chapter: "커뮤니티 에티켓 및 보칙",
    article: "효력 (가안 제14조 → 수정안 제15조)",
    draft:
      "본 규정은 원우회 총회 통과 즉시 효력을 발생하며, 명시되지 않은 사항은 임원진의 합의와 일반 관례에 따른다.",
    revised:
      "본 규정은 재적 회원 과반수 출석과 출석 회원 과반수 찬성으로 통과 즉시 효력을 발생하며, 명시되지 않은 사항은 임원진의 합의와 일반 관례에 따른다.",
    diff: "modified",
    note: "의결 요건(재적 과반수 출석, 출석 과반수 찬성) 명시",
  },
];

const SUMMARY_ITEMS = [
  {
    label: "총회 의결 기준",
    detail: "재적 과반수 출석, 출석 과반수 찬성",
    type: "added" as DiffType,
  },
  {
    label: "임원 증원",
    detail: "학술·대외·오락·감사 1인 → 2인",
    type: "modified" as DiffType,
  },
  {
    label: "연회비 확정",
    detail: "미정 → ₩100,000 / 미납 시 제재",
    type: "modified" as DiffType,
  },
  {
    label: "동문 전환",
    detail: "졸업 후 동문회원 자격 전환",
    type: "added" as DiffType,
  },
  {
    label: "위반 제재",
    detail: "경고 → 자격정지 → 제명",
    type: "added" as DiffType,
  },
  {
    label: "연임 요건",
    detail: "총회 과반수 찬성 필요",
    type: "modified" as DiffType,
  },
];

/* ────────────────────────────────────────────────────
   UI helpers
   ──────────────────────────────────────────────────── */

type ViewMode = "compare" | "draft" | "revised" | "changes";

const diffColors: Record<DiffType, { bg: string; border: string; badge: string; text: string }> = {
  same: {
    bg: "bg-transparent",
    border: "border-line-subtle",
    badge: "bg-canvas text-text-muted",
    text: "text-text-main",
  },
  modified: {
    bg: "bg-amber-50/60",
    border: "border-amber-200",
    badge: "bg-amber-100 text-amber-800",
    text: "text-amber-900",
  },
  added: {
    bg: "bg-emerald-50/60",
    border: "border-emerald-200",
    badge: "bg-emerald-100 text-emerald-800",
    text: "text-emerald-900",
  },
  removed: {
    bg: "bg-red-50/60",
    border: "border-red-200",
    badge: "bg-red-100 text-red-800",
    text: "text-red-900",
  },
};

const diffLabels: Record<DiffType, string> = {
  same: "동일",
  modified: "변경",
  added: "신설",
  removed: "삭제",
};

function DiffBadge({ type }: { type: DiffType }) {
  if (type === "same") return null;
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-semibold",
        diffColors[type].badge,
      )}
    >
      {diffLabels[type]}
    </span>
  );
}

function ContentBlock({ text, className }: { text: string | null; className?: string }) {
  if (!text) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-dashed border-line-subtle px-4 py-6 text-sm text-text-muted">
        해당 조항 없음
      </div>
    );
  }
  return (
    <div className={cn("whitespace-pre-wrap text-sm leading-7", className)}>
      {text}
    </div>
  );
}

/* ────────────────────────────────────────────────────
   Main component
   ──────────────────────────────────────────────────── */

export function BylawsPageClient() {
  const [view, setView] = useState<ViewMode>("compare");
  const [filter, setFilter] = useState<"all" | "changed">("all");

  const changedCount = SECTIONS.filter((s) => s.diff !== "same").length;
  const visibleSections =
    filter === "changed" ? SECTIONS.filter((s) => s.diff !== "same") : SECTIONS;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Hero */}
      <section className="rounded-[28px] border border-line-subtle bg-[radial-gradient(circle_at_top_left,_rgba(15,77,129,0.18),_transparent_35%),linear-gradient(135deg,_rgba(16,24,40,0.96),_rgba(38,53,75,0.92))] px-6 py-8 text-white sm:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3 py-1 text-xs font-medium text-white/85">
              <Scale className="size-3.5" />
              운영 규정 비교
            </span>
            <div>
              <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                원우회 운영 규정
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-white/72 sm:text-base">
                가안과 수정안을 나란히 비교하여 변경된 조항을 한눈에 확인할 수
                있습니다.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="rounded-2xl border border-white/12 bg-white/8 px-4 py-3 text-center text-sm text-white/78">
              <div className="text-2xl font-bold text-white">{SECTIONS.length}</div>
              <div className="text-xs">전체 조항</div>
            </div>
            <div className="rounded-2xl border border-amber-400/20 bg-amber-400/8 px-4 py-3 text-center text-sm text-amber-200/90">
              <div className="text-2xl font-bold text-amber-300">{changedCount}</div>
              <div className="text-xs">변경 조항</div>
            </div>
          </div>
        </div>
      </section>

      {/* Summary cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SUMMARY_ITEMS.map((item) => (
          <div
            key={item.label}
            className={cn(
              "rounded-2xl border p-4",
              diffColors[item.type].bg,
              diffColors[item.type].border,
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-semibold text-text-strong">{item.label}</p>
              <DiffBadge type={item.type} />
            </div>
            <p className="mt-1 text-sm text-text-muted">{item.detail}</p>
          </div>
        ))}
      </div>

      {/* View controls */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-xl border border-line-subtle bg-canvas p-1">
          {(
            [
              { key: "compare", label: "비교 보기", icon: GitCompareArrows },
              { key: "draft", label: "가안", icon: FileText },
              { key: "revised", label: "수정안", icon: FileText },
            ] as const
          ).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setView(key)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                view === key
                  ? "bg-surface text-brand shadow-sm"
                  : "text-text-muted hover:text-text-main",
              )}
            >
              <Icon className="size-3.5" />
              {label}
            </button>
          ))}
        </div>

        <div className="flex rounded-xl border border-line-subtle bg-canvas p-1">
          <button
            onClick={() => setFilter("all")}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              filter === "all"
                ? "bg-surface text-brand shadow-sm"
                : "text-text-muted hover:text-text-main",
            )}
          >
            전체
          </button>
          <button
            onClick={() => setFilter("changed")}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              filter === "changed"
                ? "bg-surface text-brand shadow-sm"
                : "text-text-muted hover:text-text-main",
            )}
          >
            변경만
          </button>
        </div>
      </div>

      {/* Comparison table */}
      {view === "compare" ? (
        <CompareView sections={visibleSections} />
      ) : (
        <SingleView
          sections={visibleSections}
          side={view === "draft" ? "draft" : "revised"}
        />
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────
   Side-by-side comparison view
   ──────────────────────────────────────────────────── */

function CompareView({ sections }: { sections: ComparisonSection[] }) {
  let lastChapter = "";

  return (
    <div className="space-y-4">
      {sections.map((section) => {
        const showChapter = section.chapter !== lastChapter;
        lastChapter = section.chapter;
        const colors = diffColors[section.diff];

        return (
          <div key={section.id}>
            {showChapter && (
              <div className="mb-3 mt-6 flex items-center gap-2 first:mt-0">
                <ChevronRight className="size-4 text-brand" />
                <h2 className="text-base font-semibold text-text-strong">
                  {section.chapter}
                </h2>
              </div>
            )}
            <div
              className={cn(
                "rounded-2xl border transition-colors",
                colors.bg,
                colors.border,
              )}
            >
              {/* Article header */}
              <div className="flex flex-wrap items-center gap-2 border-b px-5 py-3" style={{ borderColor: "inherit" }}>
                <h3 className="text-sm font-semibold text-text-strong">
                  {section.article}
                </h3>
                <DiffBadge type={section.diff} />
                {section.note && (
                  <span className="text-xs text-text-muted">— {section.note}</span>
                )}
              </div>

              {/* Two-column body */}
              <div className="grid divide-x divide-[inherit] md:grid-cols-2">
                {/* Draft */}
                <div className="px-5 py-4">
                  <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                    가안
                  </div>
                  <ContentBlock
                    text={section.draft}
                    className={section.diff === "modified" ? "text-text-muted" : "text-text-main"}
                  />
                </div>

                {/* Revised */}
                <div className={cn("px-5 py-4", section.diff !== "same" && "bg-white/40")}>
                  <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-brand">
                    수정안
                  </div>
                  <ContentBlock
                    text={section.revised}
                    className={
                      section.diff === "same"
                        ? "text-text-main"
                        : "font-medium text-text-strong"
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ────────────────────────────────────────────────────
   Single-side view
   ──────────────────────────────────────────────────── */

function SingleView({
  sections,
  side,
}: {
  sections: ComparisonSection[];
  side: "draft" | "revised";
}) {
  let lastChapter = "";

  return (
    <Card>
      <CardHeader>
        <CardTitle>{side === "draft" ? "가안 전문" : "수정안 전문"}</CardTitle>
        <p className="text-sm text-text-muted">
          {side === "draft"
            ? "서울과학종합대학원 AI전략경영 석사과정 제11기 원우회 운영 규정 (가안)"
            : "서울과학종합대학원 AI전략경영 석사과정 제11기 원우회 운영 규정 (★수정안)"}
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        {sections.map((section) => {
          const showChapter = section.chapter !== lastChapter;
          lastChapter = section.chapter;
          const text = side === "draft" ? section.draft : section.revised;
          const colors = diffColors[section.diff];

          return (
            <div key={section.id}>
              {showChapter && (
                <h2 className="mb-3 mt-6 border-b border-line-subtle pb-2 text-lg font-semibold text-text-strong first:mt-0">
                  {section.chapter}
                </h2>
              )}
              <div
                className={cn(
                  "rounded-xl border p-4",
                  colors.bg,
                  colors.border,
                )}
              >
                <div className="mb-2 flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-text-strong">
                    {section.article}
                  </h3>
                  <DiffBadge type={section.diff} />
                </div>
                <ContentBlock text={text} className="text-text-main" />
                {section.note && (
                  <p className={cn("mt-3 text-xs", colors.text)}>
                    {section.note}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
