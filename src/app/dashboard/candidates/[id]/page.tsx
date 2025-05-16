
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { profileDiscovery, type ProfileDiscoveryOutput } from "@/ai/flows/profile-discovery";
import { redFlagDetection, type DetectRedFlagsOutput } from "@/ai/flows/red-flag-detection";
import { parseResume, type ParseResumeOutput } from "@/ai/flows/resume-parsing"; // For initial parsed data
import { useEffect, useState } from "react";
import { Loader2, User, Mail, Phone, BookOpen, Briefcase, Award, Sparkles, Search, AlertTriangle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

// Mock candidate data, in a real app this would come from a database
const mockCandidateData: { [key: string]: Partial<ParseResumeOutput> & { id: string, role?: string, avatarUrl?: string, resumeTextContent: string } } = {
  "1": { 
    id: "1", 
    name: "Alice Wonderland", 
    email: "alice@example.com", 
    phone: "123-456-7890",
    education: "M.S. in AI, Wonderland University",
    experience: "5 years as AI Engineer at Mad Hatter Inc.",
    skills: "Python, TensorFlow, PyTorch, NLP, Computer Vision",
    certifications: "Certified AI Professional",
    role: "Senior AI Engineer", 
    avatarUrl: "https://placehold.co/120x120.png?text=AW",
    resumeTextContent: "Alice Wonderland\nalice@example.com\n123-456-7890\nEducation: M.S. in AI, Wonderland University\nExperience: 5 years as AI Engineer at Mad Hatter Inc. Developed several NLP models.\nSkills: Python, TensorFlow, PyTorch, NLP, Computer Vision\nCertifications: Certified AI Professional"
  },
   "2": {
    id: "2",
    name: "Bob The Builder",
    email: "bob@example.com",
    phone: "234-567-8901",
    education: "B.S. in Construction Management, Builder's College",
    experience: "10 years as Lead Project Manager at FixIt Felix Jr. Co.",
    skills: "Agile, Scrum, Risk Management, Budgeting, Team Leadership",
    certifications: "PMP Certified",
    role: "Lead Project Manager",
    avatarUrl: "https://placehold.co/120x120.png?text=BB",
    resumeTextContent: "Bob The Builder\nbob@example.com\n234-567-8901\nEducation: B.S. in Construction Management, Builder's College\nExperience: 10 years as Lead Project Manager at FixIt Felix Jr. Co. Managed projects up to $10M.\nSkills: Agile, Scrum, Risk Management, Budgeting, Team Leadership\nCertifications: PMP Certified",
  },
   "3": {
    id: "3",
    name: "Charlie Brown",
    email: "charlie@example.com",
    phone: "345-678-9012",
    education: "B.F.A in Graphic Design, Peanuts Art School",
    experience: "3 years as UX Designer at Good Grief Graphics",
    skills: "Figma, Sketch, Adobe XD, User Research, Prototyping",
    role: "Principal UX Designer",
    avatarUrl: "https://placehold.co/120x120.png?text=CB",
    resumeTextContent: "Charlie Brown\ncharlie@example.com\n345-678-9012\nEducation: B.F.A in Graphic Design, Peanuts Art School\nExperience: 3 years as UX Designer at Good Grief Graphics. Redesigned kite-flying app.\nSkills: Figma, Sketch, Adobe XD, User Research, Prototyping",
  },
};


interface CandidateProfilePageProps {
  params: { id: string };
}

export default function CandidateProfilePage({ params }: CandidateProfilePageProps) {
  const candidateId = params.id;
  const candidate = mockCandidateData[candidateId];

  const [profileDiscoveryResult, setProfileDiscoveryResult] = useState<ProfileDiscoveryOutput | null>(null);
  const [redFlagResult, setRedFlagResult] = useState<DetectRedFlagsOutput | null>(null);
  const [isLoadingDiscovery, setIsLoadingDiscovery] = useState(false);
  const [isLoadingRedFlags, setIsLoadingRedFlags] = useState(false);
  const { toast } = useToast();

  const getInitials = (name?: string | null) => {
    if (!name) return "??";
    const names = name.split(' ');
    if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
    return names[0][0].toUpperCase() + names[names.length - 1][0].toUpperCase();
  }

  const runProfileDiscovery = async () => {
    if (!candidate?.name || !candidate?.email) {
      toast({ title: "Missing candidate data for discovery.", variant: "destructive" });
      return;
    }
    setIsLoadingDiscovery(true);
    try {
      const result = await profileDiscovery({ name: candidate.name, email: candidate.email });
      setProfileDiscoveryResult(result);
      toast({ title: "Profile Discovery Complete" });
    } catch (error) {
      toast({ title: "Profile Discovery Failed", description: String(error), variant: "destructive" });
    } finally {
      setIsLoadingDiscovery(false);
    }
  };

  const runRedFlagDetection = async () => {
    if (!candidate?.resumeTextContent || !profileDiscoveryResult?.summary) {
       toast({ title: "Missing data for red flag detection.", description: "Ensure resume and profile discovery are available.", variant: "destructive" });
      return;
    }
    setIsLoadingRedFlags(true);
    try {
      const result = await redFlagDetection({ 
        resumeText: candidate.resumeTextContent, 
        profileData: profileDiscoveryResult.summary 
      });
      setRedFlagResult(result);
      toast({ title: "Red Flag Detection Complete" });
    } catch (error) {
      toast({ title: "Red Flag Detection Failed", description: String(error), variant: "destructive" });
    } finally {
      setIsLoadingRedFlags(false);
    }
  };
  
  // Section for displaying parsed resume details
  const ResumeDetailItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value?: string | null }) => {
    if (!value) return null;
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


  if (!candidate) {
    return <div className="text-center py-10">Candidate not found.</div>;
  }

  return (
    <div className="space-y-8">
      <Card className="rounded-2xl shadow-xl overflow-hidden">
        <CardHeader className="bg-secondary/50 p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-primary shadow-lg">
              <AvatarImage src={candidate.avatarUrl} alt={candidate.name} data-ai-hint="person professional portrait" />
              <AvatarFallback className="text-4xl bg-muted text-primary font-semibold">{getInitials(candidate.name)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-3xl md:text-4xl font-bold text-primary">{candidate.name}</CardTitle>
              {candidate.role && <CardDescription className="text-lg text-muted-foreground mt-1">{candidate.role}</CardDescription>}
              <div className="mt-3 space-y-1 text-sm text-foreground">
                {candidate.email && <p className="flex items-center"><Mail className="mr-2 h-4 w-4 text-muted-foreground" /> {candidate.email}</p>}
                {candidate.phone && <p className="flex items-center"><Phone className="mr-2 h-4 w-4 text-muted-foreground" /> {candidate.phone}</p>}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          
          {/* Parsed Resume Details Section */}
          <Card className="rounded-lg shadow-md">
            <CardHeader>
                <CardTitle className="text-xl text-primary flex items-center"><FileText className="mr-2 h-5 w-5" /> Parsed Resume Details</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border/60">
                <ResumeDetailItem icon={BookOpen} label="Education" value={candidate.education} />
                <ResumeDetailItem icon={Briefcase} label="Experience" value={candidate.experience} />
                <ResumeDetailItem icon={Sparkles} label="Skills" value={candidate.skills} />
                <ResumeDetailItem icon={Award} label="Certifications" value={candidate.certifications} />
            </CardContent>
          </Card>
          
          <Separator />

          {/* Profile Discovery Section */}
          <Card className="rounded-lg shadow-md">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl text-primary flex items-center"><Search className="mr-2 h-5 w-5" /> Online Profile Discovery</CardTitle>
                <Button onClick={runProfileDiscovery} disabled={isLoadingDiscovery} size="sm" variant="outline" className="rounded-lg">
                  {isLoadingDiscovery ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                  {isLoadingDiscovery ? "Searching..." : "Run Discovery"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingDiscovery && <p className="text-muted-foreground">Searching online profiles...</p>}
              {profileDiscoveryResult && (
                <div className="p-4 bg-secondary rounded-md">
                  <h4 className="font-semibold text-foreground mb-1">AI Summary:</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{profileDiscoveryResult.summary}</p>
                </div>
              )}
              {!isLoadingDiscovery && !profileDiscoveryResult && <p className="text-sm text-muted-foreground">Click &quot;Run Discovery&quot; to fetch and summarize online profile data.</p>}
            </CardContent>
          </Card>

          <Separator />

          {/* Red Flag Detection Section */}
          <Card className="rounded-lg shadow-md">
             <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl text-primary flex items-center"><AlertTriangle className="mr-2 h-5 w-5" /> Red Flag Detection</CardTitle>
                 <Button onClick={runRedFlagDetection} disabled={isLoadingRedFlags || !profileDiscoveryResult} size="sm" variant="outline" className="rounded-lg">
                  {isLoadingRedFlags ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <AlertTriangle className="mr-2 h-4 w-4" />}
                  {isLoadingRedFlags ? "Analyzing..." : "Detect Flags"}
                </Button>
              </div>
              {!profileDiscoveryResult && <CardDescription className="text-xs text-amber-600">Run Profile Discovery first to enable Red Flag Detection.</CardDescription>}
            </CardHeader>
            <CardContent>
              {isLoadingRedFlags && <p className="text-muted-foreground">Analyzing for red flags...</p>}
              {redFlagResult && (
                 <div className={`p-4 rounded-md ${redFlagResult.flagged ? 'bg-destructive/10 border border-destructive' : 'bg-green-500/10 border border-green-500'}`}>
                  <h4 className={`font-semibold mb-1 ${redFlagResult.flagged ? 'text-destructive' : 'text-green-600'}`}>
                    {redFlagResult.flagged ? "Red Flags Detected!" : "No Significant Red Flags Detected"}
                  </h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{redFlagResult.inconsistencies}</p>
                </div>
              )}
              {!isLoadingRedFlags && !redFlagResult && <p className="text-sm text-muted-foreground">Click &quot;Detect Flags&quot; to analyze resume against profile data.</p>}
            </CardContent>
          </Card>

        </CardContent>
      </Card>
    </div>
  );
}
