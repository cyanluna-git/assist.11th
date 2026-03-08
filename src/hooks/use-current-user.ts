import { useQuery } from "@tanstack/react-query";

interface CurrentUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export function useCurrentUser() {
  return useQuery<CurrentUser>({
    queryKey: ["current-user"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me");
      if (!res.ok) throw new Error("Failed to fetch current user");
      const data = await res.json();
      return data.user;
    },
  });
}
