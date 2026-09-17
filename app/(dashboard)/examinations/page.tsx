import { ExamWorkspace } from "@/components/admin/exam-workspace";
import { AppShell } from "@/components/layout/app-shell";
import { getAllocationStatistics, getExamVenues, getRegisteredStudents, listExaminations } from "@/lib/api/admin";
import { getSessionUser } from "@/lib/auth/session";

export const metadata = { title: "Examination oversight" };

export default async function ExaminationsPage({ searchParams }: { searchParams: Promise<{ examSessionId?: string }> }) {
  const user = await getSessionUser();
  if (!user) return null;
  const examinations = await listExaminations().catch(() => []);
  const params = await searchParams;
  const selectedId = Number(params.examSessionId) || examinations[0]?.examSessionId;
  const exam = examinations.find((item) => item.examSessionId === selectedId);

  if (!exam) return <AppShell title="Examination oversight" user={user}><p className="rounded-[10px] bg-white p-10 text-center text-muted shadow-sm">No examinations are available.</p></AppShell>;

  const [students, venues, allocation] = await Promise.all([
    getRegisteredStudents(selectedId).catch(() => []),
    getExamVenues(selectedId).catch(() => []),
    getAllocationStatistics(selectedId).catch(() => null),
  ]);
  return <AppShell title="Examination oversight" user={user}><div className="mb-5 rounded-[10px] bg-white p-4 shadow-sm"><p className="text-sm font-medium text-ink">Select examination</p><div className="mt-2 flex flex-wrap gap-2">{examinations.map((item) => <a key={item.examSessionId} href={`/examinations?examSessionId=${item.examSessionId}`} className={`rounded px-3 py-2 text-sm ${item.examSessionId === selectedId ? "bg-ink text-white" : "bg-surface-muted text-ink"}`}>{item.courseCode}</a>)}</div></div><ExamWorkspace exam={exam} students={students} venues={venues} allocation={allocation}/></AppShell>;
}
