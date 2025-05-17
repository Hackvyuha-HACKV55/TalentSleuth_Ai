
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, addDoc, serverTimestamp, doc, getDoc, setDoc, orderBy, Timestamp } from "firebase/firestore";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Briefcase, CalendarDays, DollarSign, Loader2, MapPin, Send, CheckCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";
import type { UnifiedCandidate } from "@/context/candidate-context";

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
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchOpenJobs = async () => {
      setLoadingJobs(true);
      try {
        const jobsCollectionRef = collection(db, "jobRequisitions");
        const q = query(jobsCollectionRef, where("status", "==", "Open"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const fetchedJobs = querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as JobRequisition));
        setJobs(fetchedJobs);
      } catch (error) {
        console.error("Error fetching open job requisitions:", error);
        toast({
          title: "Error",
          description: "Could not fetch job openings. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoadingJobs(false);
      }
    };
    fetchOpenJobs();
  }, [toast]);

  const handleApply = async (job: JobRequisition) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in or sign up to apply for jobs.",
        variant: "destructive",
        action: <Button asChild><Link href="/login">Login</Link></Button>,
      });
      return;
    }

    setApplyingJobId(job.id);

    try {
      const applicationsQuery = query(
        collection(db, "jobApplications"),
        where("jobId", "==", job.id),
        where("candidateEmail", "==", user.email)
      );
      const existingApplicationsSnap = await getDocs(applicationsQuery);
      if (!existingApplicationsSnap.empty) {
        toast({
          title: "Already Applied",
          description: "You have already applied for this position.",
          variant: "default",
        });
        setApplyingJobId(null); 
        return;
      }

      let candidateId = "";
      let candidateName = user.displayName || user.email?.split('@')[0] || "Applicant";

      const candidatesQuery = query(collection(db, "candidates"), where("email", "==", user.email));
      const candidateSnap = await getDocs(candidatesQuery);

      if (!candidateSnap.empty) {
        candidateId = candidateSnap.docs[0].id;
        candidateName = candidateSnap.docs[0].data().name || candidateName;
      } else {
        const newCandidateRef = doc(collection(db, "candidates"));
        candidateId = newCandidateRef.id;
        const initials = candidateName.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase() || 'AP';
        const newCandidateData: Partial<UnifiedCandidate> = {
          id: candidateId,
          name: candidateName,
          email: user.email!,
          phone: "Not Specified",
          education: "Not Specified",
          experience: "Not Specified",
          skills: "Not Specified",
          certifications: undefined,
          role: "Applicant",
          avatarUrl: `https://placehold.co/80x80.png?text=${initials}`,
          resumeTextContent: "Profile auto-created via student job application.",
          topSkill: "Not Specified",
          fitScore: undefined,
        };
        await setDoc(newCandidateRef, newCandidateData);
         toast({
          title: "Profile Created",
          description: "A basic profile has been created for you.",
        });
      }

      await addDoc(collection(db, "jobApplications"), {
        jobId: job.id,
        jobTitle: job.title,
        candidateId: candidateId,
        candidateName: candidateName,
        candidateEmail: user.email,
        applicationDate: serverTimestamp(),
        status: "Applied",
        source: "Student Portal",
      });

      toast({
        title: "Application Sent!",
        description: `Successfully applied for ${job.title}.`,
        variant: "default",
        icon: <CheckCircle className="h-5 w-5 text-green-500" />
      });

    } catch (error) {
      console.error("Error applying for job:", error);
      toast({
        title: "Application Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
        icon: <AlertTriangle className="h-5 w-5 text-red-500" />
      });
    } finally {
      setApplyingJobId(null);
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
                  onClick={() => handleApply(job)}
                  disabled={authLoading || applyingJobId === job.id || !user}
                >
                  {applyingJobId === job.id ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  {applyingJobId === job.id ? "Applying..." : (user ? "Apply Now" : "Login to Apply")}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
