
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, type DocumentData } from "firebase/firestore";
import { PlusCircle, Edit3, Archive, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface JobRequisition extends DocumentData {
  id: string;
  title: string;
  location: string;
  status: "Open" | "Closed" | "Draft";
  createdAt: Date; 
}

export default function JobRequisitionsPage() {
  const [jobs, setJobs] = useState<JobRequisition[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const jobsCollectionRef = collection(db, "jobRequisitions");
        const q = query(jobsCollectionRef, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const fetchedJobs: JobRequisition[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedJobs.push({
            id: doc.id,
            title: data.title,
            location: data.location,
            status: data.status,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
          } as JobRequisition);
        });
        setJobs(fetchedJobs);
      } catch (error) {
        console.error("Error fetching job requisitions:", error);
        toast({
          title: "Error",
          description: "Could not fetch job requisitions.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [toast]);

  const getStatusBadgeVariant = (status: JobRequisition['status']) => {
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

  return (
    <div className="space-y-8 w-full max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
            <Archive className="mr-3 h-8 w-8 text-primary" />
            Job Requisitions
          </h1>
          <p className="text-muted-foreground">
            Manage all your company's job openings from one place.
          </p>
        </div>
        <Button asChild className="rounded-lg">
          <Link href="/dashboard/ats/jobs/create">
            <PlusCircle className="mr-2 h-4 w-4" /> Create New Job
          </Link>
        </Button>
      </div>

      <Card className="rounded-2xl shadow-xl">
        <CardHeader>
          <CardTitle>Current Job Openings</CardTitle>
          <CardDescription>
            View, edit, or manage candidates for existing job requisitions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-3 text-muted-foreground">Loading job requisitions...</p>
            </div>
          ) : jobs.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-card/50"> 
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium text-foreground">{job.title}</TableCell>
                    <TableCell className="text-muted-foreground">{job.location}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={getStatusBadgeVariant(job.status)}>{job.status}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild className="rounded-md">
                        <Link href={`/dashboard/ats/jobs/${job.id}`}> 
                          View/Edit <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          ) : (
            <div className="text-center py-10">
              <Archive className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-xl text-muted-foreground">No job requisitions found.</p>
              <p className="text-sm text-muted-foreground">
                Click "Create New Job" to add your first requisition.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
