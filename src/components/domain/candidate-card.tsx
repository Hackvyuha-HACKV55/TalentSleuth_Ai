
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Mail, Star, ArrowRight, Trash2 } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";

export type Candidate = UnifiedCandidate;

interface CandidateCardProps {
  candidate: Candidate;
}

export function CandidateCard({ candidate }: CandidateCardProps) {
  const { deleteCandidate } = useCandidateContext();
  const { toast } = useToast();

  const getInitials = (name?: string | null) => {
    if (!name) return "??";
    const names = name.split(' ');
    if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
    return names[0][0].toUpperCase() + names[names.length - 1][0].toUpperCase();
  }

  const handleDelete = () => {
    if (candidate.id) {
      deleteCandidate(candidate.id);
      toast({
        title: "Candidate Deleted",
        description: `${candidate.name || "The candidate"} has been removed from the list.`,
      });
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
        <div className="grid gap-1 flex-grow">
          <CardTitle className="text-xl text-foreground">{displayName}</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">{displayRole}</CardDescription>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" disabled={!candidate.id}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the candidate
                <span className="font-semibold"> {displayName}</span> and remove their data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardHeader>
      <CardContent className="grid gap-3 flex-grow pt-0">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Mail className="h-4 w-4" />
          <span>{displayEmail}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Briefcase className="h-4 w-4" />
          <span>Top Skill: <Badge variant="secondary" className="ml-1">{displayTopSkill}</Badge></span>
        </div>
        {candidate.fitScore !== undefined && candidate.fitScore !== null && (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Star className="h-4 w-4 text-accent" />
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
