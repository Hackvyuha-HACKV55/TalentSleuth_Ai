
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
import { generateResumeTextContent } from "@/lib/mock-data";

export default function StudentSignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const { addCandidateToLocalState } = useCandidateContext(); // Use new context function
  const router = useRouter();
  const { toast } = useToast();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
      if (!allowedTypes.includes(file.type)) {
        toast({ title: "Invalid File Type", description: "Please upload a PDF, DOC, or DOCX file.", variant: "destructive" });
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
        // 1. Upload resume to Firebase Storage
        const storageRef = ref(storage, `resumes/${user.uid}/${resumeFile.name}`);
        await uploadBytes(storageRef, resumeFile);
        const resumeUrl = await getDownloadURL(storageRef);

        // 2. Parse Resume
        let parsedData: ParseResumeOutput | null = null;
        let resumeDataUri: string | null = null;
        try {
          const reader = new FileReader();
          resumeDataUri = await new Promise<string>((resolve, reject) => {
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(resumeFile);
          });
          parsedData = await parseResume({ resumeDataUri });
        } catch (parseError) {
          console.error("Error parsing resume during signup:", parseError);
          toast({ title: "Resume Parsing Issue", description: "Could not fully parse resume, but profile created.", variant: "default" });
          // Proceed with basic profile creation even if parsing fails
          parsedData = { // provide default structure
            name: fullName, email: user.email || "", phone: "",
            education: "", experience: "", skills: "", certifications: ""
          };
        }

        // 3. Create Candidate Profile in Firestore
        const candidateDocRef = doc(db, "candidates", user.uid); // Use UID as document ID for candidates
        const candidateData = {
          id: user.uid,
          uid: user.uid,
          name: fullName,
          email: user.email,
          resumeUrl: resumeUrl,
          digitalResume: parsedData,
          resumeTextContent: parsedData ? generateResumeTextContent(parsedData) : "Resume not parsed.",
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          // Initialize other fields from UnifiedCandidate as needed
          phone: parsedData?.phone || "",
          education: parsedData?.education || "",
          experience: parsedData?.experience || "",
          skills: parsedData?.skills || "",
          certifications: parsedData?.certifications || "",
          avatarUrl: `https://placehold.co/80x80.png?text=${fullName.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase()}`,
          role: parsedData?.experience?.split('\\n')[0]?.trim() || "Student Applicant",
          topSkill: parsedData?.skills?.split(',')[0]?.trim() || "Awaiting Skills",
        };

        await setDoc(candidateDocRef, candidateData);
        addCandidateToLocalState(candidateData as any); // Add to context

        toast({
          title: "Signup Successful!",
          description: "Your profile is created. You can now explore and apply for jobs.",
        });
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
            <Label htmlFor="resumeFile">Resume (PDF, DOC, DOCX)</Label>
            <Input
              id="resumeFile"
              type="file"
              accept=".pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
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
      <CardFooter className="flex flex-col space-y-2 text-center">
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
