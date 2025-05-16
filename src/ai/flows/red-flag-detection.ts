'use server';

/**
 * @fileOverview This file defines a Genkit flow for detecting inconsistencies between a candidate's resume and their online profiles.
 *
 * - detectRedFlags - A function that initiates the red flag detection process.
 * - DetectRedFlagsInput - The input type for the detectRedFlags function, including resume text and profile data.
 * - DetectRedFlagsOutput - The return type for the detectRedFlags function, providing a summary of detected inconsistencies.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectRedFlagsInputSchema = z.object({
  resumeText: z.string().describe('The text content of the candidate\'s resume.'),
  profileData: z.string().describe('A summary of the candidate\'s online profile data.'),
});

export type DetectRedFlagsInput = z.infer<typeof DetectRedFlagsInputSchema>;

const DetectRedFlagsOutputSchema = z.object({
  inconsistencies: z.string().describe('A summary of any inconsistencies detected between the resume and online profiles.'),
  flagged: z.boolean().describe('Whether any red flags were detected.'),
});

export type DetectRedFlagsOutput = z.infer<typeof DetectRedFlagsOutputSchema>;

export async function detectRedFlags(input: DetectRedFlagsInput): Promise<DetectRedFlagsOutput> {
  return detectRedFlagsFlow(input);
}

const redFlagDetectionPrompt = ai.definePrompt({
  name: 'redFlagDetectionPrompt',
  input: {schema: DetectRedFlagsInputSchema},
  output: {schema: DetectRedFlagsOutputSchema},
  prompt: `You are an expert HR analyst tasked with identifying inconsistencies between a candidate's resume and their online profiles.

  Review the following information and determine if there are any significant discrepancies that could be considered red flags.
  Provide a summary of the inconsistencies and indicate whether any red flags were detected.

  Resume Text: {{{resumeText}}}
  Online Profile Data: {{{profileData}}}

  Based on the comparison, identify discrepancies and set the 'flagged' field to true if any red flags are detected. Otherwise, set it to false.
  Summarize your findings in the 'inconsistencies' field.
  `, // Modified prompt for better clarity and specific instructions.
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
