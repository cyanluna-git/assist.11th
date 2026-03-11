"use client";

import { Building2, Github, Linkedin } from "lucide-react";
import { useImageColor } from "@/hooks/use-image-color";
import type { Profile } from "@/types/profile";

const FALLBACK_COLORS = [
  ["#0f4d81", "#0d4472"],
  ["#0A66C2", "#004182"],
  ["#ad7b2f", "#b8860b"],
  ["#2d3436", "#636e72"],
  ["#6c5ce7", "#a29bfe"],
  ["#1c8b57", "#00695c"],
] as const;

function hashName(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return (name[0] ?? "?").toUpperCase();
}

export function DirectoryCard({
  profile,
  onClick,
}: {
  profile: Profile;
  onClick: () => void;
}) {
  const imageColors = useImageColor(profile.avatarUrl);
  const fallback = FALLBACK_COLORS[hashName(profile.name) % FALLBACK_COLORS.length];
  const primary = imageColors?.primary ?? fallback[0];
  const dark = imageColors?.dark ?? fallback[1];

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative aspect-[9/16] overflow-hidden rounded-xl text-left ring-1 ring-foreground/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
    >
      {/* Photo / fallback initials — fills entire card */}
      {profile.avatarUrl ? (
        <img
          src={profile.avatarUrl}
          alt={profile.name}
          className="absolute inset-0 size-full object-cover"
        />
      ) : (
        <div
          className="absolute inset-0 flex items-center justify-center text-4xl font-semibold text-white"
          style={{ background: `linear-gradient(135deg, ${primary}, ${dark})` }}
        >
          {getInitials(profile.name)}
        </div>
      )}

      {/* Gradient scrim — dark hex + cc (80% opacity) */}
      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(to top, ${dark}cc 0%, transparent 55%)` }}
      />

      {/* Social icons — top-right */}
      <div className="absolute right-3 top-3 z-10 flex items-center gap-1.5">
        {profile.github && (
          <div className="rounded-full bg-white/20 p-1">
            <Github className="size-3 text-white" />
          </div>
        )}
        {profile.linkedin && (
          <div className="rounded-full bg-white/20 p-1">
            <Linkedin className="size-3 text-white" />
          </div>
        )}
      </div>

      {/* Text overlay — bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-4 text-white drop-shadow-lg">
        <h3 className="text-sm font-bold tracking-tight">{profile.name}</h3>
        {(profile.company || profile.position) && (
          <p className="flex items-center gap-1 text-xs opacity-90">
            <Building2 className="size-3 shrink-0" />
            <span className="truncate">{[profile.company, profile.position].filter(Boolean).join(" · ")}</span>
          </p>
        )}
        {profile.bio && (
          <p className="mt-1 line-clamp-1 text-xs leading-relaxed opacity-80">{profile.bio}</p>
        )}
      </div>
    </button>
  );
}
