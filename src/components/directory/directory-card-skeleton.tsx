import { Skeleton } from "@/components/ui/skeleton";

export function DirectoryCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-line-subtle bg-surface">
      <div className="h-1 w-full bg-gradient-to-r from-brand/30 to-accent-gold/30" />
      <div className="flex flex-col items-center gap-3 p-5 pt-4">
        <Skeleton className="size-20 rounded-full" />
        <div className="flex flex-col items-center gap-1.5">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-3 w-40" />
      </div>
    </div>
  );
}
