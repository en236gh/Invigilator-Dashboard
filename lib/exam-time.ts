import type { Assignment } from "@/lib/types/api";

/** Build absolute end datetime from assignment fields (server is source of truth). */
export function getExamEndsAt(assignment: Pick<Assignment, "examDate" | "endTime">) {
  return parseExamDateTime(assignment.examDate, assignment.endTime);
}

export function getExamStartsAt(
  assignment: Pick<Assignment, "examDate" | "startTime">,
) {
  return parseExamDateTime(assignment.examDate, assignment.startTime);
}

function parseExamDateTime(examDate: string, time: string) {
  const datePart = examDate.includes("T")
    ? examDate.slice(0, 10)
    : examDate.slice(0, 10);

  let timePart = time.trim();
  if (timePart.includes("T")) {
    timePart = timePart.split("T")[1] ?? timePart;
  }
  timePart = timePart.replace("Z", "").split(".")[0] ?? timePart;
  if (/^\d{2}:\d{2}$/.test(timePart)) {
    timePart = `${timePart}:00`;
  }

  const parsed = new Date(`${datePart}T${timePart}`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function remainingMs(endsAt: Date | null, now = Date.now()) {
  if (!endsAt) return 0;
  return Math.max(0, endsAt.getTime() - now);
}

/** HH:MM:SS (hours 0–23), with days prefix when ≥ 24h; MM:SS under one hour. */
export function formatCountdown(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");

  const clock = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  if (days > 0) {
    return `${days}d ${clock}`;
  }
  if (hours > 0) {
    return clock;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

export function isExamLive(status: string) {
  return status.toUpperCase() === "IN_PROGRESS";
}

export function isExamClosed(status: string) {
  return status.toUpperCase() === "COMPLETED";
}

export function canCheckIn(status: string) {
  return isExamLive(status);
}
