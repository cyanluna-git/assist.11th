"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const codeFromUrl = searchParams.get("code") || "";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState(codeFromUrl);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "회원가입에 실패했습니다.");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("서버에 연결할 수 없습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {error && (
        <p className="rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
          {error}
        </p>
      )}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="code" className="text-sm font-medium text-text-main">
          초대코드
        </label>
        <Input
          id="code"
          type="text"
          placeholder="초대코드 입력"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-sm font-medium text-text-main">
          이름
        </label>
        <Input
          id="name"
          type="text"
          placeholder="홍길동"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-text-main">
          이메일
        </label>
        <Input
          id="email"
          type="email"
          placeholder="name@example.com"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium text-text-main">
          비밀번호
        </label>
        <Input
          id="password"
          type="password"
          placeholder="6자 이상"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
      </div>
      <Button type="submit" className="mt-2 w-full" disabled={loading}>
        {loading ? "가입 중..." : "가입하기"}
      </Button>
    </form>
  );
}

export default function RegisterPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <p className="font-display text-text-strong text-lg font-semibold tracking-tight">
          aSSiST <span className="text-xs text-text-muted">11기</span>
        </p>
        <CardTitle className="text-xl">회원가입</CardTitle>
        <CardDescription>초대코드와 함께 정보를 입력해주세요</CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense>
          <RegisterForm />
        </Suspense>
        <p className="mt-4 text-center text-sm text-text-muted">
          이미 계정이 있으신가요?{" "}
          <Link href="/login" className="text-brand hover:underline">
            로그인
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
