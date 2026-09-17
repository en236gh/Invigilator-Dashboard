import { getCachedJson } from "@/lib/api/client";
import type { Incident } from "@/lib/types/api";

export async function listIncidents() {
  return getCachedJson<Incident[]>("/api/incidents");
}
