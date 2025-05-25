import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider  defaultOpen={true}>
      <AppSidebar />
      <main className="pt-[57px]">
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  );
}