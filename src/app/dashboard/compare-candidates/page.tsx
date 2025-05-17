
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCandidateContext } from "@/context/candidate-context";
import { ArrowRight, Loader2, UsersRound, Columns } from "lucide-react";
import Link from "next/link";
import type { UnifiedCandidate } from "@/context/candidate-context";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";


export default function CompareCandidatesPage() {
  const { candidates, loadingCandidates } = useCandidateContext();

  const getInitials = (name?: string | null) => {
    if (!name) return "??";
    const names = name.split(' ');
    if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
    return names[0][0].toUpperCase() + names[names.length - 1][0].toUpperCase();
  };

  return (
    <div className="space-y-8 w-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
          <Columns className="mr-3 h-8 w-8 text-primary" />
          Compare Candidates
        </h1>
        <p className="text-muted-foreground">
          View key details of all candidates side-by-side for easier comparison.
        </p>
      </div>

      <Card className="rounded-lg shadow-lg bg-card border">
        <CardHeader className="p-6">
          <CardTitle>Candidate Comparison Table</CardTitle>
          <CardDescription>
            Scroll horizontally to see all details if needed.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 md:p-6">
          {loadingCandidates ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
              <p className="text-lg text-muted-foreground">Loading candidates...</p>
            </div>
          ) : candidates.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border bg-card">
              <Table>
                <TableHeader className="bg-card/50">
                  <TableRow>
                    <TableHead className="w-[80px]">Avatar</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Top Skill</TableHead>
                    <TableHead className="text-center">Fit Score</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {candidates.map((candidate: UnifiedCandidate) => (
                    candidate.id && candidate.name && candidate.email ? (
                    <TableRow key={candidate.id} className="hover:bg-muted/30">
                      <TableCell>
                        <Avatar className="h-10 w-10 border">
                          <AvatarImage src={candidate.avatarUrl || `https://placehold.co/60x60.png?text=${getInitials(candidate.name)}`} alt={candidate.name || "Candidate"} data-ai-hint="person professional" />
                          <AvatarFallback className="bg-muted text-primary font-semibold">{getInitials(candidate.name)}</AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-medium text-foreground whitespace-nowrap">{candidate.name}</TableCell>
                      <TableCell className="text-muted-foreground whitespace-nowrap">{candidate.role || "N/A"}</TableCell>
                      <TableCell className="text-muted-foreground truncate max-w-xs">{candidate.email}</TableCell>
                      <TableCell>
                        {candidate.topSkill ? (
                          <Badge variant="secondary" className="whitespace-nowrap">{candidate.topSkill}</Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">N/A</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        {candidate.fitScore !== undefined && candidate.fitScore !== null
                          ? `${candidate.fitScore}%`
                          : <span className="text-muted-foreground text-xs">N/A</span>}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="outline" size="sm" className="rounded-md whitespace-nowrap">
                          <Link href={`/dashboard/candidates/${candidate.id}`}>
                            View Profile <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                    ) : null
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg shadow-sm bg-card p-6">
              <UsersRound className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-xl text-muted-foreground">No candidates found.</p>
              <p className="text-sm text-muted-foreground">
                Upload resumes to start building your talent pool.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
