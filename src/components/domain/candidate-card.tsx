
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Mail, Star, ArrowRight } from "lucide-react";
import Link from "next/link";

export interface Candidate {
  id: string;
  name: string;
  email: string;
  topSkill: string;
  fitScore?: number;
  avatarUrl?: string;
  role?: string;
}

interface CandidateCardProps {
  candidate: Candidate;
}

export function CandidateCard({ candidate }: CandidateCardProps) {
  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
    return names[0][0].toUpperCase() + names[names.length - 1][0].toUpperCase();
  }

  return (
    <Card className="rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      <CardHeader className="flex flex-row items-start gap-4 space-y-0">
        <Avatar className="h-12 w-12 border-2 border-primary">
          <AvatarImage src={candidate.avatarUrl} alt={candidate.name} data-ai-hint="person professional" />
          <AvatarFallback className="bg-muted text-primary font-semibold">{getInitials(candidate.name)}</AvatarFallback>
        </Avatar>
        <div className="grid gap-1">
          <CardTitle className="text-xl text-foreground">{candidate.name}</CardTitle>
          {candidate.role && <CardDescription className="text-sm text-muted-foreground">{candidate.role}</CardDescription>}
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 flex-grow">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Mail className="h-4 w-4" />
          <span>{candidate.email}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Briefcase className="h-4 w-4" />
          <span>Top Skill: <Badge variant="secondary" className="ml-1">{candidate.topSkill}</Badge></span>
        </div>
        {candidate.fitScore && (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Star className="h-4 w-4 text-accent" />
            <span>
              Fit Score: <span className="font-semibold text-accent">{candidate.fitScore}%</span>
            </span>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg">
          <Link href={`/dashboard/candidates/${candidate.id}`}>
            View Profile <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
