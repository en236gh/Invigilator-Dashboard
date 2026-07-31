import { apiRequest, getCachedJson } from "@/lib/api/client";
import type { DashboardStats } from "@/lib/types/api";

export { loginRequest, refreshRequest } from "@/lib/api/auth";

export async function getDashboardStats() {
  return getCachedJson<DashboardStats>("/api/dashboard/invigilator");
}
