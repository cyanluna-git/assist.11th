import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { OnboardingForm } from "@/components/onboarding/onboarding-form";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const profile = await db
    .select({
      id: users.id,
      name: users.name,
      phone: users.phone,
      company: users.company,
      position: users.position,
      industry: users.industry,
      interests: users.interests,
      bio: users.bio,
      github: users.github,
      portfolio: users.portfolio,
      linkedin: users.linkedin,
    })
    .from(users)
    .where(eq(users.id, session.sub))
    .then((rows) => rows[0] ?? null);

  if (!profile) {
    redirect("/login");
  }

  if (profile.company && profile.position && profile.bio) {
    redirect("/");
  }

  return (
    <OnboardingForm
      userId={profile.id}
      userName={profile.name}
      defaultValues={{
        phone: profile.phone ?? "",
        company: profile.company ?? "",
        position: profile.position ?? "",
        industry: profile.industry ?? "",
        interests: profile.interests ?? "",
        bio: profile.bio ?? "",
        github: profile.github ?? "",
        portfolio: profile.portfolio ?? "",
        linkedin: profile.linkedin ?? "",
      }}
    />
  );
}
