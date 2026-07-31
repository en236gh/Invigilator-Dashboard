export const INCIDENT_TYPES = [
  { value: "CHEATING", label: "Cheating" },
  { value: "PHONE_FOUND", label: "Phone found" },
  { value: "WRONG_VENUE", label: "Wrong venue" },
  { value: "MEDICAL_EMERGENCY", label: "Medical emergency" },
  { value: "DISTURBANCE", label: "Disturbance" },
  { value: "LATE_ARRIVAL", label: "Late arrival" },
  { value: "OTHER", label: "Other" },
] as const;

export const INCIDENT_SEVERITIES = [
  { value: "MINOR", label: "Minor" },
  { value: "MAJOR", label: "Major" },
  { value: "CRITICAL", label: "Critical" },
] as const;

export const ACCESS_TOKEN_COOKIE = "invigilator_access_token";
export const REFRESH_TOKEN_COOKIE = "invigilator_refresh_token";
export const USER_EMAIL_COOKIE = "invigilator_email";
export const USER_NAME_COOKIE = "invigilator_name";
/** Readable expiry timestamp (ms) so the client can refresh before JWT dies. */
export const ACCESS_EXPIRES_AT_COOKIE = "invigilator_access_expires_at";

/** Access JWT lifetime from the backend. */
export const ACCESS_TOKEN_TTL_MS = 5 * 60 * 1000;
/** Refresh this long before expiry. */
export const REFRESH_SKEW_MS = 60 * 1000;

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "HomeIcon" },
  { href: "/check-in", label: "Check-in", icon: "QrCodeIcon" },
  { href: "/attendance", label: "Attendance", icon: "ClipboardDocumentListIcon" },
  { href: "/incidents", label: "Incidents", icon: "ExclamationTriangleIcon" },
  { href: "/reports", label: "Reports", icon: "DocumentChartBarIcon" },
] as const;
