import { Skeleton } from "@/components/ui/skeleton";

export function ProfileCardSkeleton() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl bg-card p-5 ring-1 ring-foreground/10">
      <Skeleton className="size-16 rounded-full" />
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-3 w-32" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}
