import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  PollSummary,
  PollDetail,
  PollResults,
} from "@/types/poll";

// ── List Polls ──

export function usePolls(
  status: "all" | "active" | "closed" = "all",
  limit = 20,
  offset = 0,
) {
  return useQuery<PollSummary[]>({
    queryKey: ["polls", status, limit, offset],
    queryFn: async () => {
      const params = new URLSearchParams({
        status,
        limit: String(limit),
        offset: String(offset),
      });
      const res = await fetch(`/api/polls?${params}`);
      if (!res.ok) throw new Error("Failed to fetch polls");
      const data = await res.json();
      return data.polls;
    },
  });
}

// ── Poll Detail ──

export function usePoll(id: string) {
  return useQuery<PollDetail>({
    queryKey: ["poll", id],
    queryFn: async () => {
      const res = await fetch(`/api/polls/${id}`);
      if (!res.ok) throw new Error("Failed to fetch poll");
      const data = await res.json();
      return data.poll;
    },
    enabled: !!id,
  });
}

// ── Poll Results ──

export function usePollResults(id: string, enabled = true) {
  return useQuery<PollResults>({
    queryKey: ["pollResults", id],
    queryFn: async () => {
      const res = await fetch(`/api/polls/${id}/results`);
      if (!res.ok) throw new Error("Failed to fetch poll results");
      const data = await res.json();
      return data.poll;
    },
    enabled: !!id && enabled,
  });
}

// ── Create Poll ──

export function useCreatePoll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      title: string;
      description?: string;
      options: string[];
      isMultiple?: boolean;
      isAnonymous?: boolean;
      closesAt?: string;
    }) => {
      const res = await fetch("/api/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create poll");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["polls"] });
    },
  });
}

// ── Vote ──

export function useVote(pollId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (optionIds: string[]) => {
      const res = await fetch(`/api/polls/${pollId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionIds }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to vote");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["poll", pollId] });
      queryClient.invalidateQueries({ queryKey: ["pollResults", pollId] });
      queryClient.invalidateQueries({ queryKey: ["polls"] });
    },
  });
}

// ── Retract Vote ──

export function useRetractVote(pollId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/polls/${pollId}/vote`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to retract vote");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["poll", pollId] });
      queryClient.invalidateQueries({ queryKey: ["pollResults", pollId] });
      queryClient.invalidateQueries({ queryKey: ["polls"] });
    },
  });
}

// ── Close Poll ──

export function useClosePoll(pollId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/polls/${pollId}/close`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to close poll");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["poll", pollId] });
      queryClient.invalidateQueries({ queryKey: ["pollResults", pollId] });
      queryClient.invalidateQueries({ queryKey: ["polls"] });
    },
  });
}

// ── Delete Poll ──

export function useDeletePoll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/polls/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete poll");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["polls"] });
    },
  });
}

// ── Add Options ──

export function useAddOptions(pollId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (options: string[]) => {
      const res = await fetch(`/api/polls/${pollId}/options`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ options }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add options");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["poll", pollId] });
      queryClient.invalidateQueries({ queryKey: ["pollResults", pollId] });
    },
  });
}
