
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Search, FileText, BarChart2, AlertTriangle, Brain } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const features = [
  {
    icon: <FileText className="h-8 w-8 text-primary" />,
    title: "AI Resume Parsing",
    description: "Automatically extract key candidate information from resumes in seconds.",
  },
  {
    icon: <Search className="h-8 w-8 text-primary" />,
    title: "Profile Discovery",
    description: "Gain insights from candidates' online presence across various platforms.",
  },
  {
    icon: <BarChart2 className="h-8 w-8 text-primary" />,
    title: "Candidate Dossier",
    description: "View comprehensive candidate profiles with skills, experience, and AI scores.",
  },
  {
    icon: <AlertTriangle className="h-8 w-8 text-primary" />,
    title: "Red Flag Detection",
    description: "Identify inconsistencies and potential concerns early in the hiring process.",
  },
  {
    icon: <Brain className="h-8 w-8 text-primary" />,
    title: "One-Click Role Matching",
    description: "Instantly assess candidate fit for job roles with AI-powered scoring.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-br from-background to-secondary/30">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-primary">
                  TalentSleuth AI
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Your intelligent Virtual Talent Analyst. Streamline your hiring process with AI-powered resume parsing, candidate validation, and role-fitment recommendations.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                  <Link href="/dashboard">
                    Get Started
                    <CheckCircle className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                  <Link href="#features">
                    Learn More
                  </Link>
                </Button>
              </div>
            </div>
            <Image
              src="https://placehold.co/600x400.png"
              alt="TalentSleuth AI Platform Showcase"
              width={600}
              height={400}
              className="mx-auto aspect-video overflow-hidden rounded-2xl object-cover sm:w-full lg:order-last lg:aspect-square shadow-xl"
              data-ai-hint="abstract technology hiring"
            />
          </div>
        </div>
      </section>

      <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-background">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm text-primary">
                Key Features
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-foreground">
                Empowering Your Recruitment
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Discover how TalentSleuth AI can transform your talent acquisition strategy with cutting-edge AI technology.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 lg:max-w-none pt-12">
            {features.map((feature) => (
              <Card key={feature.title} className="rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 bg-card">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4">
                    {feature.icon}
                    <CardTitle className="text-xl text-foreground">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm text-muted-foreground">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32 border-t bg-secondary/30">
        <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight text-primary">
              Ready to Revolutionize Your Hiring?
            </h2>
            <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Join TalentSleuth AI today and experience the future of talent acquisition.
            </p>
          </div>
          <div className="mx-auto w-full max-w-sm space-y-2">
             <Button asChild size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                  <Link href="/signup">
                    Sign Up for Free
                  </Link>
                </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
