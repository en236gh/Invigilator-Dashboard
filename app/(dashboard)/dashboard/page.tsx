import { AppShell } from "@/components/layout/app-shell";
import { AssignmentCards } from "@/components/dashboard/assignment-cards";
import { QuickActionTiles } from "@/components/dashboard/quick-action-tiles";
import { StatsGrid } from "@/components/dashboard/stats-grid";
import { getAssignments } from "@/lib/api/assignments";
import { getDashboardStats } from "@/lib/api/dashboard";
import { getSessionUser } from "@/lib/auth/session";
import type { Assignment, DashboardStats } from "@/lib/types/api";

export const metadata = {
  title: "Dashboard",
};

async function loadDashboard(): Promise<{
  stats: DashboardStats | null;
  assignments: Assignment[];
  error?: string;
}> {
  try {
    const [stats, assignments] = await Promise.all([
      getDashboardStats(),
      getAssignments(),
    ]);
    return { stats, assignments };
  } catch (error) {
    return {
      stats: null,
      assignments: [],
      error:
        error instanceof Error
          ? error.message
          : "Unable to load dashboard data.",
    };
  }
}

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const { stats, assignments, error } = await loadDashboard();

  const fallbackStats: DashboardStats = {
    assignedExaminations: 0,
    assignedVenues: 0,
    checkedInStudents: 0,
    absentStudents: 0,
    scriptsCollected: 0,
    incidents: 0,
  };

  return (
    <AppShell title="Dashboard" user={user}>
      <div className="space-y-8">
        {error ? (
          <div className="rounded-[10px] border border-unza-red/20 bg-unza-red/5 px-4 py-3 text-sm text-unza-red">
            {error} Ensure the API at localhost:8080 is running.
          </div>
        ) : null}

        <StatsGrid
          stats={stats ?? fallbackStats}
          assignments={assignments}
        />
        <QuickActionTiles />

        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-ink">My assignments</h2>
            <p className="text-sm text-muted">
              Start and end sessions here. The timer counts down to the exam
              end time from the server.
            </p>
          </div>
          <AssignmentCards assignments={assignments} />
        </section>
      </div>
    </AppShell>
  );
}
