
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { db, storage } from "@/lib/firebase"; // Added storage
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  setDoc,
  orderBy,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Added storage functions
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import {
  Briefcase,
  CalendarDays,
  DollarSign,
  Loader2,
  MapPin,
  Send,
  CheckCircle,
  AlertTriangle,
  UploadCloud,
  FileText,
  Palette, // Placeholder for Custom Resume, replace with better icon if available
} from "lucide-react";
import Link from "next/link";
import type { UnifiedCandidate, DigitalResume } from "@/context/candidate-context";
import { useCandidateContext } from "@/context/candidate-context";
import { parseResume, type ParseResumeOutput } from "@/ai/flows/resume-parsing";
import { generateResumeTextContent } from "@/lib/mock-data";

interface JobRequisition {
  id: string;
  title: string;
  description: string;
  location: string;
  salary?: string;
  status: "Open" | "Closed" | "Draft";
  createdAt: Timestamp;
}

export default function StudentJobsPage() {
  const [jobs, setJobs] = useState<JobRequisition[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { addCandidateToLocalState, refreshCandidateInLocalState, fetchCandidateByUid } = useCandidateContext();

  const [showApplyDialogForJobId, setShowApplyDialogForJobId] = useState<string | null>(null);
  const [selectedJobForApplication, setSelectedJobForApplication] = useState<JobRequisition | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    const fetchOpenJobs = async () => {
      setLoadingJobs(true);
      try {
        const jobsCollectionRef = collection(db, "jobRequisitions");
        const q = query(
          jobsCollectionRef,
          where("status", "==", "Open"),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const fetchedJobs = querySnapshot.docs.map(
          (docSnap) => ({ id: docSnap.id, ...docSnap.data() } as JobRequisition)
        );
        setJobs(fetchedJobs);
      } catch (error) {
        console.error("Error fetching open job requisitions:", error);
        toast({
          title: "Error",
          description: "Could not fetch job openings. Ensure Firestore indexes are set up.",
          variant: "destructive",
        });
      } finally {
        setLoadingJobs(false);
      }
    };
    fetchOpenJobs();
  }, [toast]);


  const openApplyDialog = async (job: JobRequisition) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in or sign up to apply for jobs.",
        variant: "destructive",
        action: <Button asChild><Link href="/student/login">Login</Link></Button>,
      });
      return;
    }
    
    // Check if candidate profile exists (created during new signup)
    const candidateProfile = await fetchCandidateByUid(user.uid);
    if (!candidateProfile || !candidateProfile.resumeUrl) {
        toast({
            title: "Profile Incomplete",
            description: "Your profile is not fully set up with a resume. Please ensure you completed the signup process with a resume.",
            variant: "destructive",
        });
         // Optionally redirect to a profile completion page or back to signup
        return;
    }

    setSelectedJobForApplication(job);
    setShowApplyDialogForJobId(job.id);
  };

  const handleDirectApply = async () => {
    if (!user || !selectedJobForApplication) {
      toast({ title: "Missing Information", description: "User or job information is missing.", variant: "destructive" });
      return;
    }

    setIsApplying(true);
    try {
      // Check for existing application
      const applicationsQuery = query(
        collection(db, "jobApplications"),
        where("jobId", "==", selectedJobForApplication.id),
        where("candidateEmail", "==", user.email) // Using email for check as UID might not be in old jobApplications
      );
      const existingApplicationsSnap = await getDocs(applicationsQuery);
      if (!existingApplicationsSnap.empty) {
        toast({ title: "Already Applied", description: "You have already applied for this position.", variant: "default" });
        setShowApplyDialogForJobId(null);
        setIsApplying(false);
        return;
      }

      const candidateProfile = await fetchCandidateByUid(user.uid);
      if (!candidateProfile || !candidateProfile.resumeUrl) {
        toast({ title: "Application Error", description: "Your candidate profile or resume is not available.", variant: "destructive" });
        setIsApplying(false);
        return;
      }

      // Here, you would typically trigger a backend function to send an email with candidateProfile.resumeUrl
      // For now, we'll just create the application record.
      // TODO: Implement email sending logic (e.g., via a Firebase Function)

      await addDoc(collection(db, "jobApplications"), {
        jobId: selectedJobForApplication.id,
        jobTitle: selectedJobForApplication.title,
        candidateId: candidateProfile.id, // This is the Firestore doc ID (which is user.uid for students)
        candidateName: candidateProfile.name,
        candidateEmail: user.email,
        applicationDate: serverTimestamp(),
        status: "Applied",
        source: "Student Portal - Direct Apply",
        appliedWithResumeUrl: candidateProfile.resumeUrl, // Store which resume was used
      });

      toast({
        title: "Application Sent!",
        description: `Successfully applied for ${selectedJobForApplication.title} using your profile resume.`,
        variant: "default",
        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      });

    } catch (error) {
      console.error("Error during direct apply:", error);
      toast({ title: "Application Failed", variant: "destructive" });
    } finally {
      setIsApplying(false);
      setShowApplyDialogForJobId(null);
    }
  };
  
  const handleCustomResumeApply = async (job: JobRequisition) => {
     if (!user) {
      toast({ title: "Authentication Required", description: "Please log in to use this feature.", variant: "destructive"});
      return;
    }
    toast({
        title: "Custom Resume Feature",
        description: "Generating and sending a custom resume is a planned feature and coming soon!",
        variant: "default"
    });
    // Placeholder for future complex Genkit flow
    // 1. Fetch JD for job.id
    // 2. Fetch candidate's digitalResume from their profile (user.uid)
    // 3. Call new Genkit flow: generateCustomResume(jdText, digitalResume) -> returns new resume text/dataURI
    // 4. (Optional) Save generated resume to Firebase Storage
    // 5. Send this custom resume (again, email sending logic needed)
    // 6. Create jobApplication record
  };


  if (authLoading || loadingJobs) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] p-6">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-xl text-muted-foreground">Loading job openings...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-primary mb-2">
          Explore Job Openings
        </h1>
        <p className="text-lg text-muted-foreground">
          Find your next opportunity. Apply today!
        </p>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-12">
          <Briefcase className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold text-foreground mb-2">No Open Positions Currently</h2>
          <p className="text-muted-foreground">
            Please check back later for new job postings.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <Card key={job.id} className="flex flex-col rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl text-primary truncate">{job.title}</CardTitle>
                <CardDescription className="flex items-center text-sm text-muted-foreground pt-1">
                  <MapPin className="mr-1.5 h-4 w-4" /> {job.location}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-3">
                <p className="text-sm text-foreground line-clamp-3">{job.description}</p>
                <div className="flex items-center text-xs text-muted-foreground">
                  <CalendarDays className="mr-1.5 h-3.5 w-3.5" /> Posted: {job.createdAt?.toDate().toLocaleDateString() || "N/A"}
                </div>
                {job.salary && (
                  <div className="flex items-center text-xs text-muted-foreground">
                    <DollarSign className="mr-1.5 h-3.5 w-3.5" /> Salary: {job.salary}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row gap-2 pt-4">
                <Button
                  className="w-full sm:flex-1 rounded-lg"
                  onClick={() => openApplyDialog(job)}
                  disabled={authLoading}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Apply with Profile Resume
                </Button>
                <Button
                  variant="outline"
                  className="w-full sm:flex-1 rounded-lg"
                  onClick={() => handleCustomResumeApply(job)}
                  disabled={authLoading}
                >
                  <Palette className="mr-2 h-4 w-4" /> {/* Using Palette as placeholder */}
                  Create Custom Resume
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {selectedJobForApplication && showApplyDialogForJobId === selectedJobForApplication.id && (
        <Dialog open={!!showApplyDialogForJobId} onOpenChange={(isOpen) => { if (!isOpen) { setShowApplyDialogForJobId(null); }}}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5 text-primary"/> Apply for {selectedJobForApplication.title}
              </DialogTitle>
              <DialogDescription>
                You are about to apply using the resume from your profile. Confirm to proceed.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button variant="outline" className="rounded-lg">Cancel</Button>
              </DialogClose>
              <Button
                onClick={handleDirectApply}
                disabled={isApplying}
                className="rounded-lg"
              >
                {isApplying ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                {isApplying ? "Submitting..." : "Confirm & Apply"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
