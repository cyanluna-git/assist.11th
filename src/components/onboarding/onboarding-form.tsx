"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface OnboardingFormProps {
  userId: string;
  userName: string;
  defaultValues: {
    phone: string;
    company: string;
    position: string;
    industry: string;
    interests: string;
    bio: string;
    github: string;
    portfolio: string;
    linkedin: string;
  };
}

export function OnboardingForm({ userId, userName, defaultValues }: OnboardingFormProps) {
  const router = useRouter();
  const [form, setForm] = useState(defaultValues);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  const canSubmit = form.company.trim() && form.position.trim() && form.bio.trim();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setError("");
    setSaving(true);

    try {
      const res = await fetch(`/api/profiles/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "저장에 실패했습니다.");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("서버에 연결할 수 없습니다.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <p className="font-display text-text-strong text-lg font-semibold tracking-tight">
          aSSiST <span className="text-xs text-text-muted">11기</span>
        </p>
        <CardTitle className="text-xl">프로필 설정</CardTitle>
        <CardDescription>
          {userName}님, 환영합니다! 커뮤니티 활동을 위해 프로필을 완성해주세요.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <p className="rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
              {error}
            </p>
          )}

          {/* Required fields */}
          <div className="space-y-4">
            <p className="text-sm font-medium text-text-main">
              필수 항목 <span className="text-error">*</span>
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="company">
                  회사 <span className="text-error">*</span>
                </Label>
                <Input
                  id="company"
                  name="company"
                  value={form.company}
                  onChange={handleChange}
                  placeholder="소속 회사"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="position">
                  직위 <span className="text-error">*</span>
                </Label>
                <Input
                  id="position"
                  name="position"
                  value={form.position}
                  onChange={handleChange}
                  placeholder="직위/직책"
                  required
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bio">
                자기소개 <span className="text-error">*</span>
              </Label>
              <Textarea
                id="bio"
                name="bio"
                value={form.bio}
                onChange={handleChange}
                placeholder="간단한 자기소개를 입력하세요"
                rows={3}
                required
              />
            </div>
          </div>

          {/* Optional fields */}
          <div className="space-y-4">
            <p className="text-sm font-medium text-text-muted">선택 항목</p>
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
              <div className="space-y-1.5">
                <Label htmlFor="github">GitHub</Label>
                <Input
                  id="github"
                  name="github"
                  value={form.github}
                  onChange={handleChange}
                  placeholder="https://github.com/username"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  name="linkedin"
                  value={form.linkedin}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="portfolio">포트폴리오</Label>
                <Input
                  id="portfolio"
                  name="portfolio"
                  value={form.portfolio}
                  onChange={handleChange}
                  placeholder="https://yoursite.com"
                />
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={saving || !canSubmit}>
            {saving && <Loader2 data-icon="inline-start" className="size-3.5 animate-spin" />}
            {saving ? "저장 중..." : "프로필 완성하기"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
