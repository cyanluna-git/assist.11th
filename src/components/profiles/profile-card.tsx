"use client";

import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import type { Profile } from "@/types/profile";

export function ProfileCard({ profile }: { profile: Profile }) {
  return (
    <Link
      href={`/profiles/${profile.id}`}
      className="group flex flex-col items-center gap-3 rounded-xl bg-card p-5 ring-1 ring-foreground/10 transition-shadow hover:shadow-card"
    >
      <Avatar src={profile.avatarUrl} name={profile.name} size="lg" />
      <div className="text-center">
        <p className="text-sm font-medium text-text-strong">{profile.name}</p>
        {profile.company && (
          <p className="mt-0.5 text-xs text-text-muted">{profile.company}</p>
        )}
        {profile.industry && (
          <p className="mt-0.5 text-xs text-text-subtle">{profile.industry}</p>
        )}
      </div>
    </Link>
  );
}
