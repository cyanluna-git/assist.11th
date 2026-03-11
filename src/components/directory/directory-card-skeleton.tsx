import { Skeleton } from "@/components/ui/skeleton";

export function DirectoryCardSkeleton() {
  return (
    <div className="aspect-[9/16] overflow-hidden rounded-xl">
      <Skeleton className="size-full rounded-none" />
    </div>
  );
}
