
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { ArrowRight, FileUp, ClipboardList, Users, BarChartBig, Loader2 } from "lucide-react";
import Link from "next/link";
import { CandidateCard } from "@/components/domain/candidate-card";
import { useCandidateContext } from "@/context/candidate-context";
import type { UnifiedCandidate } from "@/context/candidate-context";

export default function DashboardOverviewPage() {
  const { user } = useAuth();
  const { candidates, loadingCandidates } = useCandidateContext();

  const recentCandidates: UnifiedCandidate[] = [...candidates]
    .sort((a, b) => {
      const dateA = a.updatedAt?.toMillis() || a.createdAt?.toMillis() || 0;
      const dateB = b.updatedAt?.toMillis() || b.createdAt?.toMillis() || 0;
      return dateB - dateA;
    })
    .slice(0, 3);

  const StatCard = ({ title, value, icon: Icon, description, isLoading }: { title: string; value: string | number; icon: React.ElementType; description: string; isLoading?: boolean }) => (
    <Card className="rounded-lg shadow-lg bg-card border hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-6">
        <CardTitle className="text-sm font-medium text-primary">{title}</CardTitle>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="p-6 pt-0">
        {isLoading ? (
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
        ) : (
          <div className="text-3xl font-bold text-foreground">{value}</div>
        )}
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8 w-full py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Welcome back, {user?.displayName || user?.email?.split('@')[0] || "User"}!
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s an overview of your talent acquisition pipeline.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
           <Button asChild size="lg" className="rounded-lg shadow-sm hover:shadow-md transition-shadow w-full sm:w-auto">
            <Link href="/dashboard/upload-resume">
              <FileUp className="mr-2 h-4 w-4" /> Upload Resume
            </Link>
          </Button>
           <Button asChild size="lg" variant="outline" className="rounded-lg shadow-sm hover:shadow-md transition-shadow w-full sm:w-auto">
            <Link href="/dashboard/upload-jd">
              <ClipboardList className="mr-2 h-4 w-4" /> Upload Job Description
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
            title="Total Candidates"
            value={candidates.length}
            icon={Users}
            description="In your talent pool"
            isLoading={loadingCandidates}
        />
        <StatCard
            title="Job Descriptions"
            value={"N/A"}
            icon={ClipboardList}
            description="Active job postings"
        />
        <StatCard
            title="Average Fit Score"
            value={(() => {
                  const scoredCandidates = candidates.filter(c => typeof c.fitScore === 'number');
                  if (scoredCandidates.length === 0) return "N/A";
                  const avg = scoredCandidates.reduce((sum, c) => sum + (c.fitScore!), 0) / scoredCandidates.length;
                  return `${Math.round(avg)}%`;
                })()}
            icon={BarChartBig}
            description="Across all matched roles"
            isLoading={loadingCandidates}
        />
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
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {recentCandidates.map(candidate => (
              candidate.id && candidate.name && candidate.email ?
              <CandidateCard key={candidate.id} candidate={candidate} />
              : null
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-card rounded-lg shadow-lg border p-6">
            <Users className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-xl text-muted-foreground">No recent candidates to display.</p>
            <p className="text-sm text-muted-foreground">Try uploading a resume.</p>
          </div>
        )}
      </div>
    </div>
  );
}
