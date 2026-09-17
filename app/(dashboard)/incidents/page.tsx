import { AppShell } from "@/components/layout/app-shell";
import { listIncidents } from "@/lib/api/incidents";
import { getSessionUser } from "@/lib/auth/session";
import { Badge } from "@/components/ui/badge";
import type { Incident } from "@/lib/types/api";

export const metadata = {
  title: "Incidents",
};

export default async function IncidentsPage() {
  const user = await getSessionUser();
  if (!user) return null;

  let incidents: Incident[] = [];
  let error: string | undefined;

  try {
    incidents = await listIncidents();
  } catch (err) {
    error = err instanceof Error ? err.message : "Could not load incidents.";
  }

  return (
    <AppShell title="Incidents" user={user}>
      <div className="space-y-4">
        {error ? (
          <div className="rounded-[10px] bg-unza-red/5 px-4 py-3 text-sm text-unza-red">
            {error}
          </div>
        ) : null}
        <section className="rounded-[10px] bg-white p-6 shadow-sm"><h2 className="text-lg font-semibold text-ink">System-wide incident log</h2><p className="mb-4 text-sm text-muted">Administrators can review incidents; reporting is an invigilator workflow.</p><div className="space-y-3">{incidents.map(i=><article key={i.incidentId} className="rounded-[10px] bg-surface-muted p-4"><div className="flex justify-between gap-3"><p className="font-semibold text-ink">{i.incidentType.replaceAll("_", " ")}</p><Badge tone={i.severity === "CRITICAL" ? "danger" : i.severity === "MAJOR" ? "warning" : "neutral"}>{i.severity}</Badge></div><p className="mt-2 text-sm text-ink">{i.description}</p><p className="mt-2 text-xs text-muted">{i.courseCode ?? "Exam"} · {i.venueName ?? "Venue"} · {i.computerNumber ?? "No student specified"}</p></article>)}{!incidents.length&&<p className="py-10 text-center text-sm text-muted">No incidents have been recorded.</p>}</div></section>
      </div>
    </AppShell>
  );
}
