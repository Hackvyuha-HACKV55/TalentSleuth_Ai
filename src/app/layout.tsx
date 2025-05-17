
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/auth-context";
import { CandidateProvider } from "@/context/candidate-context";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

const inter = Inter({ 
  variable: "--font-inter", 
  subsets: ["latin"],
});

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
          inter.variable
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
