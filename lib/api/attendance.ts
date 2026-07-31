import { apiRequest, getCachedJson } from "@/lib/api/client";
import type {
  AttendanceRecord,
  AttendanceSummary,
  CheckInPayload,
  CheckInResult,
  StudentLookup,
} from "@/lib/types/api";

export async function lookupStudent(
  computerNumber: string,
  examSessionId: number,
) {
  const params = new URLSearchParams({
    computerNumber,
    examSessionId: String(examSessionId),
  });
  return apiRequest<StudentLookup>(`/api/attendance/lookup?${params}`);
}

export async function checkInStudent(payload: CheckInPayload) {
  return apiRequest<CheckInResult>("/api/attendance/check-in", {
    method: "POST",
    body: payload,
  });
}

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

export async function markScriptsCollected(
  examSessionId: number,
  count: number,
) {
  return apiRequest<unknown>(
    `/api/attendance/exam/${examSessionId}/scripts-collected`,
    {
      method: "POST",
      body: { count },
    },
  );
}
