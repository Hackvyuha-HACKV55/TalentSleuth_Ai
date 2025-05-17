
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, FileText, Users, GitCompareArrows, Search as SearchIcon, HelpCircle, Database, UploadCloud, Cpu, Eye, Target, ListChecks, Users2, Code2, Package, ArrowRight, GraduationCap } from "lucide-react"; // Replaced UserGraduate with GraduationCap
import Link from "next/link";

const coreFeatures = [
  {
    icon: <FileText className="h-8 w-8 text-primary" />,
    title: "AI Resume Parsing",
    description: "Extract key information from TXT, PDF, or DOCX resumes using Gemini.",
  },
  {
    icon: <Users className="h-8 w-8 text-primary" />,
    title: "Candidate Dossier",
    description: "View rich candidate profiles with experience, education, skills, and AI insights.",
  },
  {
    icon: <GitCompareArrows className="h-8 w-8 text-primary" />,
    title: "Role Fitment Matching",
    description: "Upload job descriptions to generate compatibility scores and justifications.",
  },
  {
    icon: <SearchIcon className="h-8 w-8 text-primary" />,
    title: "Simulated Profile Discovery",
    description: "AI infers data from platforms like LinkedIn or GitHub (if links are provided).",
  },
  {
    icon: <HelpCircle className="h-8 w-8 text-primary" />,
    title: "AI Interview Questions",
    description: "Automatically create role- and skill-specific interview questions.",
  },
  {
    icon: <Database className="h-8 w-8 text-primary" />,
    title: "Firestore Data Persistence",
    description: "All candidate data is securely stored and synced with Firebase.",
  },
];

const howItWorksSteps = [
  { icon: <UploadCloud className="h-6 w-6 text-accent" />, step: "Upload a candidate's resume (Recruiter)" },
  { icon: <Cpu className="h-6 w-6 text-accent" />, step: "AI parses and extracts profile details" },
  { icon: <Eye className="h-6 w-6 text-accent" />, step: "View the candidate dossier and insights" },
  { icon: <Target className="h-6 w-6 text-accent" />, step: "Upload a job description for fitment scoring" },
  { icon: <ListChecks className="h-6 w-6 text-accent" />, step: "Generate personalized interview questions" },
];

const userScenarios = [
  {
    icon: <Users2 className="h-8 w-8 text-primary" />,
    title: "For Startups & Recruiters",
    description: "Screen multiple applicants quickly, detect inconsistencies, and automate first-round filtering.",
  },
  {
    icon: <GraduationCap className="h-8 w-8 text-primary" />, // Used GraduationCap
    title: "For Students & Job Seekers",
    description: "Easily find and apply for open positions directly through the platform.",
  },
  {
    icon: <Code2 className="h-8 w-8 text-primary" />,
    title: "For Tech Hiring",
    description: "Score developer resumes against job requirements and generate coding questions.",
  },
];

const comparisonFeatures = [
  { feature: "Resume Parsing", manual: false, talentsleuth: true },
  { feature: "Red Flag Detection", manual: false, talentsleuth: true },
  { feature: "Fitment Scoring", manual: false, talentsleuth: true },
  { feature: "Profile Discovery", manual: false, talentsleuth: true },
  { feature: "Auto Interview Questions", manual: false, talentsleuth: true },
  { feature: "Data Storage & Sync", manual: false, talentsleuth: true },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-40 bg-gradient-to-br from-background to-secondary/30">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-6 text-center">
            <div className="space-y-3">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-primary mb-4">
                TalentSleuth AI – Your Virtual Talent Analyst
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl mb-6">
                Streamline your hiring with AI-driven resume parsing, red flag detection, fitment analysis, and interview prep. Job seekers can find and apply for openings too!
              </p>
            </div>
            <div className="flex flex-col gap-3 min-[400px]:flex-row justify-center">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <Link href="/dashboard">
                  Recruiter Portal
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border-primary text-primary hover:bg-primary/10">
                <Link href="/student/login"> {/* Changed from /student/jobs to /student/login */}
                  Student Job Portal
                  <GraduationCap className="ml-2 h-5 w-5" /> {/* Used GraduationCap */}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Product Overview */}
      <section id="overview" className="w-full py-12 md:py-20 lg:py-28 bg-background">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-foreground mb-4">
              What is TalentSleuth AI?
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-lg/relaxed lg:text-base/relaxed xl:text-lg/relaxed">
              TalentSleuth AI empowers HR teams with intelligent automation: it parses resumes, detects red flags, evaluates job fitment, and generates tailored interview questions—all securely stored using Firebase Firestore. Students can discover and apply for relevant job openings. Save time, improve quality, and hire smarter.
            </p>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section id="features" className="w-full py-12 md:py-20 lg:py-28 bg-secondary/30">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm text-primary mb-2">
              Core Capabilities
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-foreground mb-3">
              Empowering Your Recruitment & Job Search
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mb-8">
              Discover how TalentSleuth AI can transform your talent acquisition strategy and help job seekers.
            </p>
          </div>
          <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 lg:max-w-none">
            {coreFeatures.map((feature) => (
              <Card key={feature.title} className="rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 bg-card h-full">
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

      {/* How It Works */}
      <section id="how-it-works" className="w-full py-12 md:py-20 lg:py-28 bg-background">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm text-primary mb-2">
              Simple Workflow
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-foreground mb-8">
              How It Works
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5 items-start">
            {howItWorksSteps.map((item, index) => (
              <div key={index} className="flex flex-col items-center text-center p-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground mb-3">
                  {item.icon}
                </div>
                <p className="font-semibold text-foreground">Step {index + 1}</p>
                <p className="text-sm text-muted-foreground">{item.step}</p>
              </div>
            ))}
             <div className="flex flex-col items-center text-center p-4 md:col-span-2 lg:col-start-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground mb-3">
                  <GraduationCap className="h-6 w-6 text-accent" /> {/* Used GraduationCap */}
                </div>
                <p className="font-semibold text-foreground">Student Apply</p>
                <p className="text-sm text-muted-foreground">Students find & apply for jobs</p>
              </div>
          </div>
        </div>
      </section>

      {/* User Scenarios */}
      <section id="user-scenarios" className="w-full py-12 md:py-20 lg:py-28 bg-secondary/30">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
             <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm text-primary mb-2">
              Use Cases
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-foreground mb-8">
              Who Benefits?
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3 items-stretch">
            {userScenarios.map((scenario) => (
              <Card key={scenario.title} className="rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 bg-card flex flex-col">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    {scenario.icon}
                    <CardTitle className="text-xl text-foreground">{scenario.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <CardDescription className="text-sm text-muted-foreground">{scenario.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section id="comparison" className="w-full py-12 md:py-20 lg:py-28 bg-background">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm text-primary mb-2">
              The Advantage
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-foreground mb-8">
              TalentSleuth AI vs. Manual Hiring
            </h2>
          </div>
          <div className="overflow-x-auto rounded-lg border shadow-md">
            <table className="min-w-full divide-y divide-border bg-card">
              <thead className="bg-muted/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Feature</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">Manual Hiring</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">TalentSleuth AI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {comparisonFeatures.map((item) => (
                  <tr key={item.feature}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{item.feature}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground text-center">
                      {item.manual ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : <X className="h-5 w-5 text-red-500 mx-auto" />}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground text-center">
                      {item.talentsleuth ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : <X className="h-5 w-5 text-red-500 mx-auto" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      
      {/* Plans & Usage Info */}
      <section id="pricing" className="w-full py-12 md:py-20 lg:py-28 bg-secondary/30">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm text-primary mb-2">
              Get Started
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-foreground mb-8">
              Plans & Usage
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="rounded-2xl shadow-xl border-2 border-primary hover:shadow-2xl transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Package className="h-8 w-8 text-primary" />
                  <CardTitle className="text-2xl text-primary">Free Plan</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground">Perfect for individuals and small teams starting out.</p>
                <ul className="list-disc list-inside space-y-1 text-sm text-foreground">
                  <li>Upload up to 5 resumes per month</li>
                  <li>Basic profile analysis</li>
                  <li>Fitment scoring for one job description</li>
                </ul>
                 <Button asChild className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg">
                  <Link href="/signup">Start for Free</Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="rounded-2xl shadow-lg border border-dashed hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                 <div className="flex items-center gap-3">
                  <Package className="h-8 w-8 text-accent" />
                  <CardTitle className="text-2xl text-accent">Pro Plan</CardTitle>
                </div>
                <CardDescription className="text-sm text-muted-foreground">Coming Soon!</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground">For growing teams and power users needing more.</p>
                <ul className="list-disc list-inside space-y-1 text-sm text-foreground">
                  <li>Unlimited uploads</li>
                  <li>Advanced red flag detection</li>
                  <li>AI-assisted interview prep</li>
                  <li>Team access</li>
                </ul>
                <Button disabled className="w-full mt-4 rounded-lg">Notify Me</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action Footer */}
      <section className="w-full py-12 md:py-24 lg:py-32 border-t bg-background">
        <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight text-primary mb-3">
              Ready to streamline your hiring process or find your next role?
            </h2>
            <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mb-6">
              Try TalentSleuth AI today and discover better hiring with AI or explore new career opportunities.
            </p>
          </div>
          <div className="mx-auto w-full max-w-sm space-y-2">
             <Button asChild size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                  <Link href="/signup">
                    Get Started with TalentSleuth AI <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
