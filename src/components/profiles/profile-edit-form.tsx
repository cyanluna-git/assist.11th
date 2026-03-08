"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AvatarUpload } from "./avatar-upload";
import { useUpdateProfile, useUploadAvatar } from "@/hooks/use-profiles";
import type { ProfileDetail, ProfileUpdatePayload } from "@/types/profile";
import { Loader2 } from "lucide-react";

export function ProfileEditForm({
  profile,
  onCancel,
  onSaved,
}: {
  profile: ProfileDetail;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<ProfileUpdatePayload>({
    phone: profile.phone ?? "",
    company: profile.company ?? "",
    position: profile.position ?? "",
    industry: profile.industry ?? "",
    interests: profile.interests ?? "",
    bio: profile.bio ?? "",
    avatarUrl: profile.avatarUrl ?? "",
  });

  const updateProfile = useUpdateProfile(profile.id);
  const uploadAvatar = useUploadAvatar();

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleAvatarUpload(file: File) {
    const url = await uploadAvatar.mutateAsync(file);
    setForm((prev) => ({ ...prev, avatarUrl: url }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await updateProfile.mutateAsync(form);
    onSaved();
  }

  const isSaving = updateProfile.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <AvatarUpload
        src={form.avatarUrl || null}
        name={profile.name}
        isUploading={uploadAvatar.isPending}
        onUpload={handleAvatarUpload}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="phone">전화번호</Label>
          <Input
            id="phone"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="010-0000-0000"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="company">회사</Label>
          <Input
            id="company"
            name="company"
            value={form.company}
            onChange={handleChange}
            placeholder="소속 회사"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="position">직위</Label>
          <Input
            id="position"
            name="position"
            value={form.position}
            onChange={handleChange}
            placeholder="직위/직책"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="industry">업종</Label>
          <Input
            id="industry"
            name="industry"
            value={form.industry}
            onChange={handleChange}
            placeholder="업종"
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="interests">관심분야</Label>
          <Input
            id="interests"
            name="interests"
            value={form.interests}
            onChange={handleChange}
            placeholder="AI, 마케팅, 재무 등"
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="bio">자기소개</Label>
          <Textarea
            id="bio"
            name="bio"
            value={form.bio}
            onChange={handleChange}
            placeholder="간단한 자기소개를 입력하세요"
            rows={4}
          />
        </div>
      </div>

      {updateProfile.isError && (
        <p className="text-sm text-error">저장 중 오류가 발생했습니다. 다시 시도해주세요.</p>
      )}

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={isSaving}
        >
          취소
        </Button>
        <Button type="submit" size="sm" disabled={isSaving}>
          {isSaving && <Loader2 data-icon="inline-start" className="size-3.5 animate-spin" />}
          저장
        </Button>
      </div>
    </form>
  );
}
