"use client";

import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/providers/sidebar-provider";

export function MainContent({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();

  return (
    <div
      className={cn(
        "flex flex-1 flex-col transition-[padding-left] duration-200",
        "md:pl-[72px]",
        collapsed ? "lg:pl-[72px]" : "lg:pl-[272px]",
      )}
    >
      {children}
    </div>
  );
}
