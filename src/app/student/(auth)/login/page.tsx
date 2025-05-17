
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
import { GraduationCap, LogIn } from "lucide-react"; // Changed Briefcase to GraduationCap

export default function StudentLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      await signIn(email, password);
      toast({
        title: "Login Successful",
        description: "Welcome! You can now apply for jobs.",
      });
      router.push("/student/jobs"); // Redirect to student job portal
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Login Failed",
        description: error.message || "Please check your credentials and try again.",
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
        <CardTitle className="text-3xl font-bold text-primary">Student Portal Login</CardTitle>
        <CardDescription>Access job listings and apply for opportunities.</CardDescription>
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
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg" disabled={isLoading}>
            {isLoading ? "Logging in..." : <> <LogIn className="mr-2 h-4 w-4" /> Login </>}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2 text-center">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/student/signup" passHref legacyBehavior>
            <a className="font-semibold text-primary hover:underline">Sign up</a>
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
