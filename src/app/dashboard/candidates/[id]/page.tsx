
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { profileDiscovery, type ProfileDiscoveryOutput } from "@/ai/flows/profile-discovery";
import { detectRedFlags, type DetectRedFlagsOutput } from "@/ai/flows/red-flag-detection";
import { analyzeSentiment, type SentimentAnalysisOutput } from "@/ai/flows/sentiment-analysis";
import { use, useState, useEffect, useCallback } from "react";
import { Loader2, User, Mail, Phone, BookOpen, Briefcase, Award, Sparkles, Search, AlertTriangle, FileText, MessageCircleMore, ThumbsUp, ThumbsDown, Meh } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCandidateContext } from "@/context/candidate-context";
import type { UnifiedCandidate } from "@/context/candidate-context";

interface CandidateProfilePageProps {
  params: Promise<{ id: string }>;
}

export default function CandidateProfilePage({ params }: CandidateProfilePageProps) {
  const { id: candidateId } = use(params);
  const { getCandidateById } = useCandidateContext();
  const candidate = getCandidateById(candidateId);

  const [profileDiscoveryResult, setProfileDiscoveryResult] = useState<ProfileDiscoveryOutput | null>(null);
  const [redFlagResult, setRedFlagResult] = useState<DetectRedFlagsOutput | null>(null);
  const [isLoadingDiscovery, setIsLoadingDiscovery] = useState(false);
  const [isLoadingRedFlags, setIsLoadingRedFlags] = useState(false);
  const [hasProfileLinks, setHasProfileLinks] = useState(false);
  const [isAutoAnalysisDone, setIsAutoAnalysisDone] = useState(false);


  const [endorsementText, setEndorsementText] = useState("");
  const [sentimentResult, setSentimentResult] = useState<SentimentAnalysisOutput | null>(null);
  const [isLoadingSentiment, setIsLoadingSentiment] = useState(false);

  const { toast } = useToast();

  // Effect to check for profile links in resume content
  useEffect(() => {
    if (candidate?.resumeTextContent) {
      const content = candidate.resumeTextContent.toLowerCase();
      if (content.includes('linkedin.com') || content.includes('github.com') || content.includes('naukri.com')) {
        setHasProfileLinks(true);
      } else {
        setHasProfileLinks(false);
      }
      setIsAutoAnalysisDone(false); // Reset for new candidate or if resume content changes
      setProfileDiscoveryResult(null); // Reset AI results when candidate changes
      setRedFlagResult(null);
    } else {
      setHasProfileLinks(false);
      setIsAutoAnalysisDone(false);
      setProfileDiscoveryResult(null);
      setRedFlagResult(null);
    }
  }, [candidate?.resumeTextContent, candidate?.id]); // Added candidate.id to re-trigger if different candidate loads with same resume text (edge case)

  const runRedFlagDetection = useCallback(async (currentResumeText?: string, currentProfileSummary?: string) => {
    const resumeTextToUse = currentResumeText || candidate?.resumeTextContent;
    const profileSummaryToUse = currentProfileSummary || profileDiscoveryResult?.summary;

    if (!resumeTextToUse) {
        if (!currentResumeText) { 
            toast({ title: "Missing Resume Data", description: "Resume text content is needed for red flag detection.", variant: "destructive" });
        }
        return;
    }
    if (!profileSummaryToUse) {
         if (!currentProfileSummary) { 
            toast({ title: "Profile Discovery Needed", description: "Profile Discovery results are needed for Red Flag Detection.", variant: "destructive" });
         }
        return;
    }
    setIsLoadingRedFlags(true);
    setRedFlagResult(null); 
    try {
      const result = await detectRedFlags({
        resumeText: resumeTextToUse,
        profileData: profileSummaryToUse
      });
      setRedFlagResult(result);
      toast({ title: "Red Flag Detection Complete" });
    } catch (error) {
      toast({ title: "Red Flag Detection Failed", description: String(error), variant: "destructive" });
    } finally {
      setIsLoadingRedFlags(false);
    }
  }, [candidate?.resumeTextContent, profileDiscoveryResult?.summary, toast]);

  const runProfileDiscovery = useCallback(async () => {
    if (!candidate?.name || !candidate?.email) {
      toast({ title: "Missing candidate data for discovery.", variant: "destructive" });
      return;
    }
    setIsLoadingDiscovery(true);
    setProfileDiscoveryResult(null); 
    setRedFlagResult(null); 
    try {
      const discoveryResult = await profileDiscovery({ name: candidate.name, email: candidate.email });
      setProfileDiscoveryResult(discoveryResult);
      toast({ title: "Profile Discovery Complete" });

      if (candidate.resumeTextContent && discoveryResult?.summary) {
        await runRedFlagDetection(candidate.resumeTextContent, discoveryResult.summary);
      }
    } catch (error) {
      toast({ title: "Profile Discovery Failed", description: String(error), variant: "destructive" });
    } finally {
      setIsLoadingDiscovery(false);
    }
  }, [candidate, toast, runRedFlagDetection]);

  // Effect for automatic AI insights run
  useEffect(() => {
    if (candidate && candidate.resumeTextContent && hasProfileLinks && !isAutoAnalysisDone && !isLoadingDiscovery && !profileDiscoveryResult) {
      runProfileDiscovery();
      setIsAutoAnalysisDone(true); 
    }
  }, [candidate, hasProfileLinks, runProfileDiscovery, isAutoAnalysisDone, isLoadingDiscovery, profileDiscoveryResult]);


  const runSentimentAnalysis = async () => {
    if (!endorsementText.trim()) {
      toast({ title: "Empty Text", description: "Please enter some text to analyze.", variant: "destructive" });
      return;
    }
    setIsLoadingSentiment(true);
    setSentimentResult(null);
    try {
      const result = await analyzeSentiment({ textToAnalyze: endorsementText });
      setSentimentResult(result);
      toast({ title: "Sentiment Analysis Complete" });
    } catch (error) {
      toast({ title: "Sentiment Analysis Failed", description: String(error), variant: "destructive" });
    } finally {
      setIsLoadingSentiment(false);
    }
  };

  const ResumeDetailItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value?: string | null }) => {
    if (!value || value.trim() === "" || value.toLowerCase() === "not found" || value.toLowerCase() === "n/a" ) return null;
    return (
      <div className="flex items-start space-x-3 py-3">
        <Icon className="h-5 w-5 text-primary mt-1 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-muted-foreground">{label}</p>
          <p className="text-md text-foreground whitespace-pre-wrap">{value}</p>
        </div>
      </div>
    );
  };

  const SentimentIcon = ({ sentiment }: { sentiment?: "Positive" | "Negative" | "Neutral" }) => {
    if (sentiment === "Positive") return <ThumbsUp className="mr-2 h-5 w-5 text-green-500" />;
    if (sentiment === "Negative") return <ThumbsDown className="mr-2 h-5 w-5 text-red-500" />;
    if (sentiment === "Neutral") return <Meh className="mr-2 h-5 w-5 text-yellow-500" />;
    return null;
  };

  const getInitials = (name?: string | null) => {
    if (!name) return "??";
    const names = name.split(' ');
    if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
    return names[0][0].toUpperCase() + names[names.length - 1][0].toUpperCase();
  }

  if (!candidate) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] py-6">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-xl text-muted-foreground">Loading candidate details...</p>
        <p className="text-sm text-muted-foreground">If this persists, the candidate may not exist or there might be an issue.</p>
      </div>
    );
  }

  const displayName = candidate.name || "N/A";
  const displayRole = candidate.role || "Role not specified";
  const displayEmail = candidate.email || "Email not available";
  const displayPhone = candidate.phone || "Phone not available";

  // Manual trigger handlers
  const handleManualDiscovery = () => {
    setIsAutoAnalysisDone(true); // Prevent auto-run from conflicting if manual is clicked
    runProfileDiscovery();
  };

  const handleManualRedFlagDetection = () => {
    runRedFlagDetection(); // Will use existing candidate and profileDiscoveryResult state
  };


  return (
    <div className="space-y-8 w-full max-w-5xl mx-auto py-6">
      <Card className="rounded-2xl shadow-xl overflow-hidden bg-card border hover:shadow-2xl transition-shadow duration-300">
        <CardHeader className="bg-card/50 p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-primary shadow-lg">
              <AvatarImage src={candidate.avatarUrl?.replace('80x80', '120x120') || `https://placehold.co/120x120.png?text=${getInitials(displayName)}`} alt={displayName} data-ai-hint="person professional portrait"/>
              <AvatarFallback className="text-4xl bg-muted text-primary font-semibold">{getInitials(displayName)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-3xl md:text-4xl font-bold text-primary">{displayName}</CardTitle>
              <CardDescription className="text-lg text-muted-foreground mt-1">{displayRole}</CardDescription>
              <div className="mt-3 space-y-1 text-sm text-foreground">
                <p className="flex items-center"><Mail className="mr-2 h-4 w-4 text-muted-foreground" /> {displayEmail}</p>
                <p className="flex items-center"><Phone className="mr-2 h-4 w-4 text-muted-foreground" /> {displayPhone}</p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">

          <Card className="rounded-lg shadow-lg bg-card border hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="p-6">
                <CardTitle className="text-xl text-primary flex items-center"><FileText className="mr-2 h-5 w-5" /> Parsed Resume Details</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border/60 p-6 pt-0">
                <ResumeDetailItem icon={User} label="Name" value={candidate.name} />
                <ResumeDetailItem icon={Mail} label="Email" value={candidate.email} />
                <ResumeDetailItem icon={Phone} label="Phone" value={candidate.phone} />
                <ResumeDetailItem icon={BookOpen} label="Education" value={candidate.education} />
                <ResumeDetailItem icon={Briefcase} label="Experience" value={candidate.experience} />
                <ResumeDetailItem icon={Sparkles} label="Skills" value={candidate.skills} />
                <ResumeDetailItem icon={Award} label="Certifications" value={candidate.certifications} />
            </CardContent>
          </Card>

          <Separator />

          <Card className="rounded-lg shadow-lg bg-card border hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="p-6">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl text-primary flex items-center"><Search className="mr-2 h-5 w-5" /> Online Profile Discovery</CardTitle>
                <Button onClick={handleManualDiscovery} disabled={isLoadingDiscovery} size="sm" variant="outline" className="rounded-lg">
                  {isLoadingDiscovery ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                  {isLoadingDiscovery ? "Running..." : "Run Discovery"}
                </Button>
              </div>
               <CardDescription className="text-xs text-muted-foreground mt-1">
                AI (simulates) searching LinkedIn, GitHub, Naukri, etc. based on resume info (especially if links/keywords are present) or name/email.
                {hasProfileLinks && " Platform keywords detected in resume, auto-discovery attempted on load."}
                {!hasProfileLinks && " No specific platform links/keywords detected in resume; discovery uses name/email."}
               </CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              {isLoadingDiscovery && !profileDiscoveryResult && <div className="flex items-center text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Searching online profiles (simulated)...</div>}
              {profileDiscoveryResult && (
                <div className="p-4 bg-card/80 rounded-md border">
                  <h4 className="font-semibold text-foreground mb-1">AI Summary:</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{profileDiscoveryResult.summary}</p>
                </div>
              )}
              {!isLoadingDiscovery && !profileDiscoveryResult &&
                <p className="text-sm text-muted-foreground">Click "Run Discovery" or wait for automatic analysis if profile links are present in the resume.
                </p>
              }
            </CardContent>
          </Card>

          <Separator />

          <Card className="rounded-lg shadow-lg bg-card border hover:shadow-xl transition-shadow duration-300">
             <CardHeader className="p-6">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl text-primary flex items-center"><AlertTriangle className="mr-2 h-5 w-5" /> Red Flag Detection</CardTitle>
                 <Button onClick={handleManualRedFlagDetection} disabled={isLoadingRedFlags || !profileDiscoveryResult || !candidate.resumeTextContent} size="sm" variant="outline" className="rounded-lg">
                  {isLoadingRedFlags ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <AlertTriangle className="mr-2 h-4 w-4" />}
                  {isLoadingRedFlags ? "Analyzing..." : "Detect Flags"}
                </Button>
              </div>
              <CardDescription className="text-xs text-muted-foreground mt-1">
                Compares resume data against the (simulated) online profile information obtained from "Profile Discovery".
                Analyzes for discrepancies, frequent job changes, and outdated info. Auto-runs after Profile Discovery.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              {isLoadingRedFlags && !redFlagResult && <div className="flex items-center text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing for red flags...</div>}
              {redFlagResult && (
                 <div className={`p-4 rounded-md ${redFlagResult.flagged ? 'bg-destructive/10 border border-destructive' : 'bg-green-500/10 border border-green-500'}`}>
                  <h4 className={`font-semibold mb-1 ${redFlagResult.flagged ? 'text-destructive' : 'text-green-600'}`}>
                    {redFlagResult.flagged ? "Potential Red Flags Detected!" : "No Significant Red Flags Detected"}
                  </h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{redFlagResult.inconsistencies}</p>
                </div>
              )}
              {!isLoadingRedFlags && !redFlagResult && <p className="text-sm text-muted-foreground">Awaiting Profile Discovery results or click "Detect Flags" if discovery is complete.</p>}
            </CardContent>
          </Card>

          <Separator />

          <Card className="rounded-lg shadow-lg bg-card border hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="p-6">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl text-primary flex items-center"><MessageCircleMore className="mr-2 h-5 w-5" /> Sentiment Analysis</CardTitle>
              </div>
              <CardDescription>Analyze the sentiment of an endorsement, review, or any text related to the candidate.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-6 pt-0">
              <div>
                <Label htmlFor="endorsement-text">Text to Analyze</Label>
                <Textarea
                  id="endorsement-text"
                  placeholder="Paste endorsement, review, or other text here..."
                  value={endorsementText}
                  onChange={(e) => setEndorsementText(e.target.value)}
                  rows={4}
                  className="mt-1 rounded-lg"
                />
              </div>
              <Button onClick={runSentimentAnalysis} disabled={isLoadingSentiment || !endorsementText.trim()} size="sm" variant="outline" className="rounded-lg">
                {isLoadingSentiment ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                {isLoadingSentiment ? "Analyzing..." : "Analyze Sentiment"}
              </Button>
              {isLoadingSentiment && <p className="text-sm text-muted-foreground">Analyzing sentiment...</p>}
              {sentimentResult && (
                <div className={`p-4 rounded-md border ${
                  sentimentResult.sentiment === "Positive" ? "bg-green-500/10 border-green-500" :
                  sentimentResult.sentiment === "Negative" ? "bg-destructive/10 border-destructive" :
                  "bg-yellow-500/10 border-yellow-500"
                }`}>
                  <div className="flex items-center mb-2">
                    <SentimentIcon sentiment={sentimentResult.sentiment} />
                    <h4 className={`font-semibold ${
                      sentimentResult.sentiment === "Positive" ? "text-green-700" :
                      sentimentResult.sentiment === "Negative" ? "text-destructive" :
                      "text-yellow-700"
                    }`}>
                      Sentiment: {sentimentResult.sentiment}
                    </h4>
                  </div>
                  {sentimentResult.justification && (
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      <span className="font-medium text-foreground">Justification:</span> {sentimentResult.justification}
                    </p>
                  )}
                </div>
              )}
              {!isLoadingSentiment && !sentimentResult && <p className="text-sm text-muted-foreground">Enter text above and click "Analyze Sentiment".</p>}
            </CardContent>
          </Card>

        </CardContent>
      </Card>
    </div>
  );
}
