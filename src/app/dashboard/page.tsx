
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { ArrowRight, FileUp, ClipboardList, Users, BarChartBig, Loader2 } from "lucide-react";
import Link from "next/link";
import { CandidateCard } from "@/components/domain/candidate-card";
import { useCandidateContext } from "@/context/candidate-context"; 
import type { UnifiedCandidate } from "@/lib/mock-data"; 

export default function DashboardOverviewPage() {
  const { user } = useAuth();
  const { candidates, loadingCandidates } = useCandidateContext(); 

  // Take first 3 candidates for display, make sure they are sorted if order matters (e.g. by add date)
  // For now, just taking the first 3 from the current list.
  // If candidates are added to the start of the list in context, this will show the newest.
  const recentCandidates: UnifiedCandidate[] = candidates.slice(0, 3); 

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Welcome back, {user?.displayName || user?.email?.split('@')[0] || "User"}!
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s an overview of your talent acquisition pipeline.
          </p>
        </div>
        <div className="flex gap-2">
           <Button asChild className="rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <Link href="/dashboard/upload-resume">
              <FileUp className="mr-2 h-4 w-4" /> Upload Resume
            </Link>
          </Button>
           <Button asChild variant="outline" className="rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <Link href="/dashboard/upload-jd">
              <ClipboardList className="mr-2 h-4 w-4" /> Upload Job Description
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary">Total Candidates</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingCandidates ? (
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            ) : (
              <div className="text-2xl font-bold text-foreground">{candidates.length}</div>
            )}
            <p className="text-xs text-muted-foreground">In your talent pool</p> 
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary">Job Descriptions</CardTitle>
            <ClipboardList className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">56</div> {/* Static for now, can be dynamic later */}
            <p className="text-xs text-muted-foreground">+5 since last week</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary">Average Fit Score</CardTitle>
            <BarChartBig className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingCandidates ? (
               <Loader2 className="h-6 w-6 animate-spin text-primary" />
            ) : (
              <div className="text-2xl font-bold text-foreground">
                {(() => {
                  const scoredCandidates = candidates.filter(c => c.fitScore !== undefined && c.fitScore !== null);
                  if (scoredCandidates.length === 0) return "N/A";
                  const avg = scoredCandidates.reduce((sum, c) => sum + (c.fitScore!), 0) / scoredCandidates.length;
                  return `${Math.round(avg)}%`;
                })()}
              </div>
            )}
            <p className="text-xs text-muted-foreground">Across all matched roles</p>
          </CardContent>
        </Card>
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Recent Candidates</h2>
          <Button variant="link" asChild className="text-primary">
            <Link href="/dashboard/candidates">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        {loadingCandidates ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-3 text-muted-foreground">Loading recent candidates...</p>
          </div>
        ) : recentCandidates.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recentCandidates.map(candidate => (
              candidate.id && candidate.name && candidate.email ? 
              <CandidateCard key={candidate.id} candidate={candidate} />
              : null
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No recent candidates to display. Try uploading a resume.</p>
        )}
      </div>

    </div>
  );
}
