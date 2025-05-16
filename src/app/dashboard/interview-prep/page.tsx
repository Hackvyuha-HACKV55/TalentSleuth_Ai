
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { generateInterviewQuestions, type GenerateInterviewQuestionsOutput, type GenerateInterviewQuestionsInput } from "@/ai/flows/interview-question-generator";
import { useState, type FormEvent } from "react";
import { Loader2, HelpCircle, ListChecks, Lightbulb } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function InterviewPrepPage() {
  const [jobTitle, setJobTitle] = useState("");
  const [candidateSkills, setCandidateSkills] = useState("");
  const [questionCount, setQuestionCount] = useState<number>(3);
  const [generatedResult, setGeneratedResult] = useState<GenerateInterviewQuestionsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!jobTitle || !candidateSkills) {
      toast({
        title: "Missing Information",
        description: "Please provide both job title and candidate skills.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    setGeneratedResult(null);
    try {
      const input: GenerateInterviewQuestionsInput = {
        jobTitle,
        candidateSkills,
        questionCountPerCategory: questionCount
      };
      const result = await generateInterviewQuestions(input);
      setGeneratedResult(result);
      toast({
        title: "Interview Questions Generated",
        description: "Review the questions below.",
      });
    } catch (error: any) {
      console.error("Error generating interview questions:", error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate interview questions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
          <HelpCircle className="mr-3 h-8 w-8 text-primary" />
          Interview Question Generator
        </h1>
        <p className="text-muted-foreground">
          Generate tailored interview questions using AI based on job title and candidate skills.
        </p>
      </div>

      <Card className="w-full rounded-2xl shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">Input Details</CardTitle>
          <CardDescription>
            Provide the job title and key skills of the candidate to generate relevant questions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input
                id="jobTitle"
                placeholder="e.g., Senior Software Engineer"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                required
                className="rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="candidateSkills">Candidate Skills (comma-separated)</Label>
              <Textarea
                id="candidateSkills"
                placeholder="e.g., React, Node.js, Python, AWS, Agile"
                value={candidateSkills}
                onChange={(e) => setCandidateSkills(e.target.value)}
                required
                rows={3}
                className="rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="questionCount">Questions per Category (approx.)</Label>
              <Input
                id="questionCount"
                type="number"
                min="1"
                max="10"
                value={questionCount}
                onChange={(e) => setQuestionCount(parseInt(e.target.value, 10))}
                className="rounded-lg w-32"
              />
            </div>
            <Button type="submit" className="w-full rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <ListChecks className="mr-2 h-4 w-4" /> Generate Questions
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex flex-col items-center justify-center text-center p-10">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg text-muted-foreground">AI is crafting questions...</p>
        </div>
      )}

      {generatedResult && (
        <Card className="rounded-2xl shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Generated Interview Questions</CardTitle>
            <CardDescription>For job title: <span className="font-semibold">{jobTitle}</span>, skills: <span className="font-semibold">{candidateSkills}</span></CardDescription>
          </CardHeader>
          <CardContent>
            {generatedResult.categories && generatedResult.categories.length > 0 ? (
              <Accordion type="multiple" defaultValue={generatedResult.categories.map(cat => cat.categoryName)} className="w-full">
                {generatedResult.categories.map((category, index) => (
                  <AccordionItem value={category.categoryName} key={index}>
                    <AccordionTrigger className="text-lg font-semibold hover:no-underline text-foreground">
                      {category.categoryName} ({category.questions.length} questions)
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
                        {category.questions.map((q, qIndex) => (
                          <li key={qIndex} className="ml-2">{q}</li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <p className="text-muted-foreground">No questions were generated in specific categories. Check raw output if available or try refining inputs.</p>
            )}
          </CardContent>
          {generatedResult.notes && (
            <CardFooter className="flex-col items-start gap-2 border-t pt-4 mt-4">
                <h3 className="text-md font-semibold text-primary flex items-center"><Lightbulb className="mr-2 h-5 w-5"/>Interviewer Notes:</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{generatedResult.notes}</p>
            </CardFooter>
          )}
        </Card>
      )}
    </div>
  );
}
