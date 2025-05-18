
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, FileText, Users, GitCompareArrows, Search as SearchIcon, HelpCircle, Database, UploadCloud, Cpu, Eye, Target, ListChecks, Users2, Archive as ATSIcon, Palette, FileSignature, ArrowRight, GraduationCap, Briefcase, Package, UserPlus } from "lucide-react"; // Added UserPlus
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
    icon: <GraduationCap className="h-8 w-8 text-primary" />,
    title: "Student Job Portal",
    description: "Students can view open jobs, upload resumes, and apply easily.",
  },
  {
    icon: <Palette className="h-8 w-8 text-primary" />,
    title: "AI Custom Resumes",
    description: "Students can generate AI-powered custom resumes tailored to specific job descriptions.",
  },
  {
    icon: <ATSIcon className="h-8 w-8 text-primary" />,
    title: "Recruiter ATS Tools",
    description: "Manage job requisitions, track applicants, and update application statuses.",
  },
  {
    icon: <Database className="h-8 w-8 text-primary" />,
    title: "Firestore Data Persistence",
    description: "All candidate, job, and application data is securely stored and synced with Firebase.",
  },
];

const howItWorksStepsRecruiter = [
  { icon: <UploadCloud className="h-7 w-7 text-primary-foreground" />, step: "Recruiters: Upload resumes or JDs" },
  { icon: <Cpu className="h-7 w-7 text-primary-foreground" />, step: "AI parses, analyzes, and scores" },
  { icon: <Eye className="h-7 w-7 text-primary-foreground" />, step: "View candidate dossiers & insights" },
  { icon: <ListChecks className="h-7 w-7 text-primary-foreground" />, step: "Manage jobs & track applications" },
];

const howItWorksStepsStudent = [
  { icon: <UserPlus className="h-7 w-7 text-primary-foreground" />, step: "Students: Sign Up & Upload Resume" },
  { icon: <SearchIcon className="h-7 w-7 text-primary-foreground" />, step: "Browse open job positions" },
  { icon: <FileSignature className="h-7 w-7 text-primary-foreground" />, step: "Apply with profile or custom AI resume" },
  { icon: <Target className="h-7 w-7 text-primary-foreground" />, step: "Track application status" },
];


const userScenarios = [
  {
    icon: <Briefcase className="h-8 w-8 text-primary" />,
    title: "For Startups & Recruiters",
    description: "Screen multiple applicants quickly, detect inconsistencies, manage job postings, and automate first-round filtering.",
  },
  {
    icon: <GraduationCap className="h-8 w-8 text-primary" />,
    title: "For Students & Job Seekers",
    description: "Sign up with your resume, explore open positions, and apply directly. Leverage AI to generate custom resumes tailored for specific jobs, increasing your chances of getting noticed.",
  },
  {
    icon: <Cpu className="h-8 w-8 text-primary" />,
    title: "For Tech Hiring",
    description: "Score developer resumes against job requirements and generate coding interview questions efficiently.",
  },
];

const comparisonFeatures = [
  { feature: "Resume Parsing", manual: false, talentsleuth: true },
  { feature: "Red Flag Detection", manual: false, talentsleuth: true },
  { feature: "Fitment Scoring", manual: false, talentsleuth: true },
  { feature: "Profile Discovery", manual: false, talentsleuth: true },
  { feature: "Auto Interview Questions", manual: false, talentsleuth: true },
  { feature: "Custom Resume Generation (Student)", manual: false, talentsleuth: true },
  { feature: "Basic ATS (Job Reqs & Apps)", manual: false, talentsleuth: true },
  { feature: "Data Storage & Sync", manual: false, talentsleuth: true },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Hero Section */}
      <section className="w-full py-16 md:py-28 lg:py-36 xl:py-48 bg-gradient-to-br from-background to-secondary/20">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-8 text-center">
            <div className="space-y-4">
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl xl:text-6xl/none text-primary mb-6">
                TalentSleuth AI – Your Virtual Talent Analyst
              </h1>
              <p className="mx-auto max-w-[750px] text-muted-foreground md:text-xl lg:text-lg xl:text-xl mb-8">
                Streamline your hiring with AI-driven resume parsing, fitment analysis, and interview prep. Job seekers can find and apply for openings, even generating custom resumes!
              </p>
            </div>
            <div className="flex flex-col gap-4 min-[400px]:flex-row justify-center">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/80 text-primary-foreground rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 py-3 px-8 text-lg">
                <Link href="/dashboard">
                  Recruiter Portal
                  <ArrowRight className="ml-2.5 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-primary text-primary hover:bg-primary/10 py-3 px-8 text-lg">
                <Link href="/student/login">
                  Student Job Portal
                  <GraduationCap className="ml-2.5 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Product Overview */}
      <section id="overview" className="w-full py-16 md:py-24 lg:py-32 bg-background">
        <div className="container px-4 md:px-6 space-y-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground mb-4">
              What is TalentSleuth AI?
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-lg/relaxed lg:text-base/relaxed xl:text-lg/relaxed">
              TalentSleuth AI empowers HR teams with intelligent automation: it parses resumes, detects red flags, evaluates job fitment, and generates tailored interview questions—all securely stored using Firebase Firestore. Students can discover job opportunities, apply seamlessly, and even leverage AI to create custom resumes for specific roles. Save time, improve quality, and hire smarter.
            </p>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section id="features" className="w-full py-16 md:py-24 lg:py-32 bg-secondary/20">
        <div className="container px-4 md:px-6 space-y-10">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="inline-block rounded-lg bg-muted px-4 py-1.5 text-sm font-medium text-primary mb-3">
              Core Capabilities
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-5xl text-foreground mb-4">
              Empowering Your Recruitment & Job Search
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mb-10">
              Discover how TalentSleuth AI can transform your talent acquisition strategy and help job seekers.
            </p>
          </div>
          <div className="mx-auto grid max-w-5xl items-start gap-10 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 lg:max-w-none">
            {coreFeatures.map((feature) => (
              <Card key={feature.title} className="rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 bg-card h-full border border-border/50">
                <CardHeader className="pb-4 items-center text-center space-y-3">
                  <div className="p-3 rounded-full bg-primary/10 inline-block">
                     {feature.icon}
                  </div>
                  <CardTitle className="text-xl text-foreground">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-sm text-muted-foreground">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="w-full py-16 md:py-24 lg:py-32 bg-background">
        <div className="container px-4 md:px-6 space-y-16">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <div className="inline-block rounded-lg bg-muted px-4 py-1.5 text-sm font-medium text-primary mb-3">
              Simple Workflows
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-5xl text-foreground mb-10">
              How It Works for Recruiters & Students
            </h2>
          </div>
          
          <div>
            <h3 className="text-2xl font-semibold tracking-tight text-center text-primary mb-8">For Recruiters</h3>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 items-start">
              {howItWorksStepsRecruiter.map((item, index) => (
                <div key={`recruiter-${index}`} className="flex flex-col items-center text-center p-4 space-y-3">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground mb-4 shadow-md">
                    {item.icon}
                  </div>
                  <p className="font-semibold text-foreground text-lg">Step {index + 1}</p>
                  <p className="text-sm text-muted-foreground">{item.step}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-semibold tracking-tight text-center text-primary mb-8 mt-12">For Students</h3>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 items-start">
              {howItWorksStepsStudent.map((item, index) => (
                <div key={`student-${index}`} className="flex flex-col items-center text-center p-4 space-y-3">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground mb-4 shadow-md">
                    {item.icon}
                  </div>
                  <p className="font-semibold text-foreground text-lg">Step {index + 1}</p>
                  <p className="text-sm text-muted-foreground">{item.step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* User Scenarios */}
      <section id="user-scenarios" className="w-full py-16 md:py-24 lg:py-32 bg-secondary/20">
        <div className="container px-4 md:px-6 space-y-10">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
             <div className="inline-block rounded-lg bg-muted px-4 py-1.5 text-sm font-medium text-primary mb-3">
              Use Cases
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-5xl text-foreground mb-10">
              Who Benefits?
            </h2>
          </div>
          <div className="grid gap-10 md:grid-cols-3 items-stretch">
            {userScenarios.map((scenario) => (
              <Card key={scenario.title} className="rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 bg-card flex flex-col border border-border/50">
                <CardHeader className="items-center text-center space-y-3">
                   <div className="p-3 rounded-full bg-primary/10 inline-block">
                    {scenario.icon}
                   </div>
                  <CardTitle className="text-xl text-foreground">{scenario.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow text-center">
                  <CardDescription className="text-sm text-muted-foreground">{scenario.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section id="comparison" className="w-full py-16 md:py-24 lg:py-32 bg-background">
        <div className="container px-4 md:px-6 space-y-10">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <div className="inline-block rounded-lg bg-muted px-4 py-1.5 text-sm font-medium text-primary mb-3">
              The Advantage
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-5xl text-foreground mb-10">
              TalentSleuth AI vs. Manual Hiring
            </h2>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-border/50 shadow-xl">
            <table className="min-w-full divide-y divide-border bg-card">
              <thead className="bg-muted/50">
                <tr>
                  <th scope="col" className="px-8 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Feature</th>
                  <th scope="col" className="px-8 py-4 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Manual Hiring</th>
                  <th scope="col" className="px-8 py-4 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">TalentSleuth AI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {comparisonFeatures.map((item) => (
                  <tr key={item.feature} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-8 py-4 whitespace-nowrap text-sm font-medium text-foreground">{item.feature}</td>
                    <td className="px-8 py-4 whitespace-nowrap text-sm text-muted-foreground text-center">
                      {item.manual ? <Check className="h-6 w-6 text-green-500 mx-auto" /> : <X className="h-6 w-6 text-red-500 mx-auto" />}
                    </td>
                    <td className="px-8 py-4 whitespace-nowrap text-sm text-muted-foreground text-center">
                      {item.talentsleuth ? <Check className="h-6 w-6 text-green-500 mx-auto" /> : <X className="h-6 w-6 text-red-500 mx-auto" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      
      {/* Plans & Usage Info */}
      <section id="pricing" className="w-full py-16 md:py-24 lg:py-32 bg-secondary/20">
        <div className="container px-4 md:px-6 space-y-10">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <div className="inline-block rounded-lg bg-muted px-4 py-1.5 text-sm font-medium text-primary mb-3">
              Get Started
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-5xl text-foreground mb-10">
              Plans & Usage
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-10 max-w-4xl mx-auto">
            <Card className="rounded-2xl shadow-xl border-2 border-primary hover:shadow-2xl transition-shadow duration-300 bg-card">
              <CardHeader className="items-center text-center pt-8 pb-4 space-y-3">
                <div className="p-4 rounded-full bg-primary/10 inline-block">
                  <Package className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-2xl text-primary font-semibold">Free Plan (Recruiters & Students)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 px-8 text-center">
                <p className="text-muted-foreground">Perfect for individuals, small teams, and students.</p>
                <ul className="list-disc list-inside space-y-1.5 text-sm text-foreground text-left pl-4">
                  <li>**Recruiters:** Upload up to 5 resumes per month, basic profile analysis, fitment scoring for one job, basic ATS.</li>
                  <li>**Students:** View all jobs, apply, generate unlimited custom resumes.</li>
                </ul>
                 <Button asChild className="w-full mt-6 bg-primary hover:bg-primary/80 text-primary-foreground rounded-xl py-3 text-base">
                  <Link href="/signup">Recruiter Signup</Link>
                </Button>
                 <Button asChild variant="outline" className="w-full mt-3 border-primary text-primary hover:bg-primary/10 rounded-xl py-3 text-base">
                  <Link href="/student/login">Student Portal</Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="rounded-2xl shadow-xl border border-border/50 hover:shadow-2xl transition-shadow duration-300 bg-card">
              <CardHeader className="items-center text-center pt-8 pb-4 space-y-3">
                 <div className="p-4 rounded-full bg-accent/10 inline-block">
                  <Cpu className="h-10 w-10 text-accent" />
                </div>
                <CardTitle className="text-2xl text-accent font-semibold">Pro Plan (Recruiters)</CardTitle>
                <CardDescription className="text-sm text-muted-foreground !mt-1">Coming Soon!</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 px-8 text-center">
                <p className="text-muted-foreground">For growing teams and power users needing more.</p>
                <ul className="list-disc list-inside space-y-1.5 text-sm text-foreground text-left pl-4">
                  <li>Unlimited resume uploads & parsing</li>
                  <li>Advanced red flag detection & insights</li>
                  <li>Full ATS features (Google Workspace integrations)</li>
                  <li>Team access & collaboration tools</li>
                </ul>
                <Button disabled className="w-full mt-6 rounded-xl py-3 text-base">Notify Me</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action Footer */}
      <section className="w-full py-16 md:py-28 lg:py-36 border-t border-border/30 bg-background">
        <div className="container grid items-center justify-center gap-6 px-4 text-center md:px-6">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl/tight text-primary mb-4">
              Ready to revolutionize your hiring or find your dream job?
            </h2>
            <p className="mx-auto max-w-[650px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mb-8">
              Try TalentSleuth AI today and discover better hiring with AI or explore new career opportunities.
            </p>
          </div>
          <div className="mx-auto w-full max-w-md space-y-3">
             <Button asChild size="lg" className="w-full bg-accent hover:bg-accent/80 text-accent-foreground rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 py-3 px-8 text-lg">
                  <Link href="/signup">
                    Get Started (Recruiters) <ArrowRight className="ml-2.5 h-5 w-5" />
                  </Link>
             </Button>
             <Button asChild variant="outline" size="lg" className="w-full border-primary text-primary hover:bg-primary/10 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 py-3 px-8 text-lg">
                  <Link href="/student/login">
                    Explore Jobs (Students) <GraduationCap className="ml-2.5 h-5 w-5" />
                  </Link>
             </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
