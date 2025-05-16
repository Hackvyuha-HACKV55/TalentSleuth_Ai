
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { roleMatching, type RoleMatchingOutput } from "@/ai/flows/role-matching";
import { useState } from "react";
import { ScoreCard } from "./score-card";
import { Loader2, CheckSquare, Search, Brain } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { unifiedMockCandidates, type UnifiedCandidate } from "@/lib/mock-data"; // Import unified mock data

export function JobDescriptionUploader() {
  const [jobDescription, setJobDescription] = useState("");
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [matchResult, setMatchResult] = useState<RoleMatchingOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Use unified mock candidates for selection
  const candidatesForSelection: UnifiedCandidate[] = unifiedMockCandidates;

  const handleMatchRole = async () => {
    if (!jobDescription) {
      toast({
        title: "Missing Job Description",
        description: "Please enter the job description text.",
        variant: "destructive",
      });
      return;
    }
    if (!selectedCandidateId) {
      toast({
        title: "No Candidate Selected",
        description: "Please select a candidate resume to match against.",
        variant: "destructive",
      });
      return;
    }
    
    const selectedCandidate = candidatesForSelection.find(c => c.id === selectedCandidateId);
    if (!selectedCandidate || !selectedCandidate.resumeTextContent) { // Ensure resumeTextContent exists
        toast({ title: "Error", description: "Selected candidate not found or missing resume text.", variant: "destructive" });
        return;
    }

    setIsLoading(true);
    setMatchResult(null);

    try {
      const result = await roleMatching({
        resumeText: selectedCandidate.resumeTextContent, // Use resumeTextContent
        jobDescriptionText: jobDescription,
      });
      setMatchResult(result);
      toast({
        title: "Role Matching Complete",
        description: `Fitment score for ${selectedCandidate.name} calculated.`,
        variant: "default",
      });
    } catch (error) {
      console.error("Error matching role:", error);
      toast({
        title: "Error Matching Role",
        description: "An error occurred during role matching. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full rounded-2xl shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl text-primary flex items-center">
         <Brain className="mr-2 h-6 w-6" /> AI Role Matcher
        </CardTitle>
        <CardDescription>
          Paste a job description and select a candidate&apos;s resume to get an AI-powered fitment score and justification.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="job-description" className="text-md font-medium text-foreground">Job Description</Label>
          <Textarea
            id="job-description"
            placeholder="Paste the full job description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={10}
            className="mt-2 rounded-lg"
          />
        </div>
        
        <div>
          <Label htmlFor="candidate-select" className="text-md font-medium text-foreground">Select Candidate Resume</Label>
           <Select onValueChange={setSelectedCandidateId} value={selectedCandidateId || undefined}>
            <SelectTrigger id="candidate-select" className="w-full mt-2 rounded-lg">
              <SelectValue placeholder="Choose a candidate's resume..." />
            </SelectTrigger>
            <SelectContent>
              {candidatesForSelection.map((candidate) => (
                <SelectItem key={candidate.id} value={candidate.id}>
                  {candidate.name} ({candidate.role || 'No role specified'})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleMatchRole} disabled={isLoading || !jobDescription || !selectedCandidateId} className="w-full rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Search className="mr-2 h-4 w-4" />
          )}
          {isLoading ? "Matching..." : "Match Role"}
        </Button>

        {matchResult && (
          <div className="mt-6">
            <ScoreCard
              score={matchResult.fitmentScore}
              title="Role Fitment Analysis"
              description={`Analysis for ${candidatesForSelection.find(c => c.id === selectedCandidateId)?.name || 'selected candidate'}`}
              justification={matchResult.justification}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
