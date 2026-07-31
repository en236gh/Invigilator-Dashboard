import { AppShell } from "@/components/layout/app-shell";
import { CheckInWorkspace } from "@/components/check-in/check-in-workspace";
import { getAssignments } from "@/lib/api/assignments";
import { getSessionUser } from "@/lib/auth/session";
import type { Assignment } from "@/lib/types/api";

export const metadata = {
  title: "Check-in",
};

export default async function CheckInPage({
  searchParams,
}: {
  searchParams: Promise<{ computerNumber?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) return null;

  const params = await searchParams;
  let assignments: Assignment[] = [];
  let error: string | undefined;

  try {
    assignments = await getAssignments();
  } catch (err) {
    error = err instanceof Error ? err.message : "Could not load assignments.";
  }

  return (
    <AppShell title="Check-in" user={user}>
      <div className="space-y-4">
        {error ? (
          <div className="rounded-[10px] bg-unza-red/5 px-4 py-3 text-sm text-unza-red">
            {error}
          </div>
        ) : null}
        <CheckInWorkspace
          assignments={assignments}
          initialComputerNumber={params.computerNumber ?? ""}
        />
      </div>
    </AppShell>
  );
}
