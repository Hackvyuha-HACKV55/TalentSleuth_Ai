
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { parseResume, type ParseResumeOutput } from "@/ai/flows/resume-parsing";
import { useState, type ChangeEvent } from "react";
import { UploadCloud, Loader2, CheckCircle, User, Mail, Phone, BookOpen, Briefcase, Award, Sparkles, UserPlus } from "lucide-react";
import { useCandidateContext } from "@/context/candidate-context";
import Link from "next/link";

export function ResumeUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [resumeDataUri, setResumeDataUri] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ParseResumeOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [newlyAddedCandidateId, setNewlyAddedCandidateId] = useState<string | null>(null);
  const { toast } = useToast();
  const { addCandidate } = useCandidateContext();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"].includes(selectedFile.type)) {
        setFile(selectedFile);
        setParsedData(null); 
        setResumeDataUri(null);
        setNewlyAddedCandidateId(null);

        const reader = new FileReader();
        reader.onload = async (e) => {
          const dataUri = e.target?.result as string;
          setResumeDataUri(dataUri);
        };
        reader.onerror = () => {
          toast({
            title: "File Read Error",
            description: "Could not read the selected file.",
            variant: "destructive",
          });
          setFile(null);
          setResumeDataUri(null);
        }
        reader.readAsDataURL(selectedFile); 

      } else {
        toast({
          title: "Invalid File Type",
          description: "Please upload a DOCX, PDF, or TXT file.",
          variant: "destructive",
        });
        setFile(null);
        setResumeDataUri(null);
      }
    }
  };

  const handleParseResume = async () => {
    if (!file || !resumeDataUri) { 
      toast({
        title: "No File Selected or Ready",
        description: "Please select a resume file and wait for it to be ready for parsing.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setParsedData(null);
    setNewlyAddedCandidateId(null);

    try {
      const result = await parseResume({ resumeDataUri }); 
      setParsedData(result);
      
      // Attempt to add candidate to context (and Firestore)
      if (result.name && result.email) { // Check for essential info
        const newCandidate = await addCandidate(result, resumeDataUri);
        if (newCandidate && newCandidate.id) {
          setNewlyAddedCandidateId(newCandidate.id);
          // Toast message is handled by addCandidate in context
        } else {
           toast({ // If addCandidate fails or returns null
            title: "Failed to Add Candidate",
            description: `Could not save ${result.name} to the candidate pool.`,
            variant: "destructive",
          });
        }
      } else {
         toast({
          title: "Resume Parsing Completed",
          description: result.name ? `Extracted information for ${result.name}. Could not add to pool due to missing essential info (e.g. name or email).` : "AI attempted to parse the resume. Could not add to pool due to missing essential info.",
          variant: "default", // Or "warning" if you have such a variant
        });
      }

    } catch (error) {
      console.error("Error parsing resume or adding candidate:", error);
      toast({
        title: "Processing Error",
        description: "An error occurred during resume processing. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const ParsedDataItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value?: string | null }) => {
    if (!value || value.toLowerCase() === "not found" || value.trim() === "") return null;
    return (
      <div className="py-2 border-b border-border/60">
        <div className="flex items-start space-x-3">
          <Icon className="h-5 w-5 text-primary mt-1 shrink-0" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-md text-foreground whitespace-pre-wrap">{value}</p>
          </div>
        </div>
      </div>
    );
  };


  return (
    <Card className="w-full rounded-2xl shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl text-primary flex items-center">
          <Sparkles className="mr-2 h-6 w-6" /> AI Resume Parser
        </CardTitle>
        <CardDescription>
          Upload a resume (DOCX, PDF, TXT) to automatically extract key information and add the candidate to your database.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="resume-file" className="text-md font-medium text-foreground">Upload Resume File</Label>
          <div className="mt-2 flex items-center space-x-3">
            <Input
              id="resume-file"
              type="file"
              accept=".docx,.pdf,.txt"
              onChange={handleFileChange}
              className="flex-grow rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
            />
            <Button onClick={handleParseResume} disabled={!file || isLoading || !resumeDataUri} className="rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground">
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="mr-2 h-4 w-4" />
              )}
              {isLoading ? "Processing..." : "Parse & Add Candidate"}
            </Button>
          </div>
          {file && <p className="mt-2 text-sm text-muted-foreground">Selected file: {file.name}</p>}
        </div>

        {parsedData && (
          <Card className="bg-secondary/50 p-6 rounded-lg">
            <CardHeader className="p-0 mb-4 flex flex-row justify-between items-center">
              <CardTitle className="text-xl text-primary flex items-center">
                <CheckCircle className="mr-2 h-5 w-5" /> Parsing Results
              </CardTitle>
              {newlyAddedCandidateId && (
                <Button asChild variant="outline" size="sm" className="rounded-lg">
                  <Link href={`/dashboard/candidates/${newlyAddedCandidateId}`}>View Profile</Link>
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-0 space-y-1">
              <ParsedDataItem icon={User} label="Name" value={parsedData.name} />
              <ParsedDataItem icon={Mail} label="Email" value={parsedData.email} />
              <ParsedDataItem icon={Phone} label="Phone" value={parsedData.phone} />
              <ParsedDataItem icon={BookOpen} label="Education" value={parsedData.education} />
              <ParsedDataItem icon={Briefcase} label="Experience" value={parsedData.experience} />
              <ParsedDataItem icon={Sparkles} label="Skills" value={parsedData.skills} />
              <ParsedDataItem icon={Award} label="Certifications" value={parsedData.certifications} />
              {!newlyAddedCandidateId && parsedData.name && parsedData.email && (
                <p className="text-sm text-amber-600 pt-2">Candidate information extracted but not added to database due to an issue or missing critical fields during the final step.</p>
              )}
               {!parsedData.name && !parsedData.email && (
                <p className="text-sm text-muted-foreground pt-2">Could not extract essential information (Name, Email) to create a candidate profile.</p>
              )}
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
