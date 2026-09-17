import { apiRequest, getCachedJson } from "@/lib/api/client";
import type {
  AdminDashboardStats,
  AllocationStatistics,
  Examination,
  ExamVenue,
  GeneratedReport,
  RegisteredStudent,
  StaffAccount,
  StaffAccountPayload,
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
