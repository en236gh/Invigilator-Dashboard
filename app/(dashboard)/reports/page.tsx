import { AppShell } from "@/components/layout/app-shell";
import { ReportsWorkspace } from "@/components/reports/reports-workspace";
import { getAssignments } from "@/lib/api/assignments";
import { getSessionUser } from "@/lib/auth/session";
import type { Assignment } from "@/lib/types/api";

export const metadata = {
  title: "Reports",
};

export default async function ReportsPage() {
  const user = await getSessionUser();
  if (!user) return null;

  let assignments: Assignment[] = [];
  let error: string | undefined;

  try {
    assignments = await getAssignments();
  } catch (err) {
    error = err instanceof Error ? err.message : "Could not load assignments.";
  }

  return (
    <AppShell title="Reports" user={user}>
      <div className="space-y-4">
        {error ? (
          <div className="rounded-[10px] bg-unza-red/5 px-4 py-3 text-sm text-unza-red">
            {error}
          </div>
        ) : null}
        <ReportsWorkspace assignments={assignments} />
      </div>
    </AppShell>
  );
}
