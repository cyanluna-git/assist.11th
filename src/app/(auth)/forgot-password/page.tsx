"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "비밀번호 재설정 메일 전송에 실패했습니다.");
        return;
      }

      setMessage(data.message || "재설정 링크를 보냈습니다.");
    } catch {
      setError("서버에 연결할 수 없습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <p className="font-display text-lg font-semibold tracking-tight text-text-strong">
          aSSiST <span className="text-xs text-text-muted">11기</span>
        </p>
        <CardTitle className="text-xl">비밀번호 재설정</CardTitle>
        <CardDescription>가입한 이메일로 재설정 링크를 보내드립니다.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {message && (
            <p className="rounded-lg bg-brand/10 px-3 py-2 text-sm text-brand-dark">
              {message}
            </p>
          )}
          {error && (
            <p className="rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
              {error}
            </p>
          )}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="reset-email" className="text-sm font-medium text-text-main">
              이메일
            </label>
            <Input
              id="reset-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
            />
          </div>
          <Button type="submit" className="mt-2 w-full" disabled={loading}>
            {loading ? "전송 중..." : "재설정 링크 보내기"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-text-muted">
          <Link href="/login" className="text-brand hover:underline">
            로그인으로 돌아가기
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
