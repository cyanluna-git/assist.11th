"use client";

import { useState } from "react";
import { Copy, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useInvitations, useCreateInvitation } from "@/hooks/use-admin";

function getStatus(inv: {
  useCount: number;
  maxUses: number;
  expiresAt: string | null;
}) {
  if (inv.useCount >= inv.maxUses) return "used";
  if (inv.expiresAt && new Date(inv.expiresAt) < new Date()) return "expired";
  return "active";
}

export function InvitationsTab() {
  const { data: invitations, isLoading } = useInvitations();
  const createInvitation = useCreateInvitation();
  const [maxUses, setMaxUses] = useState(50);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [lastCreated, setLastCreated] = useState<{
    code: string;
    url: string;
  } | null>(null);

  const handleCreate = () => {
    createInvitation.mutate(
      { role: "member", maxUses, expiresInDays: 30 },
      {
        onSuccess: (data) => {
          setLastCreated({ code: data.code, url: data.url });
        },
      },
    );
  };

  const copyToClipboard = (text: string, code: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create new invitation */}
      <div className="rounded-lg border border-foreground/10 bg-card p-4">
        <h3 className="text-sm font-medium text-text-strong">
          새 초대코드 생성
        </h3>
        <div className="mt-3 flex items-end gap-3">
          <div>
            <label className="text-xs text-text-muted">최대 사용 횟수</label>
            <input
              type="number"
              min={1}
              max={100}
              value={maxUses}
              onChange={(e) => setMaxUses(Number(e.target.value))}
              className="mt-1 block w-24 rounded-md border border-foreground/10 bg-canvas px-3 py-1.5 text-sm text-text-strong"
            />
          </div>
          <Button
            size="sm"
            onClick={handleCreate}
            disabled={createInvitation.isPending}
          >
            <Plus data-icon="inline-start" className="size-3.5" />
            생성
          </Button>
        </div>

        {lastCreated && (
          <div className="mt-4 rounded-lg border border-brand/20 bg-brand/5 p-3">
            <p className="text-xs font-medium text-brand">생성 완료!</p>
            <div className="mt-2 flex items-center gap-2">
              <code className="flex-1 truncate rounded bg-canvas px-2 py-1 text-sm text-text-strong">
                {lastCreated.url}
              </code>
              <Button
                size="xs"
                variant="outline"
                onClick={() =>
                  copyToClipboard(lastCreated.url, lastCreated.code)
                }
              >
                {copiedCode === lastCreated.code ? (
                  <Check className="size-3.5" />
                ) : (
                  <Copy className="size-3.5" />
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Invitation list */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-text-strong">
          초대코드 목록 ({invitations?.length || 0})
        </h3>
        <div className="divide-y divide-foreground/5 rounded-lg border border-foreground/10 bg-card">
          {invitations?.length === 0 && (
            <p className="p-4 text-center text-sm text-text-muted">
              초대코드가 없습니다.
            </p>
          )}
          {invitations?.map((inv) => {
            const status = getStatus(inv);
            return (
              <div
                key={inv.id}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono font-medium text-text-strong">
                      {inv.code}
                    </code>
                    <Badge
                      variant={
                        status === "active"
                          ? "default"
                          : "muted"
                      }
                    >
                      {status === "active"
                        ? "활성"
                        : status === "used"
                          ? "소진"
                          : "만료"}
                    </Badge>
                    <span className="text-xs text-text-muted">
                      {inv.useCount}/{inv.maxUses}명
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-text-muted">
                    {inv.expiresAt
                      ? `만료: ${new Date(inv.expiresAt).toLocaleDateString("ko-KR")}`
                      : "만료 없음"}
                    {inv.email && ` · ${inv.email}`}
                  </p>
                </div>
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => {
                    const baseUrl = window.location.origin;
                    copyToClipboard(
                      `${baseUrl}/register?code=${inv.code}`,
                      inv.code,
                    );
                  }}
                >
                  {copiedCode === inv.code ? (
                    <Check className="size-3.5" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
