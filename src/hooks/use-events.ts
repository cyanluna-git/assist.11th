import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  EventSummary,
  EventDetail,
  RsvpStatus,
  RsvpUser,
} from "@/types/event";

// ── List Events ──

export function useEvents(from: string, to: string, category?: string) {
  return useQuery<EventSummary[]>({
    queryKey: ["events", from, to, category],
    queryFn: async () => {
      const params = new URLSearchParams({ from, to });
      if (category) params.set("category", category);
      const res = await fetch(`/api/events?${params}`);
      if (!res.ok) throw new Error("Failed to fetch events");
      const data = await res.json();
      return data.events;
    },
  });
}

// ── Event Detail ──

export function useEvent(id: string) {
  return useQuery<{ event: EventDetail; rsvps: RsvpUser[] }>({
    queryKey: ["event", id],
    queryFn: async () => {
      const res = await fetch(`/api/events/${id}`);
      if (!res.ok) throw new Error("Failed to fetch event");
      return res.json();
    },
    enabled: !!id,
  });
}

// ── Create Event ──

export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      title: string;
      description?: string;
      location?: string;
      startAt: string;
      endAt?: string;
      category?: string;
    }) => {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create event");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

// ── Update Event ──

export function useUpdateEvent(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      title?: string;
      description?: string | null;
      location?: string | null;
      startAt?: string;
      endAt?: string | null;
      category?: string | null;
    }) => {
      const res = await fetch(`/api/events/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to update event");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event", id] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

// ── Delete Event ──

export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete event");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

// ── RSVP (optimistic update) ──

export function useRsvp(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (status: RsvpStatus) => {
      const res = await fetch(`/api/events/${eventId}/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to set RSVP");
      return res.json() as Promise<{ success: boolean; status: RsvpStatus }>;
    },
    onMutate: async (newStatus) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["events"] });
      await queryClient.cancelQueries({ queryKey: ["event", eventId] });

      // Snapshot previous data for rollback
      const prevEvents = queryClient.getQueriesData<EventSummary[]>({
        queryKey: ["events"],
      });

      // Optimistically update all event lists
      queryClient.setQueriesData<EventSummary[]>(
        { queryKey: ["events"] },
        (old) => {
          if (!old) return old;
          return old.map((ev) =>
            ev.id === eventId ? { ...ev, myRsvp: newStatus } : ev,
          );
        },
      );

      return { prevEvents };
    },
    onError: (_err, _status, context) => {
      // Rollback on error
      if (context?.prevEvents) {
        for (const [key, data] of context.prevEvents) {
          queryClient.setQueryData(key, data);
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
    },
  });
}

// ── Remove RSVP ──

export function useRemoveRsvp(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/events/${eventId}/rsvp`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to remove RSVP");
      return res.json();
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["events"] });

      const prevEvents = queryClient.getQueriesData<EventSummary[]>({
        queryKey: ["events"],
      });

      queryClient.setQueriesData<EventSummary[]>(
        { queryKey: ["events"] },
        (old) => {
          if (!old) return old;
          return old.map((ev) =>
            ev.id === eventId ? { ...ev, myRsvp: null } : ev,
          );
        },
      );

      return { prevEvents };
    },
    onError: (_err, _vars, context) => {
      if (context?.prevEvents) {
        for (const [key, data] of context.prevEvents) {
          queryClient.setQueryData(key, data);
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
    },
  });
}
