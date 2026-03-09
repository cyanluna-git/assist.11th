import { Skeleton } from "@/components/ui/skeleton";

export function PhotoFeedSkeleton() {
  return (
    <div className="space-y-8">
      {/* Date heading skeleton */}
      <div>
        <Skeleton className="mb-4 h-5 w-48" />
        <div className="columns-2 gap-2 sm:columns-3 lg:columns-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="mb-2 break-inside-avoid">
              <Skeleton
                className="w-full rounded-lg"
                style={{ height: `${150 + (i % 3) * 60}px` }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
