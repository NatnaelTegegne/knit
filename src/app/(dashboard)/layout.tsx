import { DashboardProviders } from "@/components/dashboard-providers";
import { requireAuth } from "@/lib/auth-utils";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();

  return <DashboardProviders>{children}</DashboardProviders>;
}
