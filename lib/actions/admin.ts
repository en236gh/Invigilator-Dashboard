"use server";

import { revalidatePath } from "next/cache";
import { ApiError } from "@/lib/api/client";
import {
  autoAssignInvigilators,
  cancelInvigilatorAssignment,
  createInvigilatorAssignment,
  createStaffAccount,
  publishInvigilatorAssignments,
} from "@/lib/api/admin";
import type { AcademicSelection, AssignmentInput, StaffAccount, StaffAccountPayload } from "@/lib/types/api";

export type AdminActionResult<T = unknown> = { ok: boolean; message: string; data?: T };

export async function createStaffAction(input: StaffAccountPayload): Promise<AdminActionResult<StaffAccount>> {
  try {
    const data = await createStaffAccount(input);
    revalidatePath("/staff");
    return { ok: true, message: "Staff account created. Deliver the activation token securely.", data };
  } catch (error) {
    return { ok: false, message: error instanceof ApiError ? error.message : "Could not create the staff account." };
  }
}

export async function autoAssignAction(examSessionId: number, selection: AcademicSelection): Promise<AdminActionResult> {
  try {
    const data = await autoAssignInvigilators(examSessionId, selection);
    revalidatePath("/assignments");
    revalidatePath("/dashboard");
    return { ok: true, message: "Draft assignments generated for review.", data };
  } catch (error) {
    return { ok: false, message: error instanceof ApiError ? error.message : "Could not generate assignments." };
  }
}

export async function createAssignmentAction(input: AssignmentInput): Promise<AdminActionResult> {
  try {
    const data = await createInvigilatorAssignment(input);
    revalidatePath("/assignments");
    return { ok: true, message: "Manual draft assignment created.", data };
  } catch (error) {
    return { ok: false, message: error instanceof ApiError ? error.message : "Could not create the assignment." };
  }
}

export async function cancelAssignmentAction(input: { examSessionId: number; venueId: number; staffId: number }): Promise<AdminActionResult> {
  try {
    const data = await cancelInvigilatorAssignment(input.examSessionId, input.venueId, input.staffId);
    revalidatePath("/assignments");
    return { ok: true, message: "Assignment cancelled.", data };
  } catch (error) {
    return { ok: false, message: error instanceof ApiError ? error.message : "Could not cancel the assignment." };
  }
}

export async function publishAssignmentsAction(examSessionId: number): Promise<AdminActionResult> {
  try {
    const data = await publishInvigilatorAssignments(examSessionId);
    revalidatePath("/assignments");
    revalidatePath("/dashboard");
    return { ok: true, message: "Assignments published for invigilator operations.", data };
  } catch (error) {
    return { ok: false, message: error instanceof ApiError ? error.message : "Could not publish assignments." };
  }
}
