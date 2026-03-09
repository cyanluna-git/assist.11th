import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { QueryProvider } from "@/components/providers/query-provider";

export const dynamic = "force-dynamic";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  return (
    <QueryProvider>
      <div className="flex min-h-dvh items-center justify-center bg-canvas px-4 py-12">
        <div className="w-full max-w-lg">{children}</div>
      </div>
    </QueryProvider>
  );
}
