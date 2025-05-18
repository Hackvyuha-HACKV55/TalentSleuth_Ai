
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth-context";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent, type ChangeEvent } from "react";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap, UserPlus, UploadCloud, Loader2 } from "lucide-react";
import { storage, db } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import { parseResume, type ParseResumeOutput } from "@/ai/flows/resume-parsing";
import { useCandidateContext } from "@/context/candidate-context";
import { generateResumeTextContent } from "@/lib/mock-data"; // Assuming this correctly generates text from ParseResumeOutput

export default function StudentSignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const { addCandidateToLocalState } = useCandidateContext();
  const router = useRouter();
  const { toast } = useToast();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];
      if (!allowedTypes.includes(file.type)) {
        toast({ title: "Invalid File Type", description: "Please upload a PDF, DOC, DOCX or TXT file.", variant: "destructive" });
        setResumeFile(null);
        return;
      }
      setResumeFile(file);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!fullName) {
      toast({ title: "Signup Failed", description: "Please enter your full name.", variant: "destructive" });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: "Signup Failed", description: "Passwords do not match.", variant: "destructive" });
      return;
    }
    if (!resumeFile) {
      toast({ title: "Signup Failed", description: "Please upload your resume.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await signUp(email, password);
      const user = userCredential.user;

      if (user && resumeFile) {
        let resumeUrl = "";
        let resumeDataUri: string | null = null;
        let parsedData: ParseResumeOutput;
        let parsingSuccessful = true;

        // 1. Upload resume to Firebase Storage
        try {
          const storageRef = ref(storage, `resumes/${user.uid}/${resumeFile.name}`);
          await uploadBytes(storageRef, resumeFile);
          resumeUrl = await getDownloadURL(storageRef);
        } catch (storageError) {
          console.error("Error uploading resume to Firebase Storage:", storageError);
          toast({ title: "Resume Upload Failed", description: "Could not upload your resume file. Please try again.", variant: "destructive" });
          setIsLoading(false);
          return; // Stop if resume upload fails
        }
        
        // Prepare Data URI for parsing
        try {
            const reader = new FileReader();
            resumeDataUri = await new Promise<string>((resolve, reject) => {
              reader.onload = (e) => resolve(e.target?.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(resumeFile);
            });
        } catch (readError) {
            console.error("Error reading resume file for parsing:", readError);
            // Proceed with default parsedData, parsingSuccessful will be false
            parsingSuccessful = false;
        }


        // 2. Parse Resume (if data URI was prepared)
        if (resumeDataUri) {
            try {
              parsedData = await parseResume({ resumeDataUri });
            } catch (parseError) {
              console.error("Error parsing resume during signup:", parseError);
              parsingSuccessful = false;
              parsedData = { // Default structure on parsing failure
                name: fullName, email: user.email || "", phone: "N/A",
                education: "N/A (Parsing Failed)", experience: "N/A (Parsing Failed)", skills: "N/A (Parsing Failed)", certifications: "N/A (Parsing Failed)"
              };
            }
        } else {
             parsingSuccessful = false;
             parsedData = { // Default structure if file reading failed
                name: fullName, email: user.email || "", phone: "N/A",
                education: "N/A (File Read Issue)", experience: "N/A (File Read Issue)", skills: "N/A (File Read Issue)", certifications: "N/A (File Read Issue)"
             };
        }


        // 3. Create Candidate Profile in Firestore
        const candidateDocRef = doc(db, "candidates", user.uid); // Use UID as document ID
        const candidateData = {
          id: user.uid, // Document ID is user.uid
          uid: user.uid, // Store uid also as a field
          name: fullName,
          email: user.email,
          resumeUrl: resumeUrl, // From Storage
          digitalResume: parsedData, // From Genkit (or default if failed)
          resumeTextContent: generateResumeTextContent(parsedData),
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          avatarUrl: `https://placehold.co/80x80.png?text=${fullName.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase()}`,
          role: parsedData?.experience?.split('\\n')[0]?.trim() || "Student Applicant", // Basic role from experience
          topSkill: parsedData?.skills?.split(',')[0]?.trim() || "Awaiting Skills", // Basic top skill
          // Initialize other fields from UnifiedCandidate as needed (phone, etc. are covered by parsedData)
        };

        await setDoc(candidateDocRef, candidateData);
        addCandidateToLocalState(candidateData as any);

        if (parsingSuccessful) {
          toast({
            title: "Signup Successful!",
            description: "Your profile is created. You can now explore and apply for jobs.",
          });
        } else {
          toast({
            title: "Account Created with Issues",
            description: "Your account is set up, but resume parsing failed. Some profile details might be incomplete. You can try updating your resume later.",
            variant: "default", 
            duration: 7000,
          });
        }
        router.push("/student/jobs");
      } else {
        throw new Error("User creation failed or resume file missing after signup.");
      }

    } catch (error: any) {
      console.error("Error during student signup or profile creation:", error);
      toast({
        title: "Signup Failed",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-2xl rounded-2xl">
      <CardHeader className="space-y-1 text-center">
         <div className="flex justify-center items-center mb-4">
          <GraduationCap className="h-10 w-10 text-primary" />
        </div>
        <CardTitle className="text-3xl font-bold text-primary">Create Student Account</CardTitle>
        <CardDescription>Join to find your next career opportunity. Please provide your resume.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="rounded-lg"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="rounded-lg"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="rounded-lg"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="rounded-lg"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="resumeFile">Resume (PDF, DOC, DOCX, TXT)</Label>
            <Input
              id="resumeFile"
              type="file"
              accept=".pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
              onChange={handleFileChange}
              required
              className="rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
            />
            {resumeFile && <p className="text-xs text-muted-foreground">Selected: {resumeFile.name}</p>}
          </div>
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
            {isLoading ? "Creating Account..." : "Sign Up"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2 text-center pt-4">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/student/login" passHref legacyBehavior>
            <a className="font-semibold text-primary hover:underline">Log in</a>
          </Link>
        </p>
         <p className="text-sm text-muted-foreground mt-2">
          Are you a recruiter?{" "}
          <Link href="/login" passHref legacyBehavior>
            <a className="font-semibold text-primary hover:underline">Recruiter Login</a>
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
