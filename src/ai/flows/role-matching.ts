'use server';

/**
 * @fileOverview A role matching AI agent that compares a resume with a job description and returns a fitment score and justification.
 *
 * - roleMatching - A function that handles the role matching process.
 * - RoleMatchingInput - The input type for the roleMatching function.
 * - RoleMatchingOutput - The return type for the roleMatching function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RoleMatchingInputSchema = z.object({
  resumeText: z.string().describe('The text content of the resume.'),
  jobDescriptionText: z.string().describe('The text content of the job description.'),
});
export type RoleMatchingInput = z.infer<typeof RoleMatchingInputSchema>;

const RoleMatchingOutputSchema = z.object({
  fitmentScore: z.number().describe('A score between 0 and 100 indicating how well the resume matches the job description.'),
  justification: z.string().describe('An explanation of why the resume received the given fitment score.'),
});
export type RoleMatchingOutput = z.infer<typeof RoleMatchingOutputSchema>;

export async function roleMatching(input: RoleMatchingInput): Promise<RoleMatchingOutput> {
  return roleMatchingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'roleMatchingPrompt',
  input: {schema: RoleMatchingInputSchema},
  output: {schema: RoleMatchingOutputSchema},
  prompt: `You are an expert HR assistant that compares a resume with a job description and returns a fitment score and justification.

  You will receive a resume and a job description. You will compare the two and return a fitment score between 0 and 100, and an explanation of why the resume received the given fitment score.

  Resume: {{{resumeText}}}

  Job Description: {{{jobDescriptionText}}}

  Respond in JSON format.
  `,
});

const roleMatchingFlow = ai.defineFlow(
  {
    name: 'roleMatchingFlow',
    inputSchema: RoleMatchingInputSchema,
    outputSchema: RoleMatchingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
