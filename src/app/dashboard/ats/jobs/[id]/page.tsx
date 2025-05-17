
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/firebase";
import { doc, getDoc, type DocumentData } from "firebase/firestore";
import { ArrowLeft, Edit, Loader2, PackageOpen } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState, use } from "react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface JobRequisition extends DocumentData {
  id: string;
  title: string;
  description: string;
  location: string;
  salary?: string;
  status: "Open" | "Closed" | "Draft";
  createdAt: { seconds: number, nanoseconds: number } | Date; 
}

export default function JobRequisitionDetailPage() {
  const params = useParams();
  const jobId = params.id as string;
  const [job, setJob] = useState<JobRequisition | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (jobId) {
      const fetchJob = async () => {
        setLoading(true);
        try {
          const jobDocRef = doc(db, "jobRequisitions", jobId);
          const jobDocSnap = await getDoc(jobDocRef);

          if (jobDocSnap.exists()) {
            const data = jobDocSnap.data() as Omit<JobRequisition, 'id'>;
             // Handle Firestore timestamp conversion
            let createdAtDate = new Date(); // Default to now
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
            setJob(null); // Explicitly set to null if not found
          }
        } catch (error) {
          console.error("Error fetching job requisition:", error);
          toast({
            title: "Error",
            description: "Could not fetch job requisition details.",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      };
      fetchJob();
    } else {
        setLoading(false);
        toast({
            title: "Error",
            description: "Job ID is missing.",
            variant: "destructive",
        });
    }
  }, [jobId, toast]);

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

  if (loading) {
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
    if (!value) return null;
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
    <div className="space-y-8 w-full max-w-3xl mx-auto">
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
            {/* Add more details here as needed */}
        </CardContent>
      </Card>
    </div>
  );
}
