import { AppShell } from "@/components/layout/app-shell";
import { listGeneratedReports } from "@/lib/api/admin";
import { getSessionUser } from "@/lib/auth/session";
import type { GeneratedReport } from "@/lib/types/api";

export const metadata = {
  title: "Reports",
};

export default async function ReportsPage() {
  const user = await getSessionUser();
  if (!user) return null;

  let reports: GeneratedReport[] = [];
  let error: string | undefined;

  try {
    reports = await listGeneratedReports();
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
          <section className="rounded-[10px] bg-white p-6 shadow-sm"><h2 className="text-lg font-semibold text-ink">Generated reports</h2><p className="mb-4 text-sm text-muted">Report generation and downloads are not administrator API capabilities.</p><div className="space-y-3">{reports.map((r,i)=><article key={String(r.reportId ?? i)} className="rounded-[10px] bg-surface-muted p-4"><p className="font-semibold text-ink">{r.title ?? "Examination report"}</p><p className="mt-1 text-sm text-muted">{r.reportType ?? "Report"} · {r.generatedAt ? new Date(r.generatedAt).toLocaleString() : "Date unavailable"}</p>{r.summary&&<p className="mt-2 text-sm text-ink">{r.summary}</p>}</article>)}{!reports.length&&<p className="py-10 text-center text-sm text-muted">No generated reports are available.</p>}</div></section>
      </div>
    </AppShell>
  );
}
