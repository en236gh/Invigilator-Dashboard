import { AppShell } from "@/components/layout/app-shell";
import { StaffWorkspace } from "@/components/admin/staff-workspace";
import { getSessionUser } from "@/lib/auth/session";
export const metadata={title:"Staff onboarding"};
export default async function StaffPage(){const user=await getSessionUser();if(!user)return null;return <AppShell title="Staff onboarding" user={user}><StaffWorkspace/></AppShell>}
