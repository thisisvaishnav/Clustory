import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    
      <main className="pt-[60px]">
        
        {children}
      </main>
    
  );
}
/*
return (
  <SidebarProvider  defaultOpen={true}>
    <AppSidebar />
    <main className="pt-[60px]">
      <SidebarTrigger />
      {children}
    </main>
  </SidebarProvider>
);
*/