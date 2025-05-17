
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth-context";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap, UserPlus } from "lucide-react"; // Changed Briefcase to GraduationCap

export default function StudentSignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      toast({
        title: "Signup Failed",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    try {
      await signUp(email, password);
      toast({
        title: "Signup Successful",
        description: "Welcome! You can now explore and apply for jobs.",
      });
      router.push("/student/jobs"); // Redirect to student job portal
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Signup Failed",
        description: error.message || "Please try again.",
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
        <CardDescription>Join to find your next career opportunity.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
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
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg" disabled={isLoading}>
            {isLoading ? "Signing up..." : <> <UserPlus className="mr-2 h-4 w-4" /> Sign Up</>}
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
