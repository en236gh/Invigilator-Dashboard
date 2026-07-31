import { redirect } from "next/navigation";
import { getAccessToken } from "@/lib/auth/session";

export default async function HomePage() {
  const token = await getAccessToken();
  redirect(token ? "/dashboard" : "/login");
}
