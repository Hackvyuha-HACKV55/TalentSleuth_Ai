
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { Briefcase, LogIn, LogOut, UserPlus, LayoutDashboard, UserCircle, ListChecks, ArrowRight } from "lucide-react";

export default function Navbar() {
  const { user, signOut, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    try {
      await signOut();
      // For student sign out, redirect to student login, else to main login
      if (pathname.startsWith('/student')) {
        router.push("/student/login");
      } else {
        router.push("/login");
      }
    } catch (error) {
      console.error("Failed to sign out", error);
    }
  };

  const isStudentPage = pathname.startsWith('/student');
  const isRecruiterAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/forgot-password';
  const isStudentAuthPage = pathname === '/student/login' || pathname === '/student/signup';


  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Briefcase className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold text-primary tracking-tight">
            TalentSleuth AI
          </span>
        </Link>
        <nav className="flex items-center space-x-1 md:space-x-2">
          {loading ? (
            <Button variant="outline" size="sm" disabled className="rounded-lg">
              Loading...
            </Button>
          ) : user ? (
            <>
              {isStudentPage ? (
                <>
                  <Button variant="ghost" size="sm" asChild className="text-sm font-medium text-foreground hover:text-primary rounded-lg">
                    <Link href="/student/jobs">
                      <ListChecks className="mr-1.5 h-4 w-4" /> Job Listings
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild className="text-sm font-medium text-foreground hover:text-primary rounded-lg">
                    <Link href="/student/profile">
                      <UserCircle className="mr-1.5 h-4 w-4" /> My Profile
                    </Link>
                  </Button>
                </>
              ) : (
                <Button variant="outline" size="sm" asChild className="rounded-lg">
                  <Link href="/dashboard" className="text-sm font-medium text-primary hover:text-primary/80">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handleSignOut} className="text-sm font-medium text-primary hover:text-primary/80 rounded-lg">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <>
             {/* Show Recruiter Login/Signup only if not on student auth pages */}
             {!isStudentAuthPage && (
                <>
                    <Button variant="ghost" asChild size="sm" className="rounded-lg">
                        <Link href="/login" className="text-sm font-medium text-foreground hover:text-primary">
                        <ArrowRight className="mr-2 h-4 w-4" /> Recruiter Login
                        </Link>
                    </Button>
                    <Button variant="default" asChild size="sm" className="rounded-lg">
                        <Link href="/signup" className="text-sm font-medium">
                        <UserPlus className="mr-2 h-4 w-4" /> Recruiter Sign Up
                        </Link>
                    </Button>
                </>
             )}
              {/* Show Student Login only if not on main recruiter auth pages */}
              {!isRecruiterAuthPage && !isStudentPage && (
                 <Button variant="outline" asChild size="sm" className="rounded-lg ml-2">
                    <Link href="/student/login" className="text-sm font-medium text-primary hover:text-primary/80">
                       <UserCircle className="mr-2 h-4 w-4" /> Student Portal
                    </Link>
                </Button>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
