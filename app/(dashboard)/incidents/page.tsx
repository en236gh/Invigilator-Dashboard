import { AppShell } from "@/components/layout/app-shell";
import { IncidentsWorkspace } from "@/components/incidents/incidents-workspace";
import { getAssignments } from "@/lib/api/assignments";
import { listIncidents } from "@/lib/api/incidents";
import { getSessionUser } from "@/lib/auth/session";
import type { Assignment, Incident } from "@/lib/types/api";

export const metadata = {
  title: "Incidents",
};

export default async function IncidentsPage() {
  const user = await getSessionUser();
  if (!user) return null;

  let assignments: Assignment[] = [];
  let incidents: Incident[] = [];
  let error: string | undefined;

  try {
    [assignments, incidents] = await Promise.all([
      getAssignments(),
      listIncidents(),
    ]);
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
        <IncidentsWorkspace assignments={assignments} incidents={incidents} />
      </div>
    </AppShell>
  );
}
