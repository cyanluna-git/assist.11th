import * as React from "react";

import { cn } from "@/lib/utils";

const COLORS = [
  "bg-brand",
  "bg-accent-gold",
  "bg-success",
  "bg-warning",
  "bg-error",
  "bg-brand-dark",
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

function Avatar({
  src,
  name,
  size = "md",
  className,
}: {
  src?: string | null;
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeClasses = {
    sm: "size-8 text-xs",
    md: "size-10 text-sm",
    lg: "size-20 text-2xl",
  };

  if (src) {
    return (
      <img
        data-slot="avatar"
        src={src}
        alt={name}
        className={cn(
          "shrink-0 rounded-full object-cover",
          sizeClasses[size],
          className,
        )}
      />
    );
  }

  const colorClass = COLORS[hashName(name) % COLORS.length];

  return (
    <div
      data-slot="avatar"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-medium text-white",
        sizeClasses[size],
        colorClass,
        className,
      )}
    >
      {getInitials(name)}
    </div>
  );
}

export { Avatar };
