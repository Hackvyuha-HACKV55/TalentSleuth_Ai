
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useToast } from "@/hooks/use-toast";
import { Briefcase, Loader2, Save } from "lucide-react";
import Link from "next/link";

export default function CreateJobRequisitionPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [salary, setSalary] = useState("");
  const [status, setStatus] = useState<"Open" | "Closed" | "Draft">("Draft");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

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
    setIsLoading(true);
    try {
      await addDoc(collection(db, "jobRequisitions"), {
        title,
        description,
        location,
        salary,
        status,
        createdAt: serverTimestamp(),
      });
      toast({
        title: "Job Requisition Created",
        description: `Successfully created job: ${title}.`,
      });
      router.push("/dashboard/ats/jobs");
    } catch (error) {
      console.error("Error creating job requisition:", error);
      toast({
        title: "Error",
        description: "Could not create job requisition. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 w-full py-6">
       <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
          <Briefcase className="mr-3 h-8 w-8 text-primary" />
          Create New Job Requisition
        </h1>
        <p className="text-muted-foreground">
          Define the details for a new job opening.
        </p>
      </div>

      <Card className="w-full rounded-lg shadow-lg bg-card border">
        <CardHeader className="p-6">
          <CardTitle className="text-2xl text-primary">Job Details</CardTitle>
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
              <Button type="submit" className="rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Save Job Requisition
                  </>
                )}
              </Button>
              <Button variant="outline" asChild className="rounded-lg">
                 <Link href="/dashboard/ats/jobs">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
