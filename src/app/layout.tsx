
import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Changed from Geist
import "./globals.css";
import { AuthProvider } from "@/context/auth-context";
import { CandidateProvider } from "@/context/candidate-context";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

const inter = Inter({ // Changed from geistSans
  variable: "--font-inter", // Changed from --font-geist-sans
  subsets: ["latin"],
});

// Removed Geist Mono as Inter will be the primary font

export const metadata: Metadata = {
  title: "TalentSleuth AI - Your Virtual Talent Analyst",
  description: "AI-powered candidate evaluation platform for HR teams.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable // Changed from geistSans.variable
          // Removed geistMono.variable
        )}
      >
        <AuthProvider>
          <CandidateProvider>
            <div className="relative flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-1 animate-fadeIn">{children}</main>
              <Footer />
            </div>
            <Toaster />
          </CandidateProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
