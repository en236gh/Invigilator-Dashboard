import { getCachedJson } from "@/lib/api/client";
import type {
  AttendanceRecord,
  AttendanceSummary,
} from "@/lib/types/api";

export async function getAttendanceRegister(examSessionId: number) {
  return getCachedJson<AttendanceRecord[]>(
    `/api/attendance/exam/${examSessionId}`,
  );
}

export async function getAttendanceSummary(examSessionId: number) {
  return getCachedJson<AttendanceSummary>(
    `/api/attendance/exam/${examSessionId}/summary`,
  );
}
