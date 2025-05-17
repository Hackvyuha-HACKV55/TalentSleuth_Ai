
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
import { db } from "@/lib/firebase";
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
} from "lucide-react";
import Link from "next/link";
import type { UnifiedCandidate } from "@/context/candidate-context";
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
  const { addCandidateToLocalState, refreshCandidateInLocalState } = useCandidateContext();

  const [showResumeDialogForJobId, setShowResumeDialogForJobId] = useState<string | null>(null);
  const [selectedJobForApplication, setSelectedJobForApplication] = useState<JobRequisition | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileDataUri, setFileDataUri] = useState<string | null>(null);
  const [isApplyingWithResume, setIsApplyingWithResume] = useState(false);

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
          description: "Could not fetch job openings. Please ensure Firestore indexes are set up if this persists.",
          variant: "destructive",
        });
      } finally {
        setLoadingJobs(false);
      }
    };
    fetchOpenJobs();
  }, [toast]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];
      if (!allowedTypes.includes(file.type)) {
        toast({ title: "Invalid File Type", description: "Please upload PDF, DOC, DOCX, or TXT.", variant: "destructive" });
        setSelectedFile(null);
        setFileDataUri(null);
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFileDataUri(reader.result as string);
      };
      reader.onerror = () => {
        toast({ title: "File Read Error", description: "Could not read the selected file.", variant: "destructive" });
        setSelectedFile(null);
        setFileDataUri(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const openResumeDialog = (job: JobRequisition) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in or sign up to apply for jobs.",
        variant: "destructive",
        action: <Button asChild><Link href="/student/login">Login</Link></Button>, // Direct to student login
      });
      return;
    }
    setSelectedJobForApplication(job);
    setShowResumeDialogForJobId(job.id);
    setSelectedFile(null); // Reset file state for new dialog
    setFileDataUri(null); // Reset data URI state
  };

  const handleApplyWithResume = async () => {
    if (!user || !selectedJobForApplication || !fileDataUri || !selectedFile) {
      toast({ title: "Missing Information", description: "User, job, or resume file is missing.", variant: "destructive" });
      return;
    }

    setIsApplyingWithResume(true);

    try {
      const applicationsQuery = query(
        collection(db, "jobApplications"),
        where("jobId", "==", selectedJobForApplication.id),
        where("candidateEmail", "==", user.email)
      );
      const existingApplicationsSnap = await getDocs(applicationsQuery);
      if (!existingApplicationsSnap.empty) {
        toast({ title: "Already Applied", description: "You have already applied for this position.", variant: "default" });
        setShowResumeDialogForJobId(null);
        setIsApplyingWithResume(false);
        return;
      }

      const parsedResumeOutput: ParseResumeOutput = await parseResume({ resumeDataUri: fileDataUri });

      let candidateId = "";
      let candidateName = parsedResumeOutput.name || user.displayName || user.email?.split('@')[0] || "Applicant";
      const resumeTextContent = generateResumeTextContent(parsedResumeOutput);
      const candidateInitials = (candidateName.split(' ').map(n=>n[0]).join('') || 'AP').substring(0,2).toUpperCase();


      const candidatesQuery = query(collection(db, "candidates"), where("email", "==", user.email));
      const candidateSnap = await getDocs(candidatesQuery);

      if (!candidateSnap.empty) {
        candidateId = candidateSnap.docs[0].id;
        const existingCandidateData = candidateSnap.docs[0].data() as UnifiedCandidate;
        candidateName = parsedResumeOutput.name || existingCandidateData.name || candidateName;

        const updatedCandidateData: Partial<UnifiedCandidate> = {
            name: candidateName,
            phone: parsedResumeOutput.phone || existingCandidateData.phone,
            education: parsedResumeOutput.education || existingCandidateData.education,
            experience: parsedResumeOutput.experience || existingCandidateData.experience,
            skills: parsedResumeOutput.skills || existingCandidateData.skills,
            certifications: parsedResumeOutput.certifications || existingCandidateData.certifications,
            role: parsedResumeOutput.experience?.split('\n')[0]?.trim() || existingCandidateData.role || "Applicant",
            topSkill: parsedResumeOutput.skills?.split(',')[0]?.trim() || existingCandidateData.topSkill || "Not Specified",
            resumeOriginalDataUri: fileDataUri,
            resumeTextContent: resumeTextContent,
            avatarUrl: existingCandidateData.avatarUrl || `https://placehold.co/80x80.png?text=${candidateInitials}`,
            updatedAt: Timestamp.now(),
        };
        await updateDoc(doc(db, "candidates", candidateId), updatedCandidateData);
        refreshCandidateInLocalState(candidateId, { ...existingCandidateData, ...updatedCandidateData, id: candidateId });
        toast({ title: "Profile Updated", description: "Your candidate profile has been updated with the new resume details."});

      } else {
        const newCandidateRef = doc(collection(db, "candidates"));
        candidateId = newCandidateRef.id;
        const newCandidateData: UnifiedCandidate = {
          id: candidateId,
          name: candidateName,
          email: user.email!,
          phone: parsedResumeOutput.phone || "Not Specified",
          education: parsedResumeOutput.education || "Not Specified",
          experience: parsedResumeOutput.experience || "Not Specified",
          skills: parsedResumeOutput.skills || "Not Specified",
          certifications: parsedResumeOutput.certifications,
          role: parsedResumeOutput.experience?.split('\n')[0]?.trim() || "Applicant",
          avatarUrl: `https://placehold.co/80x80.png?text=${candidateInitials}`,
          resumeOriginalDataUri: fileDataUri,
          resumeTextContent: resumeTextContent,
          topSkill: parsedResumeOutput.skills?.split(',')[0]?.trim() || "Not Specified",
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        };
        await setDoc(newCandidateRef, newCandidateData);
        addCandidateToLocalState(newCandidateData);
        toast({ title: "Profile Created", description: "A candidate profile has been created for you."});
      }

      await addDoc(collection(db, "jobApplications"), {
        jobId: selectedJobForApplication.id,
        jobTitle: selectedJobForApplication.title,
        candidateId: candidateId,
        candidateName: candidateName, 
        candidateEmail: user.email,
        applicationDate: serverTimestamp(),
        status: "Applied",
        source: "Student Portal",
      });

      toast({
        title: "Application Sent!",
        description: `Successfully applied for ${selectedJobForApplication.title}.`,
        variant: "default",
        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      });

    } catch (error) {
      console.error("Error applying for job with resume:", error);
      toast({
        title: "Application Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
        icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
      });
    } finally {
      setIsApplyingWithResume(false);
      setShowResumeDialogForJobId(null);
      setSelectedFile(null);
      setFileDataUri(null);
    }
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
              <CardFooter>
                <Button
                  className="w-full rounded-lg"
                  onClick={() => openResumeDialog(job)}
                  disabled={authLoading} 
                >
                  <Send className="mr-2 h-4 w-4" />
                  {user ? "Apply Now" : "Login to Apply"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {selectedJobForApplication && showResumeDialogForJobId === selectedJobForApplication.id && (
        <Dialog open={!!showResumeDialogForJobId} onOpenChange={(isOpen) => { if (!isOpen) { setShowResumeDialogForJobId(null); setSelectedFile(null); setFileDataUri(null); }}}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5 text-primary"/> Apply for {selectedJobForApplication.title}
              </DialogTitle>
              <DialogDescription>
                Upload your resume to complete your application. Supported formats: PDF, DOC, DOCX, TXT.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="resume-file-upload" className="text-right col-span-1">
                  Resume
                </Label>
                <Input
                  id="resume-file-upload"
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                  onChange={handleFileChange}
                  className="col-span-3 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                />
              </div>
              {selectedFile && <p className="text-xs text-muted-foreground text-center col-span-4">Selected: {selectedFile.name}</p>}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" className="rounded-lg">Cancel</Button>
              </DialogClose>
              <Button
                onClick={handleApplyWithResume}
                disabled={!selectedFile || !fileDataUri || isApplyingWithResume}
                className="rounded-lg"
              >
                {isApplyingWithResume ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <UploadCloud className="mr-2 h-4 w-4" />
                )}
                {isApplyingWithResume ? "Submitting..." : "Submit Application"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
