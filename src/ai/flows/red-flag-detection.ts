
'use server';

/**
 * @fileOverview This file defines a Genkit flow for detecting inconsistencies, frequent job switching, or incomplete/dated info between a candidate's resume and their online profiles.
 *
 * - detectRedFlags - A function that initiates the red flag detection process.
 * - DetectRedFlagsInput - The input type for the detectRedFlags function, including resume text and profile data.
 * - DetectRedFlagsOutput - The return type for the detectRedFlags function, providing a summary of detected issues.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectRedFlagsInputSchema = z.object({
  resumeText: z.string().describe('The text content of the candidate\'s resume, including summaries of education, experience, and skills.'),
  profileData: z.string().describe('A summary of the candidate\'s online profile data from sources like LinkedIn, GitHub, etc.'),
});

export type DetectRedFlagsInput = z.infer<typeof DetectRedFlagsInputSchema>;

const DetectRedFlagsOutputSchema = z.object({
  inconsistencies: z.string().describe('A summary of any significant discrepancies, frequent job switching patterns, or notably incomplete/dated information detected between the resume and online profiles.'),
  flagged: z.boolean().describe('Whether any red flags (discrepancies, concerning job history, very outdated info) were detected.'),
});

export type DetectRedFlagsOutput = z.infer<typeof DetectRedFlagsOutputSchema>;

export async function detectRedFlags(input: DetectRedFlagsInput): Promise<DetectRedFlagsOutput> {
  return detectRedFlagsFlow(input);
}

const redFlagDetectionPrompt = ai.definePrompt({
  name: 'redFlagDetectionPrompt',
  input: {schema: DetectRedFlagsInputSchema},
  output: {schema: DetectRedFlagsOutputSchema},
  prompt: `You are an expert HR analyst tasked with identifying potential red flags by comparing a candidate's resume with their online profiles.

  Review the following information:
  Resume Text (summary of education, experience, skills): {{{resumeText}}}
  Online Profile Data: {{{profileData}}}

  Analyze for:
  1.  Significant discrepancies between the resume and online profiles (e.g., different job titles for the same period, unmentioned major projects).
  2.  Patterns of frequent job switching that might be concerning (e.g., multiple jobs within a short period without clear progression).
  3.  Notably incomplete or very outdated information on either the resume or critical online profiles (e.g., a LinkedIn profile not updated in many years while the resume claims recent activity).

  Based on this analysis, identify and summarize any such red flags in the 'inconsistencies' field.
  Set the 'flagged' field to true if any significant red flags are detected. Otherwise, set it to false.
  If no significant issues are found, state that clearly in the 'inconsistencies' field.
  `,
});

const detectRedFlagsFlow = ai.defineFlow(
  {
    name: 'detectRedFlagsFlow',
    inputSchema: DetectRedFlagsInputSchema,
    outputSchema: DetectRedFlagsOutputSchema,
  },
  async input => {
    const {output} = await redFlagDetectionPrompt(input);
    return output!;
  }
);
