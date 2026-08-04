import { SidebarInset } from "@/components/ui/sidebar";
import { AppHeader } from "@/components/app-header";

export default function RestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarInset>
      <AppHeader />
      <main className="flex-1 p-4">{children}</main>
    </SidebarInset>
  );
}
