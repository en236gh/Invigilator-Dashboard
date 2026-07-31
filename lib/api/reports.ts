import { apiRequest } from "@/lib/api/client";
import type { ReportResult } from "@/lib/types/api";

export async function generateExamReport(examSessionId: number) {
  return apiRequest<ReportResult>(
    `/api/reports/exam-session/${examSessionId}`,
    { method: "POST" },
  );
}
