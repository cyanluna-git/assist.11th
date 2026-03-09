"use client";

import { Avatar } from "@/components/ui/avatar";
import { Building2, Github, Linkedin } from "lucide-react";
import type { Profile } from "@/types/profile";

export function DirectoryCard({
  profile,
  onClick,
}: {
  profile: Profile;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex flex-col items-center overflow-hidden rounded-xl border border-line-subtle bg-surface text-left transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
    >
      {/* Top gradient deco line */}
      <div className="h-1 w-full bg-gradient-to-r from-brand to-accent-gold" />

      <div className="flex w-full flex-col items-center gap-3 p-5 pt-4">
        <Avatar src={profile.avatarUrl} name={profile.name} size="lg" />

        <div className="flex w-full flex-col items-center gap-1 text-center">
          <h3 className="text-sm font-semibold text-text-strong">
            {profile.name}
          </h3>

          {(profile.company || profile.position) && (
            <p className="flex items-center gap-1 text-xs text-text-muted">
              <Building2 className="size-3 shrink-0" />
              <span className="truncate">
                {[profile.company, profile.position]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            </p>
          )}
        </div>

        {profile.bio && (
          <p className="line-clamp-1 w-full text-center text-xs text-text-subtle">
            {profile.bio}
          </p>
        )}

        {/* Social icons */}
        {(profile.github || profile.linkedin) && (
          <div className="flex items-center gap-2 pt-1">
            {profile.github && (
              <Github className="size-3.5 text-text-subtle transition-colors group-hover:text-text-main" />
            )}
            {profile.linkedin && (
              <Linkedin className="size-3.5 text-text-subtle transition-colors group-hover:text-text-main" />
            )}
          </div>
        )}
      </div>
    </button>
  );
}
