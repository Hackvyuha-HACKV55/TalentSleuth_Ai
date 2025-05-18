
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/auth-context";
import { useCandidateContext, type UnifiedCandidate } from "@/context/candidate-context";
import { Loader2, User, Mail, FileText, Download, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export default function StudentProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const { fetchCandidateByUid, loadingCandidates: contextLoading } = useCandidateContext();
  const [candidateProfile, setCandidateProfile] = useState<UnifiedCandidate | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadProfile = async () => {
      if (user && !authLoading) {
        setIsLoadingProfile(true);
        try {
          const profile = await fetchCandidateByUid(user.uid);
          setCandidateProfile(profile);
        } catch (error) {
          console.error("Error fetching student profile:", error);
          toast({
            title: "Error",
            description: "Could not load your profile.",
            variant: "destructive",
          });
        } finally {
          setIsLoadingProfile(false);
        }
      } else if (!authLoading && !user) {
        setIsLoadingProfile(false); // Not logged in, no profile to load
      }
    };
    loadProfile();
  }, [user, authLoading, fetchCandidateByUid, toast]);

  const getInitials = (name?: string | null) => {
    if (!name) return "S";
    const names = name.split(' ');
    if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
    return names[0][0].toUpperCase() + names[names.length - 1][0].toUpperCase();
  };

  const handleDownloadResume = () => {
    if (candidateProfile?.resumeUrl) {
      window.open(candidateProfile.resumeUrl, "_blank");
      toast({ title: "Resume Download", description: "Your resume download should begin shortly." });
    } else {
      toast({ title: "No Resume", description: "No resume file found on your profile.", variant: "destructive" });
    }
  };

  if (authLoading || contextLoading || isLoadingProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] p-6">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-xl text-muted-foreground">Loading your profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8 px-4 md:px-6 text-center">
        <h1 className="text-2xl font-semibold text-destructive mb-4">Access Denied</h1>
        <p className="text-muted-foreground mb-6">Please log in to view your profile.</p>
        <Button asChild>
          <Link href="/student/login">Login</Link>
        </Button>
      </div>
    );
  }

  if (!candidateProfile) {
    return (
      <div className="container mx-auto py-8 px-4 md:px-6 text-center">
        <User className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-semibold text-foreground mb-2">Profile Not Found</h1>
        <p className="text-muted-foreground mb-4">
          We couldn't find a detailed profile for your account. 
          This might happen if you signed up without uploading a resume.
        </p>
        <p className="text-sm text-muted-foreground mb-6">
          Consider re-doing the signup process with a resume, or if this is an error, contact support.
        </p>
         <Button asChild variant="outline">
          <Link href="/student/signup">Sign Up Again</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <Card className="max-w-2xl mx-auto rounded-2xl shadow-xl border">
        <CardHeader className="text-center space-y-4 p-6 bg-card/50 rounded-t-2xl">
          <Avatar className="h-24 w-24 mx-auto border-4 border-primary shadow-lg">
            <AvatarImage src={candidateProfile.avatarUrl || `https://placehold.co/96x96.png?text=${getInitials(candidateProfile.name)}`} alt={candidateProfile.name || "Student"} data-ai-hint="person student" />
            <AvatarFallback className="text-3xl bg-muted text-primary font-semibold">{getInitials(candidateProfile.name)}</AvatarFallback>
          </Avatar>
          <CardTitle className="text-3xl font-bold text-primary">{candidateProfile.name}</CardTitle>
          <CardDescription className="text-md text-muted-foreground flex items-center justify-center">
            <Mail className="mr-2 h-4 w-4" /> {candidateProfile.email}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center">
              <FileText className="mr-2 h-5 w-5 text-primary" /> Main Resume
            </h3>
            {candidateProfile.resumeUrl ? (
              <div className="p-4 border rounded-lg bg-secondary/30 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  Your primary resume is on file.
                </p>
                <Button onClick={handleDownloadResume} className="w-full sm:w-auto rounded-lg">
                  <Download className="mr-2 h-4 w-4" /> Download Resume
                </Button>
              </div>
            ) : (
              <div className="p-4 border rounded-lg bg-destructive/10 text-center">
                <p className="text-sm text-destructive-foreground">No resume uploaded during signup.</p>
                 <Button variant="link" asChild className="mt-2 text-primary">
                    <Link href="/student/signup">Upload via Signup</Link>
                 </Button>
              </div>
            )}
          </div>

          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-semibold text-foreground flex items-center">
              <Edit className="mr-2 h-5 w-5 text-primary" /> Manage Profile
            </h3>
            <p className="text-sm text-muted-foreground">
              Functionality to edit your profile details and upload a new main resume will be available soon.
            </p>
             <Button disabled className="w-full rounded-lg">Edit Profile Details (Coming Soon)</Button>
          </div>
          
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-semibold text-foreground flex items-center">
              <FileText className="mr-2 h-5 w-5 text-primary" /> My Custom Resumes
            </h3>
            <p className="text-sm text-muted-foreground">
              Custom resumes you generate for specific job applications will appear here.
            </p>
            {/* Placeholder for listing custom resumes */}
            <div className="p-4 border rounded-lg bg-secondary/30 text-center">
                 <p className="text-sm text-muted-foreground">No custom resumes generated yet.</p>
            </div>
          </div>

           <div className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-semibold text-foreground flex items-center">
              <Briefcase className="mr-2 h-5 w-5 text-primary" /> My Applications
            </h3>
            <p className="text-sm text-muted-foreground">
              Track the status of your job applications here. (Feature coming soon)
            </p>
            <div className="p-4 border rounded-lg bg-secondary/30 text-center">
                 <p className="text-sm text-muted-foreground">Application tracking will be shown here.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

    