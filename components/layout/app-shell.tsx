import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import type { SessionUser } from "@/lib/types/api";

export function AppShell({
  title,
  user,
  children,
}: {
  title: string;
  user: SessionUser;
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-surface">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(247,168,27,0.12),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(0,139,69,0.08),transparent_30%)]" />
      <div className="relative min-h-screen pl-[290px]">
        <AppSidebar />
        <main className="flex min-h-screen min-w-0 flex-1 flex-col p-4 md:p-8">
          <AppHeader title={title} user={user} />
          <div className="animate-fade-up flex-1">{children}</div>
        </main>
      </div>
    </div>
  );
}
