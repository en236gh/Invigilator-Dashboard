import { apiRequest, getCachedJson } from "@/lib/api/client";
import type { Assignment } from "@/lib/types/api";

export async function getAssignments() {
  return getCachedJson<Assignment[]>("/api/invigilator/assignments");
}

export async function startExamSession(examSessionId: number, venueId: number) {
  return apiRequest<Assignment>(
    `/api/invigilator/assignments/${examSessionId}/${venueId}/start`,
    { method: "POST" },
  );
}

export async function endExamSession(examSessionId: number, venueId: number) {
  return apiRequest<Assignment>(
    `/api/invigilator/assignments/${examSessionId}/${venueId}/end`,
    { method: "POST" },
  );
}

/** Fresh list for client polling near/after exam end (bypasses request memo). */
export async function fetchAssignments() {
  return apiRequest<Assignment[]>("/api/invigilator/assignments");
}
