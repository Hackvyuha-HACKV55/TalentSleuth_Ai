
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { ArrowRight, FileUp, ClipboardList, Users, BarChartBig, Loader2 } from "lucide-react";
import Link from "next/link";
import { CandidateCard } from "@/components/domain/candidate-card";
import { useCandidateContext } from "@/context/candidate-context"; 
import type { UnifiedCandidate } from "@/context/candidate-context"; // Updated import

export default function DashboardOverviewPage() {
  const { user } = useAuth();
  const { candidates, loadingCandidates } = useCandidateContext(); 

  // Sort candidates by createdAt or updatedAt for "recent" to be more meaningful, descending
  const recentCandidates: UnifiedCandidate[] = [...candidates]
    .sort((a, b) => {
      const dateA = a.updatedAt?.toMillis() || a.createdAt?.toMillis() || 0;
      const dateB = b.updatedAt?.toMillis() || b.createdAt?.toMillis() || 0;
      return dateB - dateA;
    })
    .slice(0, 3); 

  return (
    <div className="space-y-8 w-full max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Welcome back, {user?.displayName || user?.email?.split('@')[0] || "User"}!
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s an overview of your talent acquisition pipeline.
          </p>
        </div>
        <div className="flex gap-3">
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
              <div className="text-3xl font-bold text-foreground">{candidates.length}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">In your talent pool</p> 
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary">Job Descriptions</CardTitle>
            <ClipboardList className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {/* This should ideally come from Firestore jobRequisitions collection count */}
            <div className="text-3xl font-bold text-foreground">N/A</div> 
            <p className="text-xs text-muted-foreground mt-1">Active job postings</p>
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
              <div className="text-3xl font-bold text-foreground">
                {(() => {
                  const scoredCandidates = candidates.filter(c => typeof c.fitScore === 'number');
                  if (scoredCandidates.length === 0) return "N/A";
                  const avg = scoredCandidates.reduce((sum, c) => sum + (c.fitScore!), 0) / scoredCandidates.length;
                  return `${Math.round(avg)}%`;
                })()}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Across all matched roles</p>
          </CardContent>
        </Card>
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Recent Candidates</h2>
          <Button variant="link" asChild className="text-primary hover:text-primary/80">
            <Link href="/dashboard/candidates">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        {loadingCandidates ? (
          <div className="flex items-center justify-center py-10">
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
          <p className="text-muted-foreground text-center py-6">No recent candidates to display. Try uploading a resume.</p>
        )}
      </div>

    </div>
  );
}
