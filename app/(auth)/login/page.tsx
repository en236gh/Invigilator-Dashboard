import { redirect } from "next/navigation";
import { LoginPage } from "@/components/auth/login-page";
import { getAccessToken } from "@/lib/auth/session";

export const metadata = {
  title: "Sign in",
};

export default async function LoginRoute({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const token = await getAccessToken();
  if (token) redirect("/dashboard");

  const params = await searchParams;
  const next =
    params.next && params.next.startsWith("/") && !params.next.startsWith("//")
      ? params.next
      : "/dashboard";

  return <LoginPage nextPath={next} />;
}
