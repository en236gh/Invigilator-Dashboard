import { AssignmentReviewWorkspace } from "@/components/admin/assignment-review-workspace";
import { AppShell } from "@/components/layout/app-shell";
import { getSessionUser } from "@/lib/auth/session";
import { getVenueStaffing, listExaminations } from "@/lib/api/admin";
import type { VenueStaffing } from "@/lib/types/api";

export const metadata = { title: "Invigilator assignments" };

export default async function AssignmentsPage({ searchParams }: { searchParams: Promise<{ examSessionId?: string }> }) {
  const user = await getSessionUser();
  if (!user) return null;
  const examinations = await listExaminations().catch(() => []);
  const params = await searchParams;
  const selectedId = Number(params.examSessionId) || examinations[0]?.examSessionId;
  const selectedExam = examinations.find((exam) => exam.examSessionId === selectedId);
  if (!selectedExam) return <AppShell title="Invigilator assignments" user={user}><p className="rounded-[10px] bg-white p-10 text-center text-muted shadow-sm">No examinations are available for assignment planning.</p></AppShell>;
  let staffing: VenueStaffing[] = [];
  let error: string | undefined;
  try {
    staffing = await getVenueStaffing(selectedId);
  } catch {
    error = "Could not load venue staffing. Refresh the page or try again later.";
  }
  return <AppShell title="Invigilator assignments" user={user}><AssignmentReviewWorkspace examinations={examinations} selectedExam={selectedExam} staffing={staffing} error={error} /></AppShell>;
}