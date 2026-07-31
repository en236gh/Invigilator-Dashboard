import { apiRequest, getCachedJson } from "@/lib/api/client";
import type { Incident, IncidentPayload } from "@/lib/types/api";

export async function listIncidents() {
  return getCachedJson<Incident[]>("/api/incidents");
}

export async function reportIncident(payload: IncidentPayload) {
  return apiRequest<Incident>("/api/incidents", {
    method: "POST",
    body: payload,
  });
}
