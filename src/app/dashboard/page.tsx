
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { ArrowRight, FileUp, ClipboardList, Users, BarChartBig } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { CandidateCard } from "@/components/domain/candidate-card"; // Assuming this component exists

// Mock data for candidate cards
const mockCandidates = [
  { id: "1", name: "Alice Wonderland", email: "alice@example.com", topSkill: "AI Development", fitScore: 85, avatarUrl: "https://placehold.co/40x40.png?text=AW" },
  { id: "2", name: "Bob The Builder", email: "bob@example.com", topSkill: "Project Management", fitScore: 78, avatarUrl: "https://placehold.co/40x40.png?text=BB" },
  { id: "3", name: "Charlie Brown", email: "charlie@example.com", topSkill: "UX Design", fitScore: 92, avatarUrl: "https://placehold.co/40x40.png?text=CB" },
];


export default function DashboardOverviewPage() {
  const { user } = useAuth();

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
            <div className="text-2xl font-bold text-foreground">1,234</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary">Job Descriptions</CardTitle>
            <ClipboardList className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">56</div>
            <p className="text-xs text-muted-foreground">+5 since last week</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary">Average Fit Score</CardTitle>
            <BarChartBig className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">78%</div>
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
          {mockCandidates.map(candidate => (
            <CandidateCard key={candidate.id} candidate={candidate} />
          ))}
        </div>
      </div>

    </div>
  );
}
