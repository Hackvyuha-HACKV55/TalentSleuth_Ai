
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, type DocumentData, Timestamp } from "firebase/firestore";
import { useRouter, useParams } from "next/navigation";
import { useState, type FormEvent, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Edit, Loader2, Save, PackageOpen, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface JobRequisition extends DocumentData {
  id: string;
  title: string;
  description: string;
  location: string;
  salary?: string;
  status: "Open" | "Closed" | "Draft";
}

export default function EditJobRequisitionPage() {
  const params = useParams();
  const jobId = params.id as string;
  const router = useRouter();
  const { toast } = useToast();

  const [job, setJob] = useState<JobRequisition | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [salary, setSalary] = useState("");
  const [status, setStatus] = useState<"Open" | "Closed" | "Draft">("Draft");
  
  const [isLoadingJob, setIsLoadingJob] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (jobId) {
      const fetchJob = async () => {
        setIsLoadingJob(true);
        try {
          const jobDocRef = doc(db, "jobRequisitions", jobId);
          const jobDocSnap = await getDoc(jobDocRef);
          if (jobDocSnap.exists()) {
            const jobData = { id: jobDocSnap.id, ...jobDocSnap.data() } as JobRequisition;
            setJob(jobData);
            setTitle(jobData.title);
            setDescription(jobData.description);
            setLocation(jobData.location);
            setSalary(jobData.salary || "");
            setStatus(jobData.status);
          } else {
            toast({ title: "Error", description: "Job requisition not found.", variant: "destructive" });
            router.push("/dashboard/ats/jobs");
          }
        } catch (error) {
          console.error("Error fetching job details:", error);
          toast({ title: "Error", description: "Could not fetch job details.", variant: "destructive" });
        } finally {
          setIsLoadingJob(false);
        }
      };
      fetchJob();
    } else {
        router.push("/dashboard/ats/jobs");
    }
  }, [jobId, router, toast]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!title || !description || !location) {
      toast({
        title: "Missing Information",
        description: "Please fill in Title, Description, and Location.",
        variant: "destructive",
      });
      return;
    }
    if (!job) return;

    setIsSaving(true);
    try {
      const jobDocRef = doc(db, "jobRequisitions", job.id);
      await updateDoc(jobDocRef, {
        title,
        description,
        location,
        salary,
        status,
        updatedAt: Timestamp.now(), // Add/Update updatedAt timestamp
      });
      toast({
        title: "Job Requisition Updated",
        description: `Successfully updated job: ${title}.`,
      });
      router.push(`/dashboard/ats/jobs/${job.id}`);
    } catch (error) {
      console.error("Error updating job requisition:", error);
      toast({
        title: "Error",
        description: "Could not update job requisition. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingJob) {
    return (
      <div className="w-full space-y-8 py-6">
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)]">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-xl text-muted-foreground">Loading job details for editing...</p>
        </div>
      </div>
    );
  }
  
  if (!job && !isLoadingJob) {
     return (
      <div className="w-full space-y-8 py-6">
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] text-center">
          <PackageOpen className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold text-foreground mb-2">Job Not Found</h2>
          <p className="text-muted-foreground mb-6">Could not load job to edit.</p>
          <Button asChild variant="outline" className="rounded-lg">
            <Link href="/dashboard/ats/jobs">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Job Requisitions
            </Link>
          </Button>
        </div>
      </div>
    );
  }


  return (
    <div className="space-y-8 w-full py-6">
       <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
          <Edit className="mr-3 h-8 w-8 text-primary" />
          Edit Job Requisition
        </h1>
        <p className="text-muted-foreground">
          Modify the details for the job opening: <span className="font-semibold text-primary">{job?.title}</span>
        </p>
      </div>

      <Card className="w-full rounded-lg shadow-lg bg-card border">
        <CardHeader className="p-6">
          <CardTitle className="text-2xl text-primary">Update Job Details</CardTitle>
          <CardDescription>
            Fields marked with * are required.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Senior Software Engineer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="rounded-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Job Description *</Label>
              <Textarea
                id="description"
                placeholder="Enter the full job description, responsibilities, and qualifications..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={8}
                className="rounded-lg"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  placeholder="e.g., New York, NY or Remote"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salary">Salary Range (Optional)</Label>
                <Input
                  id="salary"
                  placeholder="e.g., $100,000 - $120,000 per year"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  className="rounded-lg"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select value={status} onValueChange={(value: "Open" | "Closed" | "Draft") => setStatus(value)} required>
                <SelectTrigger id="status" className="w-full md:w-[200px] rounded-lg">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" className="rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Save Changes
                  </>
                )}
              </Button>
              <Button variant="outline" asChild className="rounded-lg">
                 <Link href={job ? `/dashboard/ats/jobs/${job.id}` : "/dashboard/ats/jobs"}>Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

    