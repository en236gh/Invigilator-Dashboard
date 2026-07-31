import { redirect } from "next/navigation";
import { TokenRefreshKeeper } from "@/components/auth/token-refresh-keeper";
import { getAccessToken } from "@/lib/auth/session";

export default async function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = await getAccessToken();
  if (!token) redirect("/login");

  return (
    <>
      <TokenRefreshKeeper />
      {children}
    </>
  );
}
