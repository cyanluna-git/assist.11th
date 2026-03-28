const POLL_DEADLINE_FORMATTER = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export function isPollClosed(closesAt: string | null, now = new Date()) {
  if (!closesAt) {
    return false;
  }

  return new Date(closesAt).getTime() <= now.getTime();
}

export function getPollStatusLabel(closesAt: string | null, now = new Date()) {
  return isPollClosed(closesAt, now) ? "마감" : "진행중";
}

export function formatPollDeadlineLabel(closesAt: string | null) {
  if (!closesAt) {
    return "마감 없음";
  }

  return POLL_DEADLINE_FORMATTER.format(new Date(closesAt));
}
