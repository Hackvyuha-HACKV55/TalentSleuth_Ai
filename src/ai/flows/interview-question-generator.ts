
'use server';
/**
 * @fileOverview Generates interview questions based on a job title and candidate skills.
 *
 * - generateInterviewQuestions - A function that handles the interview question generation process.
 * - GenerateInterviewQuestionsInput - The input type for the function.
 * - GenerateInterviewQuestionsOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const QuestionCategorySchema = z.object({
  categoryName: z.string().describe('The name of the question category (e.g., "Technical", "Behavioral", "Situational").'),
  questions: z.array(z.string()).describe('A list of interview questions for this category.'),
});

const GenerateInterviewQuestionsInputSchema = z.object({
  jobTitle: z.string().describe('The job title for which to generate interview questions.'),
  candidateSkills: z.string().describe('A comma-separated list of key skills the candidate possesses relevant to the job title.'),
  questionCountPerCategory: z.number().optional().default(3).describe('Approximate number of questions to generate per category.'),
});
export type GenerateInterviewQuestionsInput = z.infer<typeof GenerateInterviewQuestionsInputSchema>;

const GenerateInterviewQuestionsOutputSchema = z.object({
  categories: z.array(QuestionCategorySchema).describe('An array of question categories, each containing a list of questions.'),
  notes: z.string().optional().describe('Any additional notes or advice for the interviewer.'),
});
export type GenerateInterviewQuestionsOutput = z.infer<typeof GenerateInterviewQuestionsOutputSchema>;

export async function generateInterviewQuestions(input: GenerateInterviewQuestionsInput): Promise<GenerateInterviewQuestionsOutput> {
  return generateInterviewQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'interviewQuestionGeneratorPrompt',
  input: {schema: GenerateInterviewQuestionsInputSchema},
  output: {schema: GenerateInterviewQuestionsOutputSchema},
  prompt: `You are an expert HR hiring manager and interviewer.
Your task is to generate a diverse set of interview questions for a candidate applying for the role of "{{jobTitle}}".
The candidate has the following key skills: "{{candidateSkills}}".

Please generate approximately {{questionCountPerCategory}} questions for each of the following categories:
1.  **Technical Questions**: Directly related to the candidate's skills and the job title's technical requirements.
2.  **Behavioral Questions**: To assess past behavior and predict future performance (e.g., STAR method questions).
3.  **Situational Questions**: To understand how the candidate might handle hypothetical work scenarios.
4.  **Problem-Solving Questions**: To evaluate analytical and critical thinking abilities.

For each category, provide a list of questions.
Optionally, include a brief 'notes' section with general advice for the interviewer conducting an interview for this role and skill set.

Structure your response according to the output schema, with a list of categories, each containing a categoryName and a list of questions.
Ensure the questions are relevant, insightful, and help assess the candidate's suitability for the "{{jobTitle}}" role, considering their "{{candidateSkills}}".
`,
});

const generateInterviewQuestionsFlow = ai.defineFlow(
  {
    name: 'generateInterviewQuestionsFlow',
    inputSchema: GenerateInterviewQuestionsInputSchema,
    outputSchema: GenerateInterviewQuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
