import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

export default function Home() {
  return (
    <main className="min-h-screen bg-canvas p-8 md:p-16">
      <div className="mx-auto max-w-3xl space-y-10">
        {/* Hero */}
        <section className="space-y-2">
          <h1 className="font-display text-4xl font-semibold text-brand">
            ASSIST 11기 커뮤니티
          </h1>
          <p className="text-text-muted">
            ASSIST 경영대학원 11기 MBA 동기 커뮤니티 플랫폼
          </p>
        </section>

        {/* Color Palette */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-text-strong">
            Color Palette
          </h2>
          <div className="flex flex-wrap gap-3">
            <div className="flex flex-col items-center gap-1">
              <div className="h-12 w-12 rounded-lg bg-brand" />
              <span className="text-xs text-text-muted">Brand</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="h-12 w-12 rounded-lg bg-brand-soft" />
              <span className="text-xs text-text-muted">Brand Soft</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="h-12 w-12 rounded-lg bg-brand-dark" />
              <span className="text-xs text-text-muted">Brand Dark</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="h-12 w-12 rounded-lg bg-accent-gold" />
              <span className="text-xs text-text-muted">Accent Gold</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="h-12 w-12 rounded-lg bg-success" />
              <span className="text-xs text-text-muted">Success</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="h-12 w-12 rounded-lg bg-warning" />
              <span className="text-xs text-text-muted">Warning</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="h-12 w-12 rounded-lg bg-error" />
              <span className="text-xs text-text-muted">Error</span>
            </div>
          </div>
        </section>

        {/* Buttons */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-text-strong">Buttons</h2>
          <div className="flex flex-wrap gap-3">
            <Button>Primary Button</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
          </div>
        </section>

        {/* Input */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-text-strong">Input</h2>
          <div className="max-w-sm">
            <Input type="email" placeholder="you@assist.ai.mba" />
          </div>
        </section>

        {/* Card */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-text-strong">Card</h2>
          <Card className="max-w-md shadow-soft">
            <CardHeader>
              <CardTitle>MBA Networking Event</CardTitle>
              <CardDescription>
                11기 동기들과 함께하는 네트워킹 이벤트
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-text-main">
                참석 여부를 확인하고 일정을 관리하세요.
              </p>
            </CardContent>
            <CardFooter>
              <Button size="sm">참석하기</Button>
            </CardFooter>
          </Card>
        </section>
      </div>
    </main>
  );
}
