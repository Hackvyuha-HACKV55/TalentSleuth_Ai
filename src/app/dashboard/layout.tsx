
"use client";
import type { ReactNode } from "react";
import {
  SidebarProvider,
  Sidebar,
  SidebarTrigger,
  SidebarContent, // Added SidebarContent
  SidebarInset,
  SidebarRail,
} from "@/components/ui/sidebar";
import { DashboardSidebarNav } from "@/components/layout/dashboard-sidebar-nav";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { PanelLeft } from "lucide-react"; // For mobile trigger

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Skeleton className="h-12 w-12 rounded-full bg-muted/50" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px] bg-muted/50" />
            <Skeleton className="h-4 w-[200px] bg-muted/50" />
          </div>
           <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen>
      <Sidebar collapsible="icon" className="border-r border-border/60 bg-sidebar text-sidebar-foreground">
        <SidebarRail /> {/* Handles desktop collapse interaction */}
        {/* Content for the actual sidebar panel */}
        <SidebarContent> 
          <DashboardSidebarNav />
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 sm:py-4">
          <SidebarTrigger className="sm:hidden"> {/* Mobile trigger */}
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle Sidebar</span>
          </SidebarTrigger>
          {/* Add breadcrumbs or page title here if needed */}
        </header>
        {/* This div now centers its direct child (the page content) */}
        <div className="w-full flex flex-1 flex-col items-center p-6 sm:p-8 animate-fadeIn"> 
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
