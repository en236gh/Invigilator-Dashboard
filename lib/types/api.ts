export type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken?: string;
};

export type DashboardStats = {
  assignedExaminations: number;
  assignedVenues: number;
  checkedInStudents: number;
  absentStudents: number;
  scriptsCollected: number;
  incidents: number;
};

export type Lecturer = {
  staffId: number;
  staffNo: string;
  fullName: string;
  email: string;
  department: string;
};

export type Assignment = {
  examSessionId: number;
  courseCode: string;
  examDate: string;
  startTime: string;
  endTime: string;
  examStatus: string;
  venueId: number;
  venueName: string;
  building?: string;
  capacity?: number;
  lecturers: Lecturer[];
};

export type StudentLookup = {
  computerNumber: string;
  fullName: string;
  program: string;
  photoPath?: string | null;
  allocatedVenueId: number;
  allocatedVenueName: string;
  seatNumber?: string | null;
  alreadyCheckedIn: boolean;
};

export type CheckInPayload = {
  computerNumber: string;
  examSessionId: number;
  venueId: number;
  verificationMethod: "COMPUTER";
};

export type CheckInResult = {
  attendanceStatus: "PRESENT" | "WRONG_VENUE" | string;
  computerNumber?: string;
  studentName?: string;
  checkInTime?: string;
};

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

export type IncidentPayload = {
  examSessionId: number;
  venueId: number;
  computerNumber?: string;
  incidentType: IncidentType;
  description: string;
  severity: IncidentSeverity;
  evidencePath?: string;
};

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

export type ReportResult = {
  reportId?: number;
  examSessionId?: number;
  generatedAt?: string;
  fileName?: string;
  [key: string]: unknown;
};

export type SessionUser = {
  email: string;
  name: string;
  role: string;
};
