import { AssignmentReviewWorkspace } from "@/components/admin/assignment-review-workspace";
import { AssignmentSelection, type AssignmentChoice } from "@/components/admin/assignment-selection";
import { AppShell } from "@/components/layout/app-shell";
import { getSessionUser } from "@/lib/auth/session";
import { getAssignmentSchools, getAssignmentProgrammes, getAssignmentYears, getAssignmentCourses, getAssignmentExams, getExamVenues, getVenueStaffing, listExaminations } from "@/lib/api/admin";
import type { AcademicSelection, Examination, ExamVenue, VenueStaffing } from "@/lib/types/api";
export const metadata = { title: "Invigilator assignments" };
export default async function AssignmentsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const user = await getSessionUser();
  if (!user) return null;
  const params = await searchParams;
  const choices: AssignmentChoice[] = [];
  let selectedExam: Examination | undefined;
  let selection: AcademicSelection | undefined;
  let venues: ExamVenue[] = [];
  let staffing: VenueStaffing[] = [];
  let examinations: Examination[] = [];
  let error: string | undefined;
  const review = params.review === "1" || (!!params.examSessionId && !params.schoolId);
  function add(key: string, label: string, options: AssignmentChoice["options"], enabled: boolean) {
    const value = enabled && options.some((item) => item.value === params[key]) ? params[key]! : "";
    choices.push({ key, label, options, enabled, value });
    return value;
  }
  try {
    const schools = await getAssignmentSchools();
    const school = add("schoolId", "School", schools.map((row) => ({ value: String(row.school_id), label: row.school_name ?? `School ${row.school_id}` })), true);
    const programmes = school ? await getAssignmentProgrammes(Number(school)) : [];
    const programme = add("programmeId", "Programme", programmes.map((row) => ({ value: String(row.programme_id), label: row.programme_name ?? `Programme ${row.programme_id}` })), !!school);
    const years = programme ? await getAssignmentYears(Number(school), Number(programme)) : [];
    const year = add("yearOfStudy", "Year of study", years.map((row) => ({ value: String(row.year_of_study), label: `Year ${row.year_of_study}` })), !!programme);
    const courses = year ? await getAssignmentCourses(Number(school), Number(programme), Number(year)) : [];
    const codes = [...new Set(courses.map((row) => row.course_code))];
    const course = add("courseCode", "Course", codes.map((code) => {
      const rows = courses.filter((row) => row.course_code === code);
      return { value: code, label: `${code}${rows[0].course_name ? ` - ${rows[0].course_name}` : ""} · Semester ${[...new Set(rows.map((row) => row.semester))].join(", ")}` };
    }), !!year);
    const candidate = course ? { schoolId: Number(school), programmeId: Number(programme), yearOfStudy: Number(year), courseCode: course } : undefined;
    const exams = candidate ? await getAssignmentExams(candidate) : [];
    const uniqueExams = [...new Map(exams.map((row) => [row.exam_session_id, row])).values()];
    const examId = add("examSessionId", "Exam", uniqueExams.map((row) => ({ value: String(row.exam_session_id), label: `${row.academic_year} · Semester ${row.semester} · ${row.exam_date} · ${row.exam_type}` })), !!course);
    const exam = uniqueExams.find((row) => String(row.exam_session_id) === examId);
    if (exam) {
      selection = candidate;
      selectedExam = { examSessionId: exam.exam_session_id, courseCode: exam.course_code, academicYear: exam.academic_year, semester: String(exam.semester), examDate: exam.exam_date, examType: exam.exam_type, startTime: exam.start_time ?? "", endTime: exam.end_time ?? "", status: exam.status ?? "" };
      venues = await getExamVenues(exam.exam_session_id);
    }
    add("venueId", "Venue", venues.map((row) => ({ value: String(row.venueId), label: row.venueName })), !!exam);
  } catch {
    error = "Could not load academic selections. Refresh the page to try again.";
    selection = undefined;
    selectedExam = undefined;
  }
  try {
    if (review) {
      examinations = await listExaminations();
      selectedExam = examinations.find((exam) => exam.examSessionId === Number(params.examSessionId)) ?? examinations[0];
      selection = undefined;
    }
    if (selectedExam) staffing = await getVenueStaffing(selectedExam.examSessionId);
  } catch {
    error = "Could not load venue staffing. Refresh the page to try again.";
  }
  const venueId = choices.find((choice) => choice.key === "venueId")?.value;
  return <AppShell title="Invigilator assignments" user={user}><div className="space-y-6">
    <AssignmentSelection choices={choices} />
    {error && <p role="alert" className="rounded-[10px] bg-unza-red/5 p-4 text-unza-red">{error}</p>}
    {!selectedExam && !error && <p className="rounded-[10px] bg-white p-6 text-muted">Select an examination to prepare assignments. Only approved academic catalog entries and mapped examinations are available.</p>}
    {selectedExam && <AssignmentReviewWorkspace key={`${selectedExam.examSessionId}-${venueId ?? ""}`} examinations={examinations} selectedExam={selectedExam} selection={selection} venues={venues} staffing={staffing} selectedVenueId={venueId ? Number(venueId) : undefined} error={error} />}
  </div></AppShell>;
}
