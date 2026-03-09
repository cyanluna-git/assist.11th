/**
 * Recurring event expansion.
 *
 * Parses a simplified iCal-style recurrence_rule string and expands
 * a master event into virtual instances within a given date range.
 *
 * Supported rule keys: FREQ (DAILY|WEEKLY|MONTHLY), INTERVAL, COUNT,
 * UNTIL (ISO date), BYDAY (comma-separated: MO,TU,WE,TH,FR,SA,SU).
 *
 * RSVP is always on the master event — virtual instances share the
 * same event id but carry a `virtualDate` field.
 */

export interface VirtualEvent {
  /** Same id as the master event */
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  startAt: string; // ISO string
  endAt: string | null; // ISO string
  category: string | null;
  isRecurring: true;
  recurrenceRule: string | null;
  creatorId: string;
  createdAt: string;
  updatedAt: string;
  /** ISO date of this specific occurrence */
  virtualDate: string;
}

interface MasterEvent {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  startAt: Date | string;
  endAt: Date | string | null;
  category: string | null;
  isRecurring: boolean;
  recurrenceRule: string | null;
  creatorId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface ParsedRule {
  freq: "DAILY" | "WEEKLY" | "MONTHLY";
  interval: number;
  count: number | null;
  until: Date | null;
  byDay: number[] | null; // 0=SU, 1=MO ... 6=SA
}

const DAY_MAP: Record<string, number> = {
  SU: 0,
  MO: 1,
  TU: 2,
  WE: 3,
  TH: 4,
  FR: 5,
  SA: 6,
};

const MAX_INSTANCES = 365;

function parseRule(rule: string): ParsedRule | null {
  const parts: Record<string, string> = {};
  for (const segment of rule.split(";")) {
    const [key, value] = segment.split("=");
    if (key && value) parts[key.trim().toUpperCase()] = value.trim();
  }

  const freq = parts.FREQ as ParsedRule["freq"] | undefined;
  if (!freq || !["DAILY", "WEEKLY", "MONTHLY"].includes(freq)) return null;

  const interval = parts.INTERVAL ? parseInt(parts.INTERVAL, 10) : 1;
  const count = parts.COUNT ? parseInt(parts.COUNT, 10) : null;
  const until = parts.UNTIL ? new Date(parts.UNTIL) : null;
  const byDay = parts.BYDAY
    ? parts.BYDAY.split(",")
        .map((d) => DAY_MAP[d.trim().toUpperCase()])
        .filter((n) => n !== undefined)
    : null;

  return { freq, interval: interval || 1, count, until, byDay };
}

function addInterval(date: Date, freq: "DAILY" | "WEEKLY" | "MONTHLY", interval: number): Date {
  const d = new Date(date);
  switch (freq) {
    case "DAILY":
      d.setDate(d.getDate() + interval);
      break;
    case "WEEKLY":
      d.setDate(d.getDate() + 7 * interval);
      break;
    case "MONTHLY":
      d.setMonth(d.getMonth() + interval);
      break;
  }
  return d;
}

export function expandRecurrence(
  event: MasterEvent,
  from: Date,
  to: Date,
): VirtualEvent[] {
  if (!event.isRecurring || !event.recurrenceRule) return [];

  const rule = parseRule(event.recurrenceRule);
  if (!rule) return [];

  const startAt = new Date(event.startAt);
  const duration =
    event.endAt ? new Date(event.endAt).getTime() - startAt.getTime() : null;

  const results: VirtualEvent[] = [];
  let current = new Date(startAt);
  let generated = 0;

  // Advance `current` to close to the window start for efficiency
  // (only for non-BYDAY rules with large gaps)
  const effectiveEnd = rule.until && rule.until < to ? rule.until : to;

  while (current <= effectiveEnd && results.length < MAX_INSTANCES) {
    if (rule.count !== null && generated >= rule.count) break;

    if (rule.freq === "WEEKLY" && rule.byDay) {
      // For BYDAY rules, iterate each day in the current week
      const weekStart = new Date(current);
      for (const dayNum of rule.byDay) {
        const candidate = new Date(weekStart);
        const diff = dayNum - weekStart.getDay();
        candidate.setDate(weekStart.getDate() + diff);

        if (candidate >= startAt && candidate >= from && candidate <= effectiveEnd) {
          if (rule.count !== null && generated >= rule.count) break;
          results.push(
            makeVirtual(event, candidate, duration, startAt),
          );
          generated++;
        }
      }
      current = addInterval(current, "WEEKLY", rule.interval);
    } else {
      if (current >= from && current <= effectiveEnd) {
        results.push(makeVirtual(event, current, duration, startAt));
      }
      generated++;
      current = addInterval(current, rule.freq, rule.interval);
    }

    if (results.length >= MAX_INSTANCES) break;
  }

  return results;
}

function makeVirtual(
  event: MasterEvent,
  date: Date,
  durationMs: number | null,
  _originalStart: Date,
): VirtualEvent {
  const instanceStart = new Date(date);
  // Preserve the time from the original event
  const origStart = new Date(event.startAt);
  instanceStart.setHours(origStart.getHours(), origStart.getMinutes(), origStart.getSeconds(), origStart.getMilliseconds());

  const instanceEnd = durationMs !== null
    ? new Date(instanceStart.getTime() + durationMs)
    : null;

  return {
    id: event.id,
    title: event.title,
    description: event.description,
    location: event.location,
    startAt: instanceStart.toISOString(),
    endAt: instanceEnd ? instanceEnd.toISOString() : null,
    category: event.category,
    isRecurring: true,
    recurrenceRule: event.recurrenceRule,
    creatorId: event.creatorId,
    createdAt: new Date(event.createdAt).toISOString(),
    updatedAt: new Date(event.updatedAt).toISOString(),
    virtualDate: instanceStart.toISOString().split("T")[0],
  };
}
