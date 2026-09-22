import { apiRequest, getCachedJson } from "@/lib/api/client";
import type {
  AcademicSelection, AssignmentInput, AcademicSchool, AcademicProgramme, AcademicYear, AcademicCourse, AcademicExam,
  AdminDashboardStats,
  AllocationStatistics,
  Examination,
  ExamVenue,
  GeneratedReport,
  RegisteredStudent,
  StaffAccount,
  StaffAccountPayload,
  AutoAssignResponse,
  InvigilatorAssignment,
  VenueStaffing,
} from "@/lib/types/api";

export const getAdminDashboard = () =>
  getCachedJson<AdminDashboardStats>("/api/dashboard/admin");
export const listExaminations = () => getCachedJson<Examination[]>("/api/exams");
export const getRegisteredStudents = (id: number) =>
  getCachedJson<RegisteredStudent[]>(`/api/exams/${id}/registered-students`);
export const getExamVenues = (id: number) =>
  getCachedJson<ExamVenue[]>(`/api/exams/${id}/venues`);
export const getAllocationStatistics = (id: number) =>
  getCachedJson<AllocationStatistics>(`/api/allocation/exam-session/${id}`);
export const listGeneratedReports = () => getCachedJson<GeneratedReport[]>("/api/reports");
export const createStaffAccount = (payload: StaffAccountPayload) =>
  apiRequest<StaffAccount>("/api/admin/staff", { method: "POST", body: payload });

export const listInvigilatorAssignments = (examSessionId: number) =>
  getCachedJson<InvigilatorAssignment[]>(
    `/api/admin/invigilator-assignments?examSessionId=${examSessionId}`,
  );
export const getVenueStaffing = (examSessionId: number) =>
  getCachedJson<VenueStaffing[]>(
    `/api/admin/invigilator-assignments/exam-sessions/${examSessionId}/staffing`,
  );
export const createInvigilatorAssignment = (payload: AssignmentInput) =>
  apiRequest<InvigilatorAssignment>("/api/admin/invigilator-assignments", { method: "POST", body: payload });
export const autoAssignInvigilators = (examSessionId: number, selection: AcademicSelection) =>
  apiRequest<AutoAssignResponse>(`/api/admin/invigilator-assignments/exam-sessions/${examSessionId}/auto-assign`, { method: "POST", body: selection });
export const cancelInvigilatorAssignment = (examSessionId: number, venueId: number, staffId: number) =>
  apiRequest<InvigilatorAssignment>(`/api/admin/invigilator-assignments/${examSessionId}/${venueId}/${staffId}/cancel`, { method: "POST" });
export const publishInvigilatorAssignments = (examSessionId: number) =>
  apiRequest<InvigilatorAssignment[]>(`/api/admin/invigilator-assignments/exam-sessions/${examSessionId}/publish`, { method: "POST" });

const academicsPath = "/api/admin/invigilator-assignments/academics";
function academicLookup<T>(route: string, selection: Record<string, string | number> = {}) {
  const query = new URLSearchParams(Object.entries(selection).map(([key, value]) => [key, String(value)]));
  return getCachedJson<T[]>(academicsPath + "/" + route + (query.size ? "?" + query : ""));
}
export const getAssignmentSchools = () => academicLookup<AcademicSchool>("schools");
export const getAssignmentProgrammes = (schoolId: number) => academicLookup<AcademicProgramme>("programmes", { schoolId });
export const getAssignmentYears = (schoolId: number, programmeId: number) => academicLookup<AcademicYear>("years", { schoolId, programmeId });
export const getAssignmentCourses = (schoolId: number, programmeId: number, yearOfStudy: number) => academicLookup<AcademicCourse>("courses", { schoolId, programmeId, yearOfStudy });
export const getAssignmentExams = (selection: AcademicSelection) => academicLookup<AcademicExam>("exams", selection);
