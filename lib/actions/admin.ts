"use server";

import { revalidatePath } from "next/cache";
import { ApiError } from "@/lib/api/client";
import { createStaffAccount } from "@/lib/api/admin";
import type { StaffAccount, StaffAccountPayload } from "@/lib/types/api";

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
