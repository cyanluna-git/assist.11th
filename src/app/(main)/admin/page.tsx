import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AdminClient } from "./admin-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "관리자 | aSSiST 11기",
};

export default async function AdminPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="font-display text-2xl font-semibold text-text-strong">
        관리자
      </h1>
      <AdminClient />
    </div>
  );
}
