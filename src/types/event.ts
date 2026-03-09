export type EventCategory = "class" | "meetup" | "mt" | "dinner" | "study";
export type RsvpStatus = "attending" | "declined" | "maybe";

export const EVENT_CATEGORIES: {
  value: EventCategory;
  label: string;
  color: string;
  bg: string;
}[] = [
  { value: "class", label: "수업", color: "text-blue-700", bg: "bg-blue-100" },
  { value: "meetup", label: "모임", color: "text-green-700", bg: "bg-green-100" },
  { value: "mt", label: "MT", color: "text-orange-700", bg: "bg-orange-100" },
  { value: "dinner", label: "회식", color: "text-pink-700", bg: "bg-pink-100" },
  { value: "study", label: "스터디", color: "text-purple-700", bg: "bg-purple-100" },
];

export const CATEGORY_MAP = Object.fromEntries(
  EVENT_CATEGORIES.map((c) => [c.value, c]),
) as Record<EventCategory, (typeof EVENT_CATEGORIES)[number]>;

export interface EventSummary {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  startAt: string;
  endAt: string | null;
  category: string | null;
  isRecurring: boolean;
  recurrenceRule: string | null;
  creatorId: string;
  createdAt: string;
  updatedAt: string;
  creatorName: string | null;
  creatorAvatar: string | null;
  rsvpAttending: number;
  rsvpDeclined: number;
  rsvpMaybe: number;
  myRsvp: RsvpStatus | null;
  virtualDate: string | null;
}

export interface RsvpUser {
  userId: string;
  status: RsvpStatus;
  userName: string | null;
  userAvatar: string | null;
}

export interface EventDetail extends EventSummary {
  rsvps?: RsvpUser[];
}
