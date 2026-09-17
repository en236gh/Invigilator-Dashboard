import { AppShell } from "@/components/layout/app-shell";
import { AttendanceWorkspace } from "@/components/attendance/attendance-workspace";
import { listExaminations } from "@/lib/api/admin";
import {
  getAttendanceRegister,
  getAttendanceSummary,
} from "@/lib/api/attendance";
import { getSessionUser } from "@/lib/auth/session";
import type {
  Examination,
  AttendanceRecord,
  AttendanceSummary,
} from "@/lib/types/api";

export const metadata = {
  title: "Attendance",
};

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ examSessionId?: string; q?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) return null;

  const params = await searchParams;
  let examinations: Examination[] = [];
  let records: AttendanceRecord[] = [];
  let summary: AttendanceSummary | null = null;
  let error: string | undefined;

  try {
    examinations = await listExaminations();
    const preferred = Number(params.examSessionId) || examinations[0]?.examSessionId;

    if (preferred) {
      const [register, summaryData] = await Promise.all([
        getAttendanceRegister(preferred),
        getAttendanceSummary(preferred).catch(() => null),
      ]);
      records = register;
      summary = summaryData;
    }
  } catch (err) {
    error = err instanceof Error ? err.message : "Could not load attendance.";
  }

  const examSessionId =
    Number(params.examSessionId) ||
    examinations[0]?.examSessionId;

  return (
    <AppShell title="Attendance register" user={user}>
      <div className="space-y-4">
        {error ? (
          <div className="rounded-[10px] bg-unza-red/5 px-4 py-3 text-sm text-unza-red">
            {error}
          </div>
        ) : null}
        <AttendanceWorkspace
          examinations={examinations}
          selectedId={examSessionId}
          records={records}
          summary={summary}
        />
      </div>
    </AppShell>
  );
}
