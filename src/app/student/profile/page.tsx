
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useAuth } from "@/context/auth-context";
import { useCandidateContext, type UnifiedCandidate } from "@/context/candidate-context";
import { Loader2, User, Mail, FileText, Download, Edit, Briefcase, ClipboardList, FileHeart } from "lucide-react"; // Added FileHeart for custom resumes
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy, Timestamp, type DocumentData } from "firebase/firestore";
import { Badge } from "@/components/ui/badge";

interface StudentApplication extends DocumentData {
  id: string;
  jobTitle: string;
  applicationDate: Timestamp;
  status: string;
}

interface CustomResumeEntry extends DocumentData {
  id: string; // Will be the jobId
  jobTitle: string;
  generatedResumeText: string;
  createdAt: Timestamp;
}

export default function StudentProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const { fetchCandidateByUid, loadingCandidates: contextLoading } = useCandidateContext();
  const [candidateProfile, setCandidateProfile] = useState<UnifiedCandidate | null>(null);
  const [applications, setApplications] = useState<StudentApplication[]>([]);
  const [customResumes, setCustomResumes] = useState<CustomResumeEntry[]>([]);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingApplications, setIsLoadingApplications] = useState(true);
  const [isLoadingCustomResumes, setIsLoadingCustomResumes] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadProfileData = async () => {
      if (user && !authLoading) {
        setIsLoadingProfile(true);
        setIsLoadingApplications(true);
        setIsLoadingCustomResumes(true);
        try {
          // Fetch Candidate Profile
          const profile = await fetchCandidateByUid(user.uid);
          setCandidateProfile(profile);

          // Fetch Job Applications
          const appsQuery = query(
            collection(db, "jobApplications"),
            where("candidateId", "==", user.uid),
            orderBy("applicationDate", "desc")
          );
          const appsSnapshot = await getDocs(appsQuery);
          const fetchedApps = appsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StudentApplication));
          setApplications(fetchedApps);

          // Fetch Custom Resumes
          const customResumesQuery = query(
            collection(db, "candidates", user.uid, "customResumes"),
            orderBy("createdAt", "desc")
          );
          const customResumesSnapshot = await getDocs(customResumesQuery);
          const fetchedCustomResumes = customResumesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CustomResumeEntry));
          setCustomResumes(fetchedCustomResumes);

        } catch (error) {
          console.error("Error fetching student profile data:", error);
          toast({
            title: "Error",
            description: "Could not load all your profile data.",
            variant: "destructive",
          });
        } finally {
          setIsLoadingProfile(false);
          setIsLoadingApplications(false);
          setIsLoadingCustomResumes(false);
        }
      } else if (!authLoading && !user) {
        setIsLoadingProfile(false);
        setIsLoadingApplications(false);
        setIsLoadingCustomResumes(false);
      }
    };
    loadProfileData();
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
      toast({ title: "No Resume", description: "No main resume file found on your profile.", variant: "destructive" });
    }
  };

  const getApplicationStatusBadgeVariant = (status?: string) => {
    switch (status) {
      case "Applied": return "default";
      case "Screening": return "secondary";
      case "Interviewing": return "default"; 
      case "Offered": return "default"; 
      case "Hired": return "default";
      case "Rejected": return "destructive";
      default: return "outline";
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
          This typically happens if you signed up before the resume upload feature was fully active.
        </p>
        <p className="text-sm text-muted-foreground mb-6">
          Please try signing up again with your resume, or if you believe this is an error, contact support.
        </p>
         <Button asChild variant="outline">
          <Link href="/student/signup">Sign Up & Upload Resume</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <Card className="max-w-3xl mx-auto rounded-2xl shadow-xl border">
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
        <CardContent className="p-6 space-y-8">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground flex items-center">
              <FileText className="mr-2 h-5 w-5 text-primary" /> Main Resume
            </h3>
            {candidateProfile.resumeUrl ? (
              <div className="p-4 border rounded-lg bg-secondary/30 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  Your primary resume is on file (uploaded during signup or last application).
                </p>
                <Button onClick={handleDownloadResume} className="w-full sm:w-auto rounded-lg">
                  <Download className="mr-2 h-4 w-4" /> Download Resume
                </Button>
              </div>
            ) : (
              <div className="p-4 border rounded-lg bg-amber-500/10 text-center">
                <p className="text-sm text-amber-700">No main resume uploaded. You can upload one when applying for a job.</p>
              </div>
            )}
          </div>

          <div className="space-y-4 pt-6 border-t">
            <h3 className="text-xl font-semibold text-foreground flex items-center">
              <Edit className="mr-2 h-5 w-5 text-primary" /> Manage Profile
            </h3>
            <p className="text-sm text-muted-foreground">
              Functionality to edit your profile details and upload/update your main resume directly here will be available soon.
            </p>
             <Button disabled className="w-full rounded-lg">Edit Profile Details (Coming Soon)</Button>
          </div>
          
          <div className="space-y-4 pt-6 border-t">
            <h3 className="text-xl font-semibold text-foreground flex items-center">
              <FileHeart className="mr-2 h-5 w-5 text-primary" /> My Custom Resumes
            </h3>
            {isLoadingCustomResumes ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p className="ml-2 text-muted-foreground">Loading custom resumes...</p>
              </div>
            ) : customResumes.length > 0 ? (
              <Accordion type="multiple" className="w-full">
                {customResumes.map((cr) => (
                  <AccordionItem value={cr.id} key={cr.id}>
                    <AccordionTrigger className="text-md hover:no-underline">
                      Custom Resume for: <span className="ml-1 font-semibold text-primary">{cr.jobTitle}</span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <Textarea
                        value={cr.generatedResumeText}
                        readOnly
                        rows={10}
                        className="w-full rounded-md bg-muted/50 p-3 text-sm whitespace-pre-wrap"
                      />
                       <p className="text-xs text-muted-foreground mt-2">
                        Created: {cr.createdAt?.toDate().toLocaleDateString()}
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <div className="p-4 border rounded-lg bg-secondary/30 text-center">
                 <p className="text-sm text-muted-foreground">No custom resumes generated and saved yet.</p>
              </div>
            )}
          </div>

           <div className="space-y-4 pt-6 border-t">
            <h3 className="text-xl font-semibold text-foreground flex items-center">
              <ClipboardList className="mr-2 h-5 w-5 text-primary" /> My Applications
            </h3>
             {isLoadingApplications ? (
                <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <p className="ml-2 text-muted-foreground">Loading applications...</p>
                </div>
            ) : applications.length > 0 ? (
              <div className="space-y-3">
                {applications.map(app => (
                  <Card key={app.id} className="rounded-lg border bg-card p-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-semibold text-foreground">{app.jobTitle}</p>
                            <p className="text-xs text-muted-foreground">
                                Applied: {app.applicationDate?.toDate().toLocaleDateString()}
                            </p>
                        </div>
                        <Badge variant={getApplicationStatusBadgeVariant(app.status)}>{app.status}</Badge>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
                <div className="p-4 border rounded-lg bg-secondary/30 text-center">
                    <p className="text-sm text-muted-foreground">You haven't applied for any jobs yet.</p>
                    <Button variant="link" asChild className="mt-1 text-primary">
                        <Link href="/student/jobs">Browse