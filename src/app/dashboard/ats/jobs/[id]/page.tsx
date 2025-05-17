
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { db } from "@/lib/firebase";
import { doc, getDoc, type DocumentData, collection, addDoc, serverTimestamp, query, where, getDocs, Timestamp, orderBy } from "firebase/firestore";
import { ArrowLeft, Edit, Loader2, PackageOpen, UserPlus, Users } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState, use } from "react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCandidateContext, type UnifiedCandidate } from "@/context/candidate-context";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface JobRequisition extends DocumentData {
  id: string;
  title: string;
  description: string;
  location: string;
  salary?: string;
  status: "Open" | "Closed" | "Draft";
  createdAt: { seconds: number, nanoseconds: number } | Date;
}

interface JobApplication extends DocumentData {
    id: string;
    jobId: string;
    jobTitle: string;
    candidateId: string;
    candidateName: string;
    applicationDate: Timestamp;
    status: string;
}

export default function JobRequisitionDetailPage() {
  const params = useParams();
  const jobId = params.id as string;
  const [job, setJob] = useState<JobRequisition | null>(null);
  const [applicants, setApplicants] = useState<JobApplication[]>([]);
  const [loadingJob, setLoadingJob] = useState(true);
  const [loadingApplicants, setLoadingApplicants] = useState(true);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | undefined>(undefined);
  const [isAddingApplicant, setIsAddingApplicant] = useState(false);

  const { toast } = useToast();
  const { candidates: allCandidatesFromContext } = useCandidateContext();

  useEffect(() => {
    if (jobId) {
      const fetchJob = async () => {
        setLoadingJob(true);
        try {
          const jobDocRef = doc(db, "jobRequisitions", jobId);
          const jobDocSnap = await getDoc(jobDocRef);

          if (jobDocSnap.exists()) {
            const data = jobDocSnap.data() as Omit<JobRequisition, 'id'>;
            let createdAtDate = new Date();
            if (data.createdAt && typeof (data.createdAt as any).seconds === 'number') {
                createdAtDate = new Date((data.createdAt as any).seconds * 1000);
            } else if (data.createdAt instanceof Date) {
                createdAtDate = data.createdAt;
            }
            setJob({
                id: jobDocSnap.id,
                ...data,
                createdAt: createdAtDate
            });
          } else {
            toast({
              title: "Error",
              description: "Job requisition not found.",
              variant: "destructive",
            });
            setJob(null);
          }
        } catch (error) {
          console.error("Error fetching job requisition:", error);
          toast({
            title: "Error",
            description: "Could not fetch job requisition details.",
            variant: "destructive",
          });
        } finally {
          setLoadingJob(false);
        }
      };

      const fetchApplicants = async () => {
        setLoadingApplicants(true);
        try {
            const q = query(collection(db, "jobApplications"), where("jobId", "==", jobId), orderBy("applicationDate", "desc"));
            const querySnapshot = await getDocs(q);
            const fetchedApplicants = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as JobApplication));
            setApplicants(fetchedApplicants);
        } catch (error) {
            console.error("Error fetching applicants for job:", error);
            toast({
                title: "Error",
                description: "Could not fetch applicants for this job.",
                variant: "destructive",
            });
        } finally {
            setLoadingApplicants(false);
        }
      };

      fetchJob();
      fetchApplicants();
    } else {
        setLoadingJob(false);
        setLoadingApplicants(false);
        toast({
            title: "Error",
            description: "Job ID is missing.",
            variant: "destructive",
        });
    }
  }, [jobId, toast]);

  const handleAddApplicant = async () => {
    if (!selectedCandidateId || !job) {
        toast({ title: "Selection Missing", description: "Please select a candidate.", variant: "destructive" });
        return;
    }
    const selectedCandidate = allCandidatesFromContext.find(c => c.id === selectedCandidateId);
    if (!selectedCandidate) {
        toast({ title: "Candidate Error", description: "Selected candidate not found.", variant: "destructive" });
        return;
    }

    // Check if candidate already applied
    if (applicants.some(app => app.candidateId === selectedCandidateId)) {
        toast({ title: "Already Applied", description: `${selectedCandidate.name} has already been added as an applicant for this job.`, variant: "default" });
        return;
    }

    setIsAddingApplicant(true);
    try {
        const newApplicationRef = await addDoc(collection(db, "jobApplications"), {
            jobId: job.id,
            jobTitle: job.title,
            candidateId: selectedCandidate.id,
            candidateName: selectedCandidate.name,
            applicationDate: serverTimestamp(),
            status: "Applied"
        });
        // Optimistically add or re-fetch applicants
        const newApplicantData: JobApplication = {
            id: newApplicationRef.id, // Placeholder, actual ID from ref
            jobId: job.id,
            jobTitle: job.title,
            candidateId: selectedCandidate.id,
            candidateName: selectedCandidate.name,
            applicationDate: Timestamp.now(), // Approximate, server will set final
            status: "Applied"
        };
        setApplicants(prev => [newApplicantData, ...prev.filter(app => app.id !== newApplicationRef.id)]); // Avoid duplicates if re-fetched quickly

        // Re-fetch applicants to get accurate data
        const q = query(collection(db, "jobApplications"), where("jobId", "==", jobId), orderBy("applicationDate", "desc"));
        const querySnapshot = await getDocs(q);
        const fetchedApplicants = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as JobApplication));
        setApplicants(fetchedApplicants);


        toast({ title: "Applicant Added", description: `${selectedCandidate.name} added as an applicant for ${job.title}.` });
        setSelectedCandidateId(undefined); // Reset select
    } catch (error) {
        console.error("Error adding applicant:", error);
        toast({ title: "Error", description: "Could not add applicant.", variant: "destructive" });
    } finally {
        setIsAddingApplicant(false);
    }
  };


  const getStatusBadgeVariant = (status?: JobRequisition['status']) => {
    switch (status) {
      case "Open":
        return "default";
      case "Closed":
        return "destructive";
      case "Draft":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getApplicationStatusBadgeVariant = (status?: JobApplication['status']) => {
    switch (status) {
      case "Applied": return "default";
      case "Screening": return "secondary";
      case "Interviewing": return "default"; // You might want a different color for 'Interviewing', e.g., primary
      case "Offered": return "default"; // Or success green
      case "Rejected": return "destructive";
      case "Hired": return "default"; // Or success green
      default: return "outline";
    }
  };

  if (loadingJob) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-xl text-muted-foreground">Loading job details...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] text-center">
        <PackageOpen className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold text-foreground mb-2">Job Requisition Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The job requisition you are looking for either does not exist or could not be loaded.
        </p>
        <Button asChild variant="outline" className="rounded-lg">
          <Link href="/dashboard/ats/jobs">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Job Requisitions
          </Link>
        </Button>
      </div>
    );
  }

  const DetailItem = ({ label, value, isHtml = false }: { label: string; value?: string | React.ReactNode; isHtml?: boolean }) => {
    if (!value && typeof value !== 'number') return null; // Allow 0 to be displayed
    return (
      <div className="py-3">
        <h3 className="text-sm font-medium text-muted-foreground mb-0.5">{label}</h3>
        {isHtml && typeof value === 'string' ? (
          <div className="text-md text-foreground whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: value }} />
        ) : (
          <p className="text-md text-foreground whitespace-pre-wrap">{value}</p>
        )}
      </div>
    );
  };


  return (
    <div className="space-y-8 w-full max-w-4xl mx-auto"> {/* Adjusted max-width */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
            <PackageOpen className="mr-3 h-8 w-8 text-primary" />
            Job Requisition Details
          </h1>
           <p className="text-muted-foreground">
            Viewing details for: <span className="font-semibold text-primary">{job.title}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild className="rounded-lg">
            <Link href="/dashboard/ats/jobs">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Jobs List
            </Link>
          </Button>
           <Button variant="default" className="rounded-lg" disabled> {/* Placeholder for edit */}
            <Edit className="mr-2 h-4 w-4" /> Edit Job (Soon)
          </Button>
        </div>
      </div>

      <Card className="w-full rounded-2xl shadow-xl">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl text-primary">{job.title}</CardTitle>
              <CardDescription>
                {job.location}
                {job.salary && ` | Salary: ${job.salary}`}
              </CardDescription>
            </div>
            <Badge variant={getStatusBadgeVariant(job.status)} className="text-sm px-3 py-1">
              {job.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
            <Separator className="my-4" />
            <DetailItem label="Full Job Description" value={job.description} />
            <Separator className="my-4" />
            <DetailItem label="Date Created" value={job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'N/A'} />
        </CardContent>
      </Card>

      <Card className="w-full rounded-2xl shadow-xl">
        <CardHeader>
            <CardTitle className="text-xl text-primary flex items-center">
                <Users className="mr-2 h-5 w-5" /> Applicants for this Job
            </CardTitle>
            <CardDescription>
                Manage candidates who have applied or been assigned to this role.
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="flex items-end gap-3">
                <div className="flex-grow space-y-1.5">
                    <Label htmlFor="candidate-select">Select Candidate to Add</Label>
                    <Select onValueChange={setSelectedCandidateId} value={selectedCandidateId}>
                        <SelectTrigger id="candidate-select" className="w-full rounded-lg">
                        <SelectValue placeholder="Choose a candidate..." />
                        </SelectTrigger>
                        <SelectContent>
                        {allCandidatesFromContext.filter(cand => cand.id && cand.name).map((candidate: UnifiedCandidate) => (
                            <SelectItem key={candidate.id!} value={candidate.id!}>
                            {candidate.name} ({candidate.role || 'N/A'})
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                </div>
                <Button onClick={handleAddApplicant} disabled={isAddingApplicant || !selectedCandidateId} className="rounded-lg">
                    {isAddingApplicant ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                    {isAddingApplicant ? "Adding..." : "Add Applicant"}
                </Button>
            </div>

            {loadingApplicants ? (
                <div className="flex justify-center items-center py-6">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <p className="ml-2 text-muted-foreground">Loading applicants...</p>
                </div>
            ) : applicants.length > 0 ? (
                 <div className="border rounded-lg overflow-hidden">
                    <Table>
                        <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead>Candidate Name</TableHead>
                            <TableHead>Application Date</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {applicants.map((app) => (
                            <TableRow key={app.id}>
                            <TableCell className="font-medium text-foreground">
                                <Link href={`/dashboard/candidates/${app.candidateId}`} className="hover:underline">
                                    {app.candidateName}
                                </Link>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                {app.applicationDate instanceof Timestamp ? app.applicationDate.toDate().toLocaleDateString() : 'N/A'}
                            </TableCell>
                            <TableCell className="text-center">
                                <Badge variant={getApplicationStatusBadgeVariant(app.status)}>{app.status}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <Button variant="outline" size="sm" className="rounded-md" disabled>
                                 Manage (Soon)
                                </Button>
                            </TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <p className="text-center text-muted-foreground py-6">No applicants have been added to this job yet.</p>
            )}
        </CardContent>
      </Card>

    </div>
  );
}
