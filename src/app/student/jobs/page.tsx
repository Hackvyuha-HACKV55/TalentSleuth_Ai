
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
import { Textarea } from "@/components/ui/textarea";
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
  getDoc,
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
  UploadCloud,
  Palette,
  Copy,
  Save,
  UserCircle, // Keep UserCircle if used elsewhere or for consistency
} from "lucide-react";
import Link from "next/link";
import type { UnifiedCandidate, DigitalResume } from "@/context/candidate-context";
import { useCandidateContext } from "@/context/candidate-context";
import { parseResume, type ParseResumeOutput } from "@/ai/flows/resume-parsing";
import { generateResumeTextContent } from "@/lib/mock-data";
import { generateCustomResume } from "@/ai/flows/generate-custom-resume";

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
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileDataUri, setFileDataUri] = useState<string | null>(null);

  const [showCustomResumeDialog, setShowCustomResumeDialog] = useState(false);
  const [currentJobForCustomResume, setCurrentJobForCustomResume] = useState<JobRequisition | null>(null);
  const [generatedCustomResumeText, setGeneratedCustomResumeText] = useState<string | null>(null);
  const [isGeneratingCustomResume, setIsGeneratingCustomResume] = useState(false);
  const [isSavingAndApplyingCustom, setIsSavingAndApplyingCustom] = useState(false);


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
          title: "Error Fetching Jobs",
          description: "Could not fetch job openings. Ensure Firestore indexes are set up correctly (check console for details).",
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
    } else {
        setSelectedFile(null);
        setFileDataUri(null);
    }
  };

  const openApplyWithProfileResumeDialog = (job: JobRequisition) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in or sign up to apply for jobs.",
        variant: "default",
        action: <Button asChild><Link href="/student/login">Login</Link></Button>,
      });
      return;
    }
    setSelectedJobForApplication(job);
    setShowApplyDialogForJobId(job.id);
    setSelectedFile(null); 
    setFileDataUri(null);
  };

  const handleApplyWithProfileResume = async () => {
    if (!user || !selectedJobForApplication) {
      toast({ title: "Missing Information", description: "User or job details are missing.", variant: "destructive" });
      return;
    }
  
    setIsApplying(true);
    try {
      const appQuery = query(collection(db, "jobApplications"), 
        where("jobId", "==", selectedJobForApplication.id), 
        where("candidateId", "==", user.uid)
      );
      const appQuerySnapshot = await getDocs(appQuery);
      if (!appQuerySnapshot.empty) {
          const existingApp = appQuerySnapshot.docs[0].data();
          const appTypeMsg = existingApp.applicationType === "custom" ? "a custom resume" : "your profile resume";
          toast({ title: "Already Applied", description: `You have already applied for ${selectedJobForApplication.title} using ${appTypeMsg}.`, variant: "default" });
          setShowApplyDialogForJobId(null);
          setIsApplying(false);
          setSelectedFile(null);
          setFileDataUri(null);
          return;
      }
  
      let candidateProfile = await fetchCandidateByUid(user.uid);
      let candidateNameForApp = candidateProfile?.name || user.displayName || user.email?.split('@')[0] || "Student Applicant";
      let finalResumeUrl = candidateProfile?.resumeUrl; 
  
      if (selectedFile && fileDataUri) { 
        let parsedData: ParseResumeOutput;
        try {
          parsedData = await parseResume({ resumeDataUri: fileDataUri });
        } catch (parseError) {
          console.error("Error parsing new resume during application:", parseError);
          toast({ title: "Resume Parsing Issue", description: "Could not parse the new resume. Application not submitted.", variant: "destructive" });
          setIsApplying(false);
          return;
        }
  
        const storageRef = ref(storage, `resumes/${user.uid}/${Date.now()}_${selectedFile.name}`);
        await uploadBytes(storageRef, selectedFile);
        finalResumeUrl = await getDownloadURL(storageRef); 
  
        const candidateDocRef = doc(db, "candidates", user.uid);
        const resumeTextContent = generateResumeTextContent(parsedData);
        const candidateUpdateData: Partial<UnifiedCandidate> = {
          name: parsedData.name || candidateNameForApp,
          email: user.email,
          phone: parsedData.phone,
          education: parsedData.education,
          experience: parsedData.experience,
          skills: parsedData.skills,
          certifications: parsedData.certifications,
          resumeUrl: finalResumeUrl,
          digitalResume: parsedData as DigitalResume,
          resumeTextContent: resumeTextContent,
          updatedAt: Timestamp.now(),
          avatarUrl: candidateProfile?.avatarUrl || `https://placehold.co/80x80.png?text=${(parsedData.name || candidateNameForApp).split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase()}`,
          role: candidateProfile?.role || parsedData.experience?.split('\\n')[0]?.trim() || "Student Applicant",
          topSkill: candidateProfile?.topSkill || parsedData.skills?.split(',')[0]?.trim() || "Awaiting Skills",
        };
  
        if (candidateProfile) {
          await updateDoc(candidateDocRef, candidateUpdateData);
          refreshCandidateInLocalState(user.uid, { ...candidateUpdateData, id: user.uid }); 
          toast({ title: "Profile Updated", description: "Your profile and main resume have been updated." });
        } else {
          const newCandidateData: UnifiedCandidate = {
            id: user.uid, uid: user.uid, createdAt: Timestamp.now(), ...candidateUpdateData,
          } as UnifiedCandidate;
          await setDoc(candidateDocRef, newCandidateData);
          addCandidateToLocalState(newCandidateData);
          toast({ title: "Profile Created", description: "Your profile has been created with the new resume." });
        }
        candidateNameForApp = parsedData.name || candidateNameForApp; 
      } else if (!candidateProfile?.resumeUrl) {
        toast({ title: "No Resume on Profile", description: "Please upload a resume to your profile first (e.g., during signup or by applying with a new resume now).", variant: "destructive" });
        setIsApplying(false);
        return; 
      }

      await addDoc(collection(db, "jobApplications"), {
        jobId: selectedJobForApplication.id,
        jobTitle: selectedJobForApplication.title,
        candidateId: user.uid,
        candidateName: candidateNameForApp,
        candidateEmail: user.email,
        applicationDate: serverTimestamp(),
        status: "Applied",
        source: "Student Portal - Profile Resume Apply",
        appliedWithResumeUrl: finalResumeUrl, 
        applicationType: "profile",
      });
  
      toast({
        title: "Application Sent!",
        description: `Successfully applied for ${selectedJobForApplication.title} using your profile resume.`,
        variant: "default",
        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      });
  
    } catch (error) {
      console.error("Error during apply with profile resume:", error);
      toast({ title: "Application Failed", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsApplying(false);
      setShowApplyDialogForJobId(null);
      setSelectedFile(null);
      setFileDataUri(null);
    }
  };
  
  const handleGenerateCustomResume = async (job: JobRequisition) => {
    if (!user) {
      toast({ title: "Authentication Required", description: "Please log in to use this feature.", variant: "destructive"});
      return;
    }
    setCurrentJobForCustomResume(job);
    setIsGeneratingCustomResume(true);
    setGeneratedCustomResumeText(null);
    setShowCustomResumeDialog(true);

    try {
      const candidateProfile = await fetchCandidateByUid(user.uid);
      if (!candidateProfile?.digitalResume) {
        toast({ title: "Profile Incomplete", description: "Your profile's digital resume data is missing. Please ensure your resume was parsed during signup or when applying.", variant: "destructive" });
        setIsGeneratingCustomResume(false);
        setShowCustomResumeDialog(false); 
        return;
      }

      const jobDocRef = doc(db, "jobRequisitions", job.id);
      const jobDocSnap = await getDoc(jobDocRef);
      if (!jobDocSnap.exists() || !jobDocSnap.data()?.description) {
        toast({ title: "Job Details Missing", description: "Could not fetch the full job description.", variant: "destructive" });
        setIsGeneratingCustomResume(false);
        setShowCustomResumeDialog(false); 
        return;
      }
      const jobDescriptionText = jobDocSnap.data()?.description;

      const result = await generateCustomResume({
        jobDescriptionText: jobDescriptionText,
        studentDigitalResume: candidateProfile.digitalResume
      });
      setGeneratedCustomResumeText(result.generatedResumeText);

    } catch (error) {
        console.error("Error generating custom resume:", error);
        toast({ title: "Generation Failed", description: "Could not generate custom resume.", variant: "destructive" });
        setShowCustomResumeDialog(false); 
    } finally {
        setIsGeneratingCustomResume(false);
    }
  };

  const handleSaveAndApplyCustomResume = async () => {
    if (!user || !currentJobForCustomResume || !generatedCustomResumeText) {
      toast({ title: "Missing Data", description: "User, job, or generated resume text is missing.", variant: "destructive" });
      return;
    }
    setIsSavingAndApplyingCustom(true);
    try {
      const appQuery = query(collection(db, "jobApplications"), 
        where("jobId", "==", currentJobForCustomResume.id), 
        where("candidateId", "==", user.uid)
      );
      const appQuerySnapshot = await getDocs(appQuery);
      if (!appQuerySnapshot.empty) {
          const existingApp = appQuerySnapshot.docs[0].data();
          const appTypeMsg = existingApp.applicationType === "custom" ? "a custom resume" : "your profile resume";
          toast({ title: "Already Applied", description: `You have already applied for ${currentJobForCustomResume.title} using ${appTypeMsg}.`, variant: "default" });
          setShowCustomResumeDialog(false);
          setGeneratedCustomResumeText(null);
          setCurrentJobForCustomResume(null);
          setIsSavingAndApplyingCustom(false);
          return;
      }

      const customResumeDocRef = doc(db, "candidates", user.uid, "customResumes", currentJobForCustomResume.id);
      await setDoc(customResumeDocRef, {
        jobId: currentJobForCustomResume.id,
        jobTitle: currentJobForCustomResume.title,
        generatedResumeText: generatedCustomResumeText,
        createdAt: serverTimestamp(),
      });

      const candidateProfile = await fetchCandidateByUid(user.uid);
      const candidateNameForApp = candidateProfile?.name || user.displayName || user.email?.split('@')[0] || "Student Applicant";

      await addDoc(collection(db, "jobApplications"), {
        jobId: currentJobForCustomResume.id,
        jobTitle: currentJobForCustomResume.title,
        candidateId: user.uid,
        candidateName: candidateNameForApp,
        candidateEmail: user.email,
        applicationDate: serverTimestamp(),
        status: "Applied",
        applicationType: "custom",
        customResumeText: generatedCustomResumeText,
      });

      toast({
        title: "Application Sent!",
        description: `Successfully applied for ${currentJobForCustomResume.title} with a custom resume.`,
        variant: "default",
        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      });
      setShowCustomResumeDialog(false);
      setGeneratedCustomResumeText(null);
      setCurrentJobForCustomResume(null);

    } catch (error) {
      console.error("Error saving/applying custom resume:", error);
      toast({ title: "Save/Apply Failed", description: "An error occurred.", variant: "destructive" });
    } finally {
      setIsSavingAndApplyingCustom(false);
    }
  };


  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => toast({ title: "Copied to Clipboard!", description: "Resume text copied." }))
      .catch(() => toast({ title: "Copy Failed", description: "Could not copy text.", variant: "destructive" }));
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
        {/* The "View Profile" button that was here has been removed as per previous request. Navigation to profile is via main Navbar. */}
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
                  onClick={() => openApplyWithProfileResumeDialog(job)} 
                  disabled={authLoading}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Apply with Profile Resume
                </Button>
                <Button
                  variant="outline"
                  className="w-full sm:flex-1 rounded-lg"
                  onClick={() => handleGenerateCustomResume(job)}
                  disabled={authLoading || (isGeneratingCustomResume && currentJobForCustomResume?.id === job.id)}
                >
                  {(isGeneratingCustomResume && currentJobForCustomResume?.id === job.id) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Palette className="mr-2 h-4 w-4" />}
                  Create Custom Resume
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {selectedJobForApplication && showApplyDialogForJobId === selectedJobForApplication.id && (
        <Dialog open={!!showApplyDialogForJobId} onOpenChange={(isOpen) => { if (!isOpen) { setShowApplyDialogForJobId(null); setSelectedFile(null); setFileDataUri(null); }}}>
          <DialogContent className="sm:max-w-md rounded-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center text-xl">
                <UploadCloud className="mr-2 h-5 w-5 text-primary"/> Apply for {selectedJobForApplication.title}
              </DialogTitle>
              <DialogDescription>
                Upload a new resume (PDF, DOCX, TXT) to update your profile and apply, or apply with your current profile resume if available.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="resume-upload-apply">Upload New Resume (Optional)</Label>
                    <Input
                    id="resume-upload-apply"
                    type="file"
                    accept=".pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.txt"
                    onChange={handleFileChangeForApplication}
                    className="rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                    />
                    {selectedFile && <p className="text-xs text-muted-foreground">Selected for upload: {selectedFile.name}</p>}
                </div>
            </div>
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button variant="outline" className="rounded-lg">Cancel</Button>
              </DialogClose>
              <Button
                onClick={handleApplyWithProfileResume}
                disabled={isApplying}
                className="rounded-lg"
              >
                {isApplying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                {isApplying ? "Submitting..." : (selectedFile ? "Update Profile & Apply" : "Apply with Profile Resume")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

       {showCustomResumeDialog && currentJobForCustomResume && (
        <Dialog open={showCustomResumeDialog} onOpenChange={(isOpen) => { if (!isOpen) { setShowCustomResumeDialog(false); setGeneratedCustomResumeText(null); setCurrentJobForCustomResume(null); }}}>
          <DialogContent className="sm:max-w-2xl rounded-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center text-xl">
                <Palette className="mr-2 h-5 w-5 text-primary" /> Custom Resume for {currentJobForCustomResume.title}
              </DialogTitle>
              <DialogDescription>
                Review the AI-generated custom resume below. You can save and apply with it.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 max-h-[60vh] overflow-y-auto">
              {isGeneratingCustomResume ? (
                <div className="flex flex-col items-center justify-center min-h-[200px]">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
                  <p className="text-muted-foreground">AI is tailoring your resume...</p>
                </div>
              ) : generatedCustomResumeText ? (
                <>
                  <Textarea
                    value={generatedCustomResumeText}
                    readOnly
                    rows={15}
                    className="w-full rounded-md bg-muted/50 p-3 text-sm"
                  />
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(generatedCustomResumeText)} className="mt-2 rounded-md">
                    <Copy className="mr-2 h-4 w-4" /> Copy Text
                  </Button>
                </>
              ) : (
                <p className="text-muted-foreground text-center min-h-[200px] flex items-center justify-center">
                  Could not generate custom resume content. Check if your profile has parsed resume data.
                </p>
              )}
            </div>
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button variant="outline" className="rounded-lg" onClick={() => {
                  setShowCustomResumeDialog(false);
                  setGeneratedCustomResumeText(null);
                  setCurrentJobForCustomResume(null);
                }}>Close</Button>
              </DialogClose>
              <Button
                onClick={handleSaveAndApplyCustomResume}
                disabled={isGeneratingCustomResume || !generatedCustomResumeText || isSavingAndApplyingCustom}
                className="rounded-lg"
              >
                {isSavingAndApplyingCustom ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {isSavingAndApplyingCustom ? "Applying..." : "Save & Apply with this Resume"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
