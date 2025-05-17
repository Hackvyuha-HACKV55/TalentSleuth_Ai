
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Mail, Star, ArrowRight, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import type { UnifiedCandidate } from "@/lib/mock-data"; 
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useCandidateContext } from "@/context/candidate-context";
// import { useToast } from "@/hooks/use-toast"; // Toast is handled by context now
import { useState } from "react";

export type Candidate = UnifiedCandidate;

interface CandidateCardProps {
  candidate: Candidate;
}

export function CandidateCard({ candidate }: CandidateCardProps) {
  const { deleteCandidate } = useCandidateContext();
  // const { toast } = useToast(); // Toast messages for delete success/failure are now in CandidateContext
  const [isDeleting, setIsDeleting] = useState(false);


  const getInitials = (name?: string | null) => {
    if (!name) return "??";
    const names = name.split(' ');
    if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
    return names[0][0].toUpperCase() + names[names.length - 1][0].toUpperCase();
  }

  const handleDelete = async () => {
    if (candidate.id) {
      setIsDeleting(true);
      await deleteCandidate(candidate.id);
      // Toast message is handled by the context after successful Firestore deletion
      setIsDeleting(false); 
      // No need to close dialog explicitly, AlertDialogAction does this
    }
  };

  const displayName = candidate.name || "Unnamed Candidate";
  const displayEmail = candidate.email || "No email";
  const displayRole = candidate.role || "Role not specified";
  const displayTopSkill = candidate.topSkill || "Skill not specified";

  return (
    <Card className="rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-3">
        <Avatar className="h-12 w-12 border-2 border-primary">
          <AvatarImage src={candidate.avatarUrl || `https://placehold.co/80x80.png?text=${getInitials(displayName)}`} alt={displayName} data-ai-hint="person professional" />
          <AvatarFallback className="bg-muted text-primary font-semibold">{getInitials(displayName)}</AvatarFallback>
        </Avatar>
        <div className="grid gap-1 flex-grow overflow-hidden"> {/* Added overflow-hidden here */}
          <CardTitle className="text-xl text-foreground truncate">{displayName}</CardTitle>
          <CardDescription className="text-sm text-muted-foreground truncate">{displayRole}</CardDescription>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0" disabled={!candidate.id || isDeleting}>
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the candidate
                <span className="font-semibold"> {displayName}</span> from the database.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90" disabled={isDeleting}>
                {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardHeader>
      <CardContent className="grid gap-3 flex-grow pt-0">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground overflow-hidden">
          <Mail className="h-4 w-4 shrink-0" />
          <span className="truncate">{displayEmail}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Briefcase className="h-4 w-4 shrink-0" />
          <span>Top Skill: <Badge variant="secondary" className="ml-1">{displayTopSkill}</Badge></span>
        </div>
        {candidate.fitScore !== undefined && candidate.fitScore !== null && (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Star className="h-4 w-4 text-accent shrink-0" />
            <span>
              Fit Score: <span className="font-semibold text-accent">{candidate.fitScore}%</span>
            </span>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg" disabled={!candidate.id}>
          <Link href={`/dashboard/candidates/${candidate.id}`}>
            View Profile <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
