import { AppShell } from "@/components/layout/app-shell";
import { AdminDashboard } from "@/components/dashboard/admin-dashboard";
import { getAdminDashboard } from "@/lib/api/admin";
import { getSessionUser } from "@/lib/auth/session";
import type { AdminDashboardStats } from "@/lib/types/api";

export const metadata = {
  title: "Dashboard",
};

async function loadDashboard(): Promise<{
  stats: AdminDashboardStats | null;
  error?: string;
}> {
  try {
    return { stats: await getAdminDashboard() };
  } catch (error) {
    return {
      stats: null,
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

  const { stats, error } = await loadDashboard();

  const fallbackStats: AdminDashboardStats = {};

  return (
    <AppShell title="Dashboard" user={user}>
      <div className="space-y-8">
        {error ? (
          <div className="rounded-[10px] border border-unza-red/20 bg-unza-red/5 px-4 py-3 text-sm text-unza-red">
            {error} Ensure the administrator API is available.
          </div>
        ) : null}

        <AdminDashboard stats={stats ?? fallbackStats} />
      </div>
    </AppShell>
  );
}
