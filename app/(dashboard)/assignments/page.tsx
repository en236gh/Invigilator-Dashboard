import { AssignmentWorkspace } from "@/components/admin/assignment-workspace";
import { AppShell } from "@/components/layout/app-shell";
import { getSessionUser } from "@/lib/auth/session";
import { getVenueStaffing, listExaminations, listInvigilatorAssignments } from "@/lib/api/admin";

export const metadata = { title: "Invigilator assignments" };

export default async function AssignmentsPage({ searchParams }: { searchParams: Promise<{ examSessionId?: string }> }) {
  const user = await getSessionUser();
  if (!user) return null;
  const examinations = await listExaminations().catch(() => []);
  const params = await searchParams;
  const selectedId = Number(params.examSessionId) || examinations[0]?.examSessionId;
  const selectedExam = examinations.find((exam) => exam.examSessionId === selectedId);
  if (!selectedExam) return <AppShell title="Invigilator assignments" user={user}><p className="rounded-[10px] bg-white p-10 text-center text-muted shadow-sm">No examinations are available for assignment planning.</p></AppShell>;
  const [staffing, assignments] = await Promise.all([getVenueStaffing(selectedId).catch(() => []), listInvigilatorAssignments(selectedId).catch(() => [])]);
  return <AppShell title="Invigilator assignments" user={user}><AssignmentWorkspace examinations={examinations} selectedExam={selectedExam} staffing={staffing} assignments={assignments} /></AppShell>;
}