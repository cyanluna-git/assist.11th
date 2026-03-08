"use client";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Building2, Briefcase, Tag, Heart, Pencil } from "lucide-react";
import type { ProfileDetail } from "@/types/profile";

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | null;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-text-muted" />
      <div>
        <p className="text-xs text-text-subtle">{label}</p>
        <p className="text-sm text-text-main">{value}</p>
      </div>
    </div>
  );
}

export function ProfileDetailView({
  profile,
  isOwner,
  onEdit,
}: {
  profile: ProfileDetail;
  isOwner: boolean;
  onEdit: () => void;
}) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <Avatar src={profile.avatarUrl} name={profile.name} size="lg" />
        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-col items-center gap-2 sm:flex-row">
            <h1 className="text-xl font-semibold text-text-strong">
              {profile.name}
            </h1>
            <Badge variant="muted">{profile.role}</Badge>
          </div>
          {profile.position && profile.company && (
            <p className="mt-1 text-sm text-text-muted">
              {profile.company} &middot; {profile.position}
            </p>
          )}
        </div>
        {isOwner && (
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Pencil data-icon="inline-start" className="size-3.5" />
            수정
          </Button>
        )}
      </div>

      {/* Details */}
      <div className="grid gap-4 sm:grid-cols-2">
        <InfoRow icon={Mail} label="이메일" value={profile.email} />
        <InfoRow icon={Phone} label="전화번호" value={profile.phone} />
        <InfoRow icon={Building2} label="회사" value={profile.company} />
        <InfoRow icon={Briefcase} label="직위" value={profile.position} />
        <InfoRow icon={Tag} label="업종" value={profile.industry} />
        <InfoRow icon={Heart} label="관심분야" value={profile.interests} />
      </div>

      {/* Bio */}
      {profile.bio && (
        <div className="space-y-2">
          <h2 className="text-sm font-medium text-text-strong">자기소개</h2>
          <p className="whitespace-pre-wrap rounded-lg bg-muted p-4 text-sm text-text-main">
            {profile.bio}
          </p>
        </div>
      )}
    </div>
  );
}
