import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Profile, ProfileDetail, ProfileUpdatePayload } from "@/types/profile";

export function useProfiles(search?: string) {
  return useQuery<Profile[]>({
    queryKey: ["profiles", search ?? ""],
    queryFn: async () => {
      const url = search
        ? `/api/profiles?search=${encodeURIComponent(search)}`
        : "/api/profiles";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch profiles");
      const data = await res.json();
      return data.profiles;
    },
  });
}

export function useProfile(id: string) {
  return useQuery<ProfileDetail>({
    queryKey: ["profile", id],
    queryFn: async () => {
      const res = await fetch(`/api/profiles/${id}`);
      if (!res.ok) throw new Error("Failed to fetch profile");
      const data = await res.json();
      return data.profile;
    },
    enabled: !!id,
  });
}

export function useUpdateProfile(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ProfileUpdatePayload) => {
      const res = await fetch(`/api/profiles/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", id] });
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
  });
}

export function useUploadAvatar() {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to upload avatar");
      const data = await res.json();
      return data.url as string;
    },
  });
}
