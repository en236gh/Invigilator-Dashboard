"use server";

import { revalidatePath } from "next/cache";
import {
  endExamSession,
  fetchAssignments,
  startExamSession,
} from "@/lib/api/assignments";
import {
  checkInStudent,
  lookupStudent,
  markScriptsCollected,
} from "@/lib/api/attendance";
import { reportIncident } from "@/lib/api/incidents";
import { generateExamReport } from "@/lib/api/reports";
import { ApiError } from "@/lib/api/client";
import type {
  Assignment,
  CheckInResult,
  Incident,
  IncidentSeverity,
  IncidentType,
  ReportResult,
  StudentLookup,
} from "@/lib/types/api";

export type ActionResult<T = unknown> = {
  ok: boolean;
  message: string;
  data?: T;
};

function fail<T = unknown>(error: unknown, fallback: string): ActionResult<T> {
  if (error instanceof ApiError) {
    return { ok: false, message: error.message };
  }
  return { ok: false, message: fallback };
}

function refreshPaths() {
  revalidatePath("/dashboard");
  revalidatePath("/attendance");
  revalidatePath("/check-in");
  revalidatePath("/incidents");
  revalidatePath("/reports");
}

export async function startSessionAction(
  examSessionId: number,
  venueId: number,
): Promise<ActionResult<Assignment>> {
  try {
    const data = await startExamSession(examSessionId, venueId);
    refreshPaths();
    return {
      ok: true,
      message: "Examination session is now in progress.",
      data,
    };
  } catch (error) {
    return fail(error, "Could not start the examination session.");
  }
}

export async function endSessionAction(
  examSessionId: number,
  venueId: number,
): Promise<ActionResult<Assignment>> {
  try {
    const data = await endExamSession(examSessionId, venueId);
    refreshPaths();
    return {
      ok: true,
      message: "Examination session marked as completed.",
      data,
    };
  } catch (error) {
    return fail(error, "Could not end the examination session.");
  }
}

export async function refreshAssignmentsAction(): Promise<
  ActionResult<Assignment[]>
> {
  try {
    const data = await fetchAssignments();
    return { ok: true, message: "Assignments refreshed.", data };
  } catch (error) {
    return fail(error, "Could not refresh assignments.");
  }
}

export async function lookupStudentAction(
  computerNumber: string,
  examSessionId: number,
): Promise<ActionResult<StudentLookup>> {
  try {
    const data = await lookupStudent(computerNumber.trim(), examSessionId);
    return { ok: true, message: "Student found.", data };
  } catch (error) {
    return fail(error, "Student lookup failed.");
  }
}

export async function checkInAction(input: {
  computerNumber: string;
  examSessionId: number;
  venueId: number;
}): Promise<ActionResult<CheckInResult>> {
  try {
    const data = await checkInStudent({
      computerNumber: input.computerNumber.trim(),
      examSessionId: input.examSessionId,
      venueId: input.venueId,
      verificationMethod: "COMPUTER",
    });
    refreshPaths();
    return {
      ok: true,
      message:
        data.attendanceStatus === "WRONG_VENUE"
          ? "Checked in with WRONG_VENUE status."
          : "Student checked in successfully.",
      data,
    };
  } catch (error) {
    return fail(error, "Check-in failed.");
  }
}

export async function scriptsCollectedAction(
  examSessionId: number,
  count: number,
): Promise<ActionResult> {
  try {
    await markScriptsCollected(examSessionId, count);
    refreshPaths();
    return { ok: true, message: `Marked ${count} scripts as collected.` };
  } catch (error) {
    return fail(error, "Could not update scripts collected.");
  }
}

export async function reportIncidentAction(input: {
  examSessionId: number;
  venueId: number;
  computerNumber?: string;
  incidentType: IncidentType;
  description: string;
  severity: IncidentSeverity;
  evidencePath?: string;
}): Promise<ActionResult<Incident>> {
  try {
    const data = await reportIncident({
      examSessionId: input.examSessionId,
      venueId: input.venueId,
      computerNumber: input.computerNumber || undefined,
      incidentType: input.incidentType,
      description: input.description.trim(),
      severity: input.severity,
      evidencePath: input.evidencePath || undefined,
    });
    refreshPaths();
    return { ok: true, message: "Incident reported.", data };
  } catch (error) {
    return fail(error, "Could not report incident.");
  }
}

export async function generateReportAction(
  examSessionId: number,
): Promise<ActionResult<ReportResult>> {
  try {
    const data = await generateExamReport(examSessionId);
    refreshPaths();
    return { ok: true, message: "Report generated successfully.", data };
  } catch (error) {
    return fail(error, "Could not generate report.");
  }
}
