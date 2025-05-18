
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileUp,
  ClipboardList,
  Briefcase,
  Settings,
  LogOut,
  HelpCircle,
  Columns, 
  Archive,
  FileText as ApplicationsIcon, // Using FileText as a placeholder for Applications
} from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
  SidebarSeparator,
  SidebarGroupLabel,
  SidebarGroup,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/auth-context";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

const mainNavItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/candidates", label: "Candidates", icon: Users },
  { href: "/dashboard/compare-candidates", label: "Compare", icon: Columns },
];

const toolsNavItems = [
  { href: "/dashboard/upload-resume", label: "Upload Resume", icon: FileUp },
  { href: "/dashboard/upload-jd", label: "Upload JD & Match", icon: ClipboardList },
  { href: "/dashboard/interview-prep", label: "Interview Prep", icon: HelpCircle },
];

const atsNavItems = [
  { href: "/dashboard/ats/jobs", label: "Job Requisitions", icon: Archive },
  { href: "/dashboard/ats/applications", label: "Applications", icon: ApplicationsIcon },
];

const NavLink = ({ href, label, icon: Icon }: { href: string; label: string; icon: React.ElementType }) => {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  return (
    <SidebarMenuItem>
      <Link href={href} passHref legacyBehavior>
        <SidebarMenuButton
          asChild
          isActive={isActive}
          className={cn(
            isActive ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            "rounded-md" 
          )}
          tooltip={{ children: label, className: "whitespace-nowrap" }}
        >
          <a>
            <Icon className={cn("text-muted-foreground", isActive ? "text-sidebar-primary-foreground" : "group-hover:text-sidebar-accent-foreground")} />
            <span>{label}</span>
          </a>
        </SidebarMenuButton>
      </Link>
    </SidebarMenuItem>
  );
};

export function DashboardSidebarNav() {
  const { user, signOut } = useAuth();

  const getInitials = (name?: string | null) => {
    if (!name) return "TS";
    const names = name.split(' ');
    if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
    return names[0][0].toUpperCase() + names[names.length -1][0].toUpperCase();
  }

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center space-x-3 p-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0">
          <Briefcase className="h-8 w-8 text-primary group-data-[collapsible=icon]:h-7 group-data-[collapsible=icon]:w-7" />
          <div className="group-data-[collapsible=icon]:hidden">
            <h2 className="text-lg font-semibold text-primary tracking-tight">TalentSleuth</h2>
            <p className="text-xs text-muted-foreground">AI Hiring Assistant</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarGroup>
        <SidebarGroupLabel className="group-data-[collapsible=icon]:justify-center text-muted-foreground/80">Main</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {mainNavItems.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarSeparator />
      
      <SidebarGroup>
        <SidebarGroupLabel className="group-data-[collapsible=icon]:justify-center text-muted-foreground/80">Tools</SidebarGroupLabel>
        <SidebarGroupContent>
           <SidebarMenu>
            {toolsNavItems.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarSeparator />
      
      <SidebarGroup>
        <SidebarGroupLabel className="group-data-[collapsible=icon]:justify-center text-muted-foreground/80">ATS</SidebarGroupLabel>
        <SidebarGroupContent>
           <SidebarMenu>
            {atsNavItems.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>


      <div className="flex-grow" /> {/* Spacer */}
      
      <SidebarSeparator />
      
      <SidebarGroup>
        <SidebarGroupLabel className="group-data-[collapsible=icon]:justify-center text-muted-foreground/80">
          Account
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenuItem>
             <SidebarMenuButton
                asChild
                className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md"
                tooltip={{ children: "Settings", className: "whitespace-nowrap" }}
              >
              <Link href="/dashboard/settings" className="flex items-center">
                <Settings className="text-muted-foreground group-hover:text-sidebar-accent-foreground" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarGroupContent>
      </SidebarGroup>
      
      <SidebarFooter>
        <div className="flex items-center space-x-3 p-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0">
          <Avatar className="h-9 w-9 group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8 border-2 border-primary/50">
            <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || "User"} />
            <AvatarFallback className="bg-muted text-primary font-semibold">{getInitials(user?.displayName || user?.email)}</AvatarFallback>
          </Avatar>
          <div className="group-data-[collapsible=icon]:hidden">
            <p className="text-sm font-medium text-foreground truncate">{user?.displayName || user?.email}</p>
            <Button variant="ghost" size="sm" onClick={signOut} className="h-auto p-0 text-xs text-muted-foreground hover:text-destructive">
              <LogOut className="mr-1 h-3 w-3" /> Sign Out
            </Button>
          </div>
        </div>
      </SidebarFooter>
    </>
  );
}
