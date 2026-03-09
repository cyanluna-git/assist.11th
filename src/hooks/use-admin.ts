import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Invitation {
  id: string;
  code: string;
  email: string | null;
  role: string;
  maxUses: number;
  useCount: number;
  usedAt: string | null;
  expiresAt: string | null;
  invitedBy: string | null;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "member" | "professor";
  company: string | null;
  position: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

export function useInvitations() {
  return useQuery<Invitation[]>({
    queryKey: ["admin", "invitations"],
    queryFn: async () => {
      const res = await fetch("/api/admin/invitations");
      if (!res.ok) throw new Error("Failed to fetch invitations");
      const data = await res.json();
      return data.invitations;
    },
  });
}

export function useCreateInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      role?: string;
      maxUses?: number;
      expiresInDays?: number;
    }) => {
      const res = await fetch("/api/admin/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to create invitation");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "invitations"] }),
  });
}

export function useAdminUsers() {
  return useQuery<AdminUser[]>({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      return data.users;
    },
  });
}

export function useUpdateUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error("Failed to update role");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete user");
      }
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
}
