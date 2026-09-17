export type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken?: string;
};

export type AdminDashboardStats = {
  todaysExaminations?: number;
  todaysExaminationDetails?: Examination[];
  present?: number;
  absent?: number;
  attendancePercentage?: number;
  totalIncidents?: number;
  todaysIncidents?: number;
  generatedReports?: number;
  venueOccupancy?: VenueOccupancy[];
};

export type VenueOccupancy = { examSessionId?: number; courseCode?: string; venueId?: number; venueName?: string; capacity?: number; allocatedStudents?: number; checkedInStudents?: number; occupancyPercentage?: number };
export type Examination = { examSessionId: number; courseCode: string; courseName?: string; examDate: string; startTime: string; endTime: string; academicYear?: string; semester?: string; examType?: string; status: string };
export type RegisteredStudent = { computerNumber: string; fullName: string; programme?: string; program?: string; yearOfStudy?: number | string; photoPath?: string | null; registrationStatus?: string };
export type ExamVenue = { venueId: number; venueName: string; building?: string; capacity?: number };
export type AllocationStatistics = { registeredStudents?: number; allocatedStudents?: number; totalVenueCapacity?: number; venueFills?: VenueOccupancy[]; allocations?: Array<{ computerNumber?: string; studentName?: string; venueName?: string; seatNumber?: string }> };
export type GeneratedReport = { reportId?: number; examSessionId?: number | { examSessionId?: number; courseCode?: string }; generatedBy?: unknown; title?: string; reportType?: string; filePath?: string; generatedAt?: string; summary?: string; [key: string]: unknown };
export type StaffAccountPayload = { fullName: string; email: string; phone: string; department: string; role: "LECTURER" | "INVIGILATOR" };
export type StaffAccount = StaffAccountPayload & { staffId?: number; accountStatus: "PENDING" | string; activationToken: string; expiresAt?: string };


export type AttendanceRecord = {
  computerNumber: string;
  studentName: string;
  venueName?: string;
  attendanceStatus: string;
  checkInTime?: string | null;
  seatNumber?: string | null;
  scriptsSubmitted?: boolean;
};

export type AttendanceSummary = {
  present?: number;
  absent?: number;
  wrongVenue?: number;
  scriptsCollected?: number;
  totalAllocated?: number;
  [key: string]: number | undefined;
};

export type IncidentType =
  | "CHEATING"
  | "PHONE_FOUND"
  | "WRONG_VENUE"
  | "MEDICAL_EMERGENCY"
  | "DISTURBANCE"
  | "LATE_ARRIVAL"
  | "OTHER";

export type IncidentSeverity = "MINOR" | "MAJOR" | "CRITICAL";


export type Incident = {
  incidentId: number;
  examSessionId?: number;
  venueId?: number;
  venueName?: string;
  courseCode?: string;
  computerNumber?: string | null;
  incidentType: IncidentType;
  description: string;
  severity: IncidentSeverity;
  evidencePath?: string | null;
  reportedAt?: string;
  status?: string;
};


export type SessionUser = {
  email: string;
  name: string;
  role: string;
};
