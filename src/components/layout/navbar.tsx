
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { useRouter, usePathname } from "next/navigation"; // Added usePathname
import { Briefcase, LogIn, LogOut, UserPlus, LayoutDashboard } from "lucide-react";

export default function Navbar() {
  const { user, signOut, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname(); // Get current path

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Failed to sign out", error);
    }
  };

  const isStudentPage = pathname.startsWith('/student');

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Briefcase className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold text-primary tracking-tight">
            TalentSleuth AI
          </span>
        </Link>
        <nav className="flex items-center space-x-2 md:space-x-4">
          {user && !isStudentPage && ( // Conditionally render Dashboard button
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard" className="text-sm font-medium text-primary hover:text-primary/80">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </Button>
          )}
          {loading ? (
            <Button variant="outline" size="sm" disabled>
              Loading...
            </Button>
          ) : user ? (
            <Button variant="outline" size="sm" onClick={handleSignOut} className="text-sm font-medium text-primary hover:text-primary/80">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          ) : (
            <>
              <Button variant="ghost" asChild size="sm">
                <Link href="/login" className="text-sm font-medium text-foreground hover:text-primary">
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Link>
              </Button>
              <Button variant="default" asChild size="sm">
                <Link href="/signup" className="text-sm font-medium">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Sign Up
                </Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
