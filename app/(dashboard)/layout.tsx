import { redirect } from "next/navigation";
import { TokenRefreshKeeper } from "@/components/auth/token-refresh-keeper";
import { refreshSessionAction } from "@/lib/actions/auth";
import { getAccessToken } from "@/lib/auth/session";

export default async function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let token = await getAccessToken();
  if (!token) {
    const refreshed = await refreshSessionAction(true);
    if (refreshed.ok) token = await getAccessToken();
  }

  if (!token) redirect("/login");

  return (
    <>
      <TokenRefreshKeeper />
      {children}
    </>
  );
}
