"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Download,
  Edit3,
  FileUp,
  Headphones,
  ImageIcon,
  Minus,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { StarRating } from "@/components/thesis/star-rating";
import { ReviewList } from "@/components/thesis/review-list";
import { BookmarkButton } from "@/components/bookmarks/bookmark-button";
import { ThesisPdfReader } from "@/components/thesis/thesis-pdf-reader";
import {
  useThesis,
  useDeleteThesis,
  useSaveThesisSummary,
  useUploadThesisArtifact,
  useDeleteThesisArtifact,
} from "@/hooks/use-theses";
import { useCurrentUser } from "@/hooks/use-current-user";
import { formatDate } from "@/lib/format-date";
import { FIELD_MAP, STATUS_MAP, THESIS_ARTIFACT_DEFINITIONS } from "@/types/thesis";
import type { ThesisArtifactType } from "@/types/thesis";
import { cn } from "@/lib/utils";

function getPreviewKind(artifactType: string, fileUrl: string | null): "image" | "pdf" | "audio" | "unsupported" {
  if (!fileUrl) return "unsupported";
  const ext = "." + fileUrl.split(".").pop()?.toLowerCase();
  if ([".png", ".jpg", ".jpeg", ".webp"].includes(ext)) return "image";
  if (ext === ".pdf") return "pdf";
  if ([".mp3", ".m4a", ".wav", ".aac"].includes(ext)) return "audio";
  return "unsupported";
}

// ── Artifact Preview ──
function ArtifactPreview({ fileUrl, artifactType, label }: { fileUrl: string | null; artifactType: string; label: string }) {
  const kind = getPreviewKind(artifactType, fileUrl);
  if (!fileUrl) return <p className="py-4 text-center text-xs text-text-muted">파일 경로 없음</p>;

  switch (kind) {
    case "image":
      return (
        <div className="flex items-center justify-center overflow-hidden rounded-lg bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={fileUrl} alt={label} className="max-h-64 w-full object-contain" />
        </div>
      );
    case "pdf":
      return (
        <iframe
          src={`${fileUrl}#toolbar=0&navpanes=0`}
          className="h-64 w-full rounded-lg border border-line-subtle"
          title={`${label} preview`}
        />
      );
    case "audio":
      return (
        <div className="flex flex-col items-center gap-2 rounded-lg bg-muted p-4">
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <Headphones size={14} />
            <span>{label} 재생</span>
          </div>
          <audio controls className="w-full">
            <source src={fileUrl} />
          </audio>
        </div>
      );
    default:
      return (
        <div className="rounded-lg bg-muted p-4 text-center">
          <p className="text-xs text-text-muted">브라우저 미리보기 미지원</p>
          <div className="mt-2 flex justify-center gap-2">
            <a href={fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-brand hover:underline">
              <Download size={11} /> 열기
            </a>
          </div>
        </div>
      );
  }
}

// ── Main Component ──
export function ThesisDetailClient() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: thesis, isLoading, isError } = useThesis(id);
  const { data: currentUser } = useCurrentUser();
  const deleteThesisMutation = useDeleteThesis();
  const saveSummaryMutation = useSaveThesisSummary(id);
  const uploadArtifactMutation = useUploadThesisArtifact(id);
  const deleteArtifactMutation = useDeleteThesisArtifact(id);

  // Summary state
  const [summaryDraft, setSummaryDraft] = useState("");
  const [persistedSummary, setPersistedSummary] = useState("");
  const [isSummaryEditing, setIsSummaryEditing] = useState(false);
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(true);

  // Artifacts state
  const [selectedArtifactType, setSelectedArtifactType] = useState<ThesisArtifactType>("SUMMARY");
  const [expandedArtifacts, setExpandedArtifacts] = useState<Record<string, boolean>>({});
  const [artifactError, setArtifactError] = useState<string | null>(null);
  const [artifactFileName, setArtifactFileName] = useState("");

  const isAuthor = !!currentUser && thesis?.authorId === currentUser.id;
  const isAdmin = currentUser?.role === "admin";
  const canManage = isAuthor || isAdmin;

  // Sync summary from thesis data
  useEffect(() => {
    if (thesis) {
      setSummaryDraft(thesis.summary ?? "");
      setPersistedSummary(thesis.summary ?? "");
      setIsSummaryEditing(!thesis.summary);
      // Expand existing artifacts
      const expanded: Record<string, boolean> = {};
      for (const a of thesis.artifacts ?? []) expanded[a.artifactType] = true;
      setExpandedArtifacts(expanded);
    }
  }, [thesis?.id]); // only on id change

  const handleSaveSummary = useCallback(async () => {
    try {
      await saveSummaryMutation.mutateAsync(summaryDraft);
      setPersistedSummary(summaryDraft);
      setIsSummaryEditing(false);
    } catch {
      // error handled by mutation state
    }
  }, [saveSummaryMutation, summaryDraft]);

  const handleDelete = () => {
    if (!confirm("논문을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) return;
    deleteThesisMutation.mutate(id, { onSuccess: () => router.push("/thesis") });
  };

  // ── Loading / Error ──
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-[70vh] w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !thesis) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => router.push("/thesis")}>
          <ArrowLeft data-icon="inline-start" className="size-3.5" /> 목록으로
        </Button>
        <div className="rounded-lg border border-error/20 bg-error/5 p-4 text-center text-sm text-error">
          논문을 불러오는 중 오류가 발생했습니다.
        </div>
      </div>
    );
  }

  const field = thesis.field ? FIELD_MAP[thesis.field] : null;
  const status = STATUS_MAP[thesis.status];
  const selectedDef = THESIS_ARTIFACT_DEFINITIONS.find((d) => d.type === selectedArtifactType);

  return (
    <div className="-mx-4 -mt-4.5 flex flex-col sm:-mx-6 sm:-mt-7 lg:-mx-10 lg:-mt-8.5">
      {/* ── Header bar ── */}
      <div className="flex items-center justify-between gap-3 border-b border-line-subtle bg-canvas px-4 py-3 sm:px-6 lg:px-10">
        <div className="flex min-w-0 items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push("/thesis")} className="-ml-2 shrink-0">
            <ArrowLeft className="size-3.5" />
          </Button>
          <div className="flex min-w-0 items-center gap-2">
            <h1 className="truncate text-sm font-semibold text-text-strong">{thesis.title}</h1>
            {field && (
              <Badge variant="muted" className={cn("hidden shrink-0 text-[10px] sm:inline-flex", field.color, field.bg)}>
                {field.label}
              </Badge>
            )}
            {status && (
              <Badge variant="muted" className={cn("hidden shrink-0 text-[10px] sm:inline-flex", status.color, status.bg)}>
                {status.label}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <div className="flex items-center gap-1 text-xs text-text-muted">
            <Avatar src={thesis.author.image} name={thesis.author.name} size="sm" className="!size-5" />
            <span className="hidden sm:inline">{thesis.author.name}</span>
            <span className="hidden sm:inline">&middot;</span>
            <span className="hidden sm:inline">{formatDate(thesis.createdAt)}</span>
          </div>
          <BookmarkButton targetType="thesis" targetId={id} />
          {canManage && (
            <>
              <Link href={`/thesis/${thesis.id}/edit`}>
                <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
                  <Pencil className="size-3" />
                </Button>
              </Link>
              <Button variant="destructive" size="sm" className="h-7 px-2 text-xs" onClick={handleDelete} disabled={deleteThesisMutation.isPending}>
                <Trash2 className="size-3" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* ── Split layout ── */}
      <div className="flex h-[calc(100svh-9rem)] min-h-[500px] flex-col overflow-hidden md:flex-row">
        {/* Left: PDF viewer */}
        <div className="min-h-0 flex-1 overflow-hidden border-b border-line-subtle md:border-b-0 md:border-r" style={{ minHeight: "40vh" }}>
          {thesis.fileUrl ? (
            <ThesisPdfReader src={thesis.fileUrl} title={thesis.title} storageKey={thesis.id} />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 bg-[#eef1f5] p-8 text-center">
              <FileUp size={32} className="text-text-muted opacity-30" />
              <p className="text-sm text-text-muted">PDF 파일이 없습니다.</p>
              {canManage && (
                <Link href={`/thesis/${thesis.id}/edit`}>
                  <Button variant="outline" size="sm">파일 업로드</Button>
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Right: Summary + Artifacts + Reviews */}
        <div className="flex w-full flex-col overflow-y-auto md:w-[360px] lg:w-[400px] xl:w-[440px]">
          {/* Abstract */}
          {thesis.abstract && (
            <div className="border-b border-line-subtle px-4 py-3">
              <p className="text-xs font-medium text-text-muted">초록</p>
              <p className="mt-1 text-xs leading-relaxed text-text-strong">{thesis.abstract}</p>
            </div>
          )}

          {/* ── Summary section ── */}
          <section className="border-b border-line-subtle">
            <div className="flex items-center gap-2 px-4 py-3">
              <Sparkles size={13} className="text-brand" />
              <span className="text-xs font-semibold text-text-strong">요약</span>
              <div className="ml-auto flex items-center gap-1">
                {saveSummaryMutation.isPending && <span className="text-[10px] text-text-muted">저장 중...</span>}
                {saveSummaryMutation.isSuccess && !isSummaryEditing && <span className="text-[10px] text-brand">저장됨</span>}
                <button
                  type="button"
                  onClick={() => setIsSummaryEditing((v) => !v)}
                  className="flex items-center gap-1 rounded border border-line-subtle px-2 py-0.5 text-[10px] text-text-muted hover:bg-muted"
                >
                  <Edit3 size={10} />
                  {isSummaryEditing ? "취소" : persistedSummary ? "편집" : "작성"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsSummaryExpanded((v) => !v)}
                  className="flex items-center gap-1 rounded border border-line-subtle px-2 py-0.5 text-[10px] text-text-muted hover:bg-muted"
                >
                  {isSummaryExpanded ? <Minus size={10} /> : <Plus size={10} />}
                  {isSummaryExpanded ? "접기" : "펼치기"}
                </button>
              </div>
            </div>

            {isSummaryExpanded && (
              <div className="px-4 pb-3">
                {isSummaryEditing ? (
                  <>
                    <p className="mb-2 text-[10px] text-text-muted">
                      NotebookLM 등에서 만든 요약을 붙여넣고 저장하세요.
                    </p>
                    <textarea
                      value={summaryDraft}
                      onChange={(e) => setSummaryDraft(e.target.value)}
                      placeholder="논문 요약을 입력하세요..."
                      className="w-full rounded-lg border border-line-subtle bg-muted/40 px-3 py-2 text-xs leading-relaxed text-text-strong outline-none focus:ring-1 focus:ring-brand"
                      rows={8}
                    />
                    <div className="mt-2 flex justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => { setSummaryDraft(persistedSummary); setIsSummaryEditing(false); }}
                        className="rounded border border-line-subtle px-3 py-1 text-xs text-text-muted hover:bg-muted"
                      >
                        취소
                      </button>
                      <button
                        type="button"
                        disabled={saveSummaryMutation.isPending || !summaryDraft.trim()}
                        onClick={handleSaveSummary}
                        className="rounded bg-brand px-3 py-1 text-xs text-white hover:bg-brand/90 disabled:opacity-50"
                      >
                        {saveSummaryMutation.isPending ? "저장 중..." : "요약 저장"}
                      </button>
                    </div>
                  </>
                ) : persistedSummary ? (
                  <div className="prose prose-xs max-w-none text-text-strong">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{persistedSummary}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-xs text-text-muted">아직 저장된 요약이 없습니다. 위 입력창에 붙여넣고 저장하세요.</p>
                )}
              </div>
            )}
          </section>

          {/* ── Artifacts section ── */}
          <section className="border-b border-line-subtle">
            <div className="flex items-center gap-2 px-4 py-3">
              <FileUp size={13} className="text-text-muted" />
              <span className="text-xs font-semibold text-text-strong">관련 자료</span>
              <span className="ml-auto text-[10px] text-text-muted">슬라이드 · 인포그래픽 · 오디오</span>
            </div>

            <div className="px-4 pb-3 space-y-2">
              {/* Existing artifacts */}
              {(thesis.artifacts ?? []).map((artifact) => {
                const def = THESIS_ARTIFACT_DEFINITIONS.find((d) => d.type === artifact.artifactType);
                if (!def) return null;
                const isExpanded = expandedArtifacts[artifact.artifactType];
                return (
                  <div key={artifact.id} className="rounded-lg border border-line-subtle">
                    <button
                      type="button"
                      className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-muted/50"
                      onClick={() => setExpandedArtifacts((v) => ({ ...v, [artifact.artifactType]: !v[artifact.artifactType] }))}
                    >
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-brand/10 px-1.5 py-0.5 text-[10px] font-medium text-brand">{def.label}</span>
                        <span className="text-[10px] text-text-muted">{formatDate(artifact.updatedAt)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {artifact.fileUrl && (
                          <a href={artifact.fileUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="rounded p-1 text-text-muted hover:bg-muted">
                            <Download size={11} />
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); if (confirm(`${def.label}을(를) 삭제할까요?`)) deleteArtifactMutation.mutate(artifact.id); }}
                          className="rounded p-1 text-text-muted hover:bg-error/10 hover:text-error"
                        >
                          <Trash2 size={11} />
                        </button>
                        {isExpanded ? <ChevronUp size={11} className="text-text-muted" /> : <ChevronDown size={11} className="text-text-muted" />}
                      </div>
                    </button>
                    {isExpanded && artifact.fileUrl && (
                      <div className="border-t border-line-subtle p-3">
                        <ArtifactPreview fileUrl={artifact.fileUrl} artifactType={artifact.artifactType} label={def.label} />
                      </div>
                    )}
                  </div>
                );
              })}

              {(thesis.artifacts ?? []).length === 0 && (
                <p className="text-xs text-text-muted">아직 등록된 관련 자료가 없습니다.</p>
              )}

              {/* Upload form */}
              <div className="mt-3 rounded-lg border border-dashed border-line-subtle p-3">
                <p className="mb-2 text-[10px] font-medium text-text-muted">자료 추가</p>
                <div className="flex flex-col gap-2">
                  <select
                    value={selectedArtifactType}
                    onChange={(e) => { setSelectedArtifactType(e.target.value as ThesisArtifactType); setArtifactError(null); }}
                    className="w-full rounded border border-line-subtle bg-canvas px-2 py-1.5 text-xs text-text-strong"
                  >
                    {THESIS_ARTIFACT_DEFINITIONS.map((d) => (
                      <option key={d.type} value={d.type}>{d.label}</option>
                    ))}
                  </select>
                  {selectedDef && (
                    <p className="text-[10px] text-text-muted">허용 형식: {selectedDef.extensions.join(", ")}</p>
                  )}
                  <label className="flex cursor-pointer items-center gap-2 rounded border border-line-subtle bg-muted/40 px-3 py-2 text-xs text-text-muted hover:bg-muted">
                    <FileUp size={12} />
                    <span>{artifactFileName || "파일 선택..."}</span>
                    <input
                      type="file"
                      accept={selectedDef?.accept}
                      className="hidden"
                      onChange={(e) => {
                        const file = e.currentTarget.files?.[0];
                        setArtifactFileName(file?.name ?? "");
                        setArtifactError(null);
                        if (file) {
                          const ext = "." + file.name.split(".").pop()?.toLowerCase();
                          if (selectedDef && !selectedDef.extensions.includes(ext)) {
                            setArtifactError(`${selectedDef.label}은(는) ${selectedDef.extensions.join(", ")} 형식만 지원합니다.`);
                          }
                        }
                      }}
                      ref={(el) => { if (!el) return; (el as HTMLInputElement & { _ref?: boolean })._ref = true; }}
                      id="artifact-file-input"
                    />
                  </label>
                  {artifactError && <p className="text-[10px] text-error">{artifactError}</p>}
                  <button
                    type="button"
                    disabled={uploadArtifactMutation.isPending || !artifactFileName || !!artifactError}
                    onClick={async () => {
                      const input = document.getElementById("artifact-file-input") as HTMLInputElement;
                      const file = input?.files?.[0];
                      if (!file) return;
                      try {
                        await uploadArtifactMutation.mutateAsync({ file, artifactType: selectedArtifactType });
                        setArtifactFileName("");
                        if (input) input.value = "";
                      } catch (err) {
                        setArtifactError(err instanceof Error ? err.message : "업로드 실패");
                      }
                    }}
                    className="flex items-center justify-center gap-1.5 rounded bg-brand px-3 py-1.5 text-xs text-white hover:bg-brand/90 disabled:opacity-50"
                  >
                    <FileUp size={11} />
                    {uploadArtifactMutation.isPending ? "업로드 중..." : "자료 업로드"}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* ── Reviews ── */}
          <section className="px-4 py-4">
            <div className="mb-3 flex items-center gap-2">
              <StarRating value={Math.round(thesis.avgRating)} readonly size="sm" />
              <span className="text-xs text-text-muted">({thesis.reviewCount}개 리뷰)</span>
            </div>
            <ReviewList thesisId={thesis.id} currentUserId={currentUser?.id} />
          </section>
        </div>
      </div>
    </div>
  );
}
