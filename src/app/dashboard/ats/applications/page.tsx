
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, Timestamp, type DocumentData, doc, updateDoc } from "firebase/firestore";
import { ArrowUpDown, FileText as ApplicationsIcon, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

interface JobApplication extends DocumentData {
  id: string;
  jobId: string;
  jobTitle: string;
  candidateId: string;
  candidateName: string;
  applicationDate: Timestamp;
  status: "Applied" | "Screening" | "Interviewing" | "Offered" | "Hired" | "Rejected";
}

const APPLICATION_STATUSES: JobApplication['status'][] = ["Applied", "Screening", "Interviewing", "Offered", "Hired", "Rejected"];

export default function AllJobApplicationsPage() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc'); // Default to newest first
  const { toast } = useToast();
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  const fetchApplications = async (currentSortOrder: 'desc' | 'asc') => {
    setLoading(true);
    try {
      const applicationsCollectionRef = collection(db, "jobApplications");
      const q = query(applicationsCollectionRef, orderBy("applicationDate", currentSortOrder));
      const querySnapshot = await getDocs(q);
      const fetchedApplications: JobApplication[] = [];
      querySnapshot.forEach((doc) => {
        fetchedApplications.push({
          id: doc.id,
          ...doc.data(),
        } as JobApplication);
      });
      setApplications(fetchedApplications);
    } catch (error) {
      console.error("Error fetching job applications:", error);
      toast({
        title: "Error",
        description: "Could not fetch job applications.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications(sortOrder);
  }, [sortOrder, toast]);

  const toggleSortOrder = () => {
    setSortOrder(prevOrder => (prevOrder === 'desc' ? 'asc' : 'desc'));
  };

  const handleStatusUpdate = async (applicationId: string, newStatus: JobApplication['status']) => {
    setUpdatingStatusId(applicationId);
    try {
      const appDocRef = doc(db, "jobApplications", applicationId);
      await updateDoc(appDocRef, { status: newStatus });
      setApplications(prevApps => 
        prevApps.map(app => app.id === applicationId ? { ...app, status: newStatus } : app)
      );
      toast({
        title: "Status Updated",
        description: `Application status changed to ${newStatus}.`,
      });
    } catch (error) {
      console.error("Error updating application status:", error);
      toast({
        title: "Error",
        description: "Could not update application status.",
        variant: "destructive",
      });
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const getApplicationStatusBadgeVariant = (status?: JobApplication['status']) => {
    switch (status) {
      case "Applied": return "default";
      case "Screening": return "secondary";
      case "Interviewing": return "default"; // Consider a different color
      case "Offered": return "default"; // Olive for positive steps
      case "Hired": return "default"; // Strong olive for success
      case "Rejected": return "destructive";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-8 w-full py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
            <ApplicationsIcon className="mr-3 h-8 w-8 text-primary" />
            All Job Applications
          </h1>
          <p className="text-muted-foreground">
            View and manage all candidate applications across all job requisitions.
          </p>
        </div>
        <Button onClick={toggleSortOrder} variant="outline" className="rounded-lg">
          <ArrowUpDown className="mr-2 h-4 w-4" />
          Sort by Date: {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
        </Button>
      </div>

      <Card className="rounded-lg shadow-lg bg-card border">
        <CardHeader className="p-6">
          <CardTitle>Applications Overview</CardTitle>
          <CardDescription>
            Track the status of candidates in your hiring pipeline.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 md:p-6">
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-3 text-muted-foreground">Loading applications...</p>
            </div>
          ) : applications.length > 0 ? (
            <div className="border rounded-lg overflow-x-auto bg-card">
              <Table>
                <TableHeader className="bg-card/50">
                  <TableRow>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Candidate Name</TableHead>
                    <TableHead>Application Date</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((app) => (
                    <TableRow key={app.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium text-foreground">
                        <Link href={`/dashboard/ats/jobs/${app.jobId}`} className="hover:underline text-primary">
                            {app.jobTitle}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                         <Link href={`/dashboard/candidates/${app.candidateId}`} className="hover:underline text-primary">
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
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0 rounded-md"
                              disabled={updatingStatusId === app.id}
                            >
                              {updatingStatusId === app.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-lg">
                            <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {APPLICATION_STATUSES.map(status => (
                              <DropdownMenuItem
                                key={status}
                                onClick={() => handleStatusUpdate(app.id, status)}
                                disabled={app.status === status}
                                className="rounded-md"
                              >
                                Set to {status}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-10 bg-card rounded-lg p-6">
              <ApplicationsIcon className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-xl text-muted-foreground">No job applications found.</p>
              <p className="text-sm text-muted-foreground">
                As candidates apply or are added to jobs, they will appear here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

    