"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProfileDetailView } from "@/components/profiles/profile-detail-view";
import { useProfile } from "@/hooks/use-profiles";
import { Skeleton } from "@/components/ui/skeleton";

function ProfileModalSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <Skeleton className="size-20 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-1">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-28" />
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-20 w-full rounded-lg" />
      </div>
    </div>
  );
}

export function ProfileModal({
  profileId,
  open,
  onOpenChange,
}: {
  profileId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: profile, isLoading } = useProfile(profileId ?? "");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
        <DialogTitle className="sr-only">
          {profile?.name ?? "프로필"}
        </DialogTitle>
        {isLoading || !profile ? (
          <ProfileModalSkeleton />
        ) : (
          <ProfileDetailView
            profile={profile}
            isOwner={false}
            onEdit={() => {}}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
