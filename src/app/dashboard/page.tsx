
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { ArrowRight, FileUp, ClipboardList, Users, BarChartBig } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { CandidateCard } from "@/components/domain/candidate-card";
import { unifiedMockCandidates, type UnifiedCandidate } from "@/lib/mock-data"; // Import unified mock data

export default function DashboardOverviewPage() {
  const { user } = useAuth();

  // Take first 3 candidates from the unified list for display
  const recentCandidates: UnifiedCandidate[] = unifiedMockCandidates.slice(0, 3);

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
            {/* Use length of unifiedMockCandidates for a more "connected" count */}
            <div className="text-2xl font-bold text-foreground">{unifiedMockCandidates.length}</div>
            <p className="text-xs text-muted-foreground">+2 from initial mock</p> 
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary">Job Descriptions</CardTitle>
            <ClipboardList className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">56</div> {/* Static for now */}
            <p className="text-xs text-muted-foreground">+5 since last week</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary">Average Fit Score</CardTitle>
            <BarChartBig className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {/* Calculate average fit score from unified data */}
              {(() => {
                const scoredCandidates = unifiedMockCandidates.filter(c => c.fitScore !== undefined);
                if (scoredCandidates.length === 0) return "N/A";
                const avg = scoredCandidates.reduce((sum, c) => sum + (c.fitScore!), 0) / scoredCandidates.length;
                return `${Math.round(avg)}%`;
              })()}
            </div>
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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {recentCandidates.map(candidate => (
            <CandidateCard key={candidate.id} candidate={candidate} />
          ))}
        </div>
      </div>

    </div>
  );
}
