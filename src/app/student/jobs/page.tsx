
"use client";

import { useEffect, useState, type ChangeEvent } from "react";
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
import { db, storage } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  serverTimestamp,
  doc,
  setDoc,
  orderBy,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
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
  Palette,
  UserCircle, // Added for Profile button
} from "lucide-react";
import Link from "next/link";
import type { UnifiedCandidate, DigitalResume } from "@/context/candidate-context";
import { useCandidateContext } from "@/context/candidate-context";
import { parseResume, type ParseResumeOutput } from "@/ai/flows/resume-parsing";
import { generateResumeTextContent } from "@/lib/mock-data"; // Keep this import

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
  
  // States for resume upload within the application dialog
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileDataUri, setFileDataUri] = useState<string | null>(null);


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

  const handleFileChangeForApplication = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];
      if (!allowedTypes.includes(file.type)) {
        toast({ title: "Invalid File Type", description: "Please upload a PDF, DOC, DOCX or TXT file.", variant: "destructive" });
        setSelectedFile(null);
        setFileDataUri(null);
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setFileDataUri(e.target?.result as string);
      reader.onerror = () => toast({ title: "File Read Error", description: "Could not read the selected file.", variant: "destructive" });
      reader.readAsDataURL(file);
    }
  };

  const openApplyDialog = (job: JobRequisition) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in or sign up to apply for jobs.",
        variant: "default", // Changed to default as it's informational
        action: <Button asChild><Link href="/student/login">Login</Link></Button>,
      });
      return;
    }
    setSelectedJobForApplication(job);
    setShowApplyDialogForJobId(job.id);
    setSelectedFile(null); // Reset file state when opening dialog
    setFileDataUri(null);
  };

  const handleApplyWithResume = async () => {
    if (!user || !selectedJobForApplication || !fileDataUri || !selectedFile) {
      toast({ title: "Missing Information", description: "User, job, or resume file is missing.", variant: "destructive" });
      return;
    }
    setIsApplying(true);
    try {
      // 0. Check for duplicate application
      const appQuery = query(collection(db, "jobApplications"), where("jobId", "==", selectedJobForApplication.id), where("candidateEmail", "==", user.email));
      const appQuerySnapshot = await getDocs(appQuery);
      if (!appQuerySnapshot.empty) {
        toast({ title: "Already Applied", description: `You have already applied for ${selectedJobForApplication.title}.`, variant: "default" });
        setShowApplyDialogForJobId(null);
        setIsApplying(false);
        return;
      }

      // 1. Parse Resume (already have fileDataUri from dialog)
      let parsedData: ParseResumeOutput;
      try {
        parsedData = await parseResume({ resumeDataUri: fileDataUri });
      } catch (parseError) {
        console.error("Error parsing resume during application:", parseError);
        toast({ title: "Resume Parsing Issue", description: "Could not parse resume. Application not submitted.", variant: "destructive" });
        setIsApplying(false);
        return;
      }

      // 2. Upload resume to Firebase Storage
      const storageRef = ref(storage, `resumes/${user.uid}/${Date.now()}_${selectedFile.name}`); // Unique name
      await uploadBytes(storageRef, selectedFile);
      const newResumeUrl = await getDownloadURL(storageRef);

      // 3. Create or Update Candidate Profile in Firestore
      let candidateIdForApp = user.uid; // Use UID as candidate ID
      let candidateNameForApp = user.displayName || parsedData.name || user.email?.split('@')[0] || "Student Applicant";

      const candidateDocRef = doc(db, "candidates", user.uid);
      const existingCandidateSnap = await getDocs(query(collection(db, "candidates"), where("uid", "==", user.uid)));


      const resumeTextContent = generateResumeTextContent(parsedData);
      const candidateUpdateData: Partial<UnifiedCandidate> = {
        name: candidateNameForApp, // Ensure name is updated if parsed one is better
        email: user.email,
        phone: parsedData.phone,
        education: parsedData.education,
        experience: parsedData.experience,
        skills: parsedData.skills,
        certifications: parsedData.certifications,
        resumeUrl: newResumeUrl, // Update with the new resume
        digitalResume: parsedData,
        resumeTextContent: resumeTextContent,
        updatedAt: Timestamp.now(),
        // Retain existing avatarUrl, role, topSkill if they exist, or set defaults
        avatarUrl: existingCandidateSnap.docs[0]?.data()?.avatarUrl || `https://placehold.co/80x80.png?text=${candidateNameForApp.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase()}`,
        role: existingCandidateSnap.docs[0]?.data()?.role || parsedData.experience?.split('\\n')[0]?.trim() || "Student Applicant",
        topSkill: existingCandidateSnap.docs[0]?.data()?.topSkill || parsedData.skills?.split(',')[0]?.trim() || "Awaiting Skills",
      };

      if (!existingCandidateSnap.empty) { // Profile exists, update it
        await updateDoc(candidateDocRef, candidateUpdateData);
        refreshCandidateInLocalState(user.uid, { ...candidateUpdateData, id:user.uid });
         toast({ title: "Profile Updated", description: "Your profile and resume have been updated." });
      } else { // Profile doesn't exist, create it (should be rare if signup flow is robust)
        const newCandidateData: UnifiedCandidate = {
          id: user.uid,
          uid: user.uid,
          createdAt: Timestamp.now(),
          ...candidateUpdateData,
        } as UnifiedCandidate;
        await setDoc(candidateDocRef, newCandidateData);
        addCandidateToLocalState(newCandidateData);
         toast({ title: "Profile Created", description: "Your profile has been created with the new resume." });
      }

      // 4. Create Job Application
      await addDoc(collection(db, "jobApplications"), {
        jobId: selectedJobForApplication.id,
        jobTitle: selectedJobForApplication.title,
        candidateId: user.uid, // This is the Firestore doc ID (user.uid for students)
        candidateName: candidateNameForApp,
        candidateEmail: user.email,
        applicationDate: serverTimestamp(),
        status: "Applied",
        source: "Student Portal - Resume Upload Apply",
        appliedWithResumeUrl: newResumeUrl,
      });

      toast({
        title: "Application Sent!",
        description: `Successfully applied for ${selectedJobForApplication.title} with the uploaded resume.`,
        variant: "default",
        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      });

    } catch (error) {
      console.error("Error during apply with resume:", error);
      toast({ title: "Application Failed", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsApplying(false);
      setShowApplyDialogForJobId(null);
      setSelectedFile(null);
      setFileDataUri(null);
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
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-center sm:text-left">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-primary mb-2">
            Explore Job Openings
            </h1>
            <p className="text-lg text-muted-foreground">
            Find your next opportunity. Apply today!
            </p>
        </div>
        {user && !authLoading && (
             <Button asChild variant="outline" className="rounded-lg">
                <Link href="/student/profile">
                    <UserCircle className="mr-2 h-4 w-4" /> View Profile
                </Link>
            </Button>
        )}
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-12 bg-card border rounded-2xl shadow-lg p-10">
          <Briefcase className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold text-foreground mb-2">No Open Positions Currently</h2>
          <p className="text-muted-foreground">
            Please check back later for new job postings.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <Card key={job.id} className="flex flex-col rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 border bg-card">
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
                  Apply Now
                </Button>
                <Button
                  variant="outline"
                  className="w-full sm:flex-1 rounded-lg"
                  onClick={() => handleCustomResumeApply(job)}
                  disabled={authLoading}
                >
                  <Palette className="mr-2 h-4 w-4" />
                  Create Custom Resume
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {selectedJobForApplication && showApplyDialogForJobId === selectedJobForApplication.id && (
        <Dialog open={!!showApplyDialogForJobId} onOpenChange={(isOpen) => { if (!isOpen) { setShowApplyDialogForJobId(null); setSelectedFile(null); setFileDataUri(null); }}}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center text-xl">
                <UploadCloud className="mr-2 h-5 w-5 text-primary"/> Apply for {selectedJobForApplication.title}
              </DialogTitle>
              <DialogDescription>
                Please upload your resume (PDF, DOC, DOCX, TXT) for this application. This will update your main profile resume.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="resume-upload-apply">Upload Resume</Label>
                    <Input
                    id="resume-upload-apply"
                    type="file"
                    accept=".pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.txt"
                    onChange={handleFileChangeForApplication}
                    className="rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                    />
                    {selectedFile && <p className="text-xs text-muted-foreground">Selected: {selectedFile.name}</p>}
                </div>
            </div>
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button variant="outline" className="rounded-lg">Cancel</Button>
              </DialogClose>
              <Button
                onClick={handleApplyWithResume}
                disabled={isApplying || !selectedFile || !fileDataUri}
                className="rounded-lg"
              >
                {isApplying ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                {isApplying ? "Submitting..." : "Submit Application"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

    