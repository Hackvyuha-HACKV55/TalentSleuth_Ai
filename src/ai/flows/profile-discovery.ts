// This file is machine-generated - DO NOT EDIT.

'use server';

/**
 * @fileOverview Summarizes candidate data from LinkedIn and GitHub using AI.
 *
 * - profileDiscovery - A function that handles the profile discovery process.
 * - ProfileDiscoveryInput - The input type for the profileDiscovery function.
 * - ProfileDiscoveryOutput - The return type for the profileDiscovery function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProfileDiscoveryInputSchema = z.object({
  name: z.string().describe("The candidate's name."),
  email: z.string().email().describe("The candidate's email address."),
});
export type ProfileDiscoveryInput = z.infer<typeof ProfileDiscoveryInputSchema>;

const ProfileDiscoveryOutputSchema = z.object({
  summary: z.string().describe('A summary of the candidate\s online presence and contributions from LinkedIn and GitHub.'),
});
export type ProfileDiscoveryOutput = z.infer<typeof ProfileDiscoveryOutputSchema>;

export async function profileDiscovery(input: ProfileDiscoveryInput): Promise<ProfileDiscoveryOutput> {
  return profileDiscoveryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'profileDiscoveryPrompt',
  input: {schema: ProfileDiscoveryInputSchema},
  output: {schema: ProfileDiscoveryOutputSchema},
  prompt: `Summarize candidate data from LinkedIn and GitHub for {{name}} ({{email}}).`,
});

const profileDiscoveryFlow = ai.defineFlow(
  {
    name: 'profileDiscoveryFlow',
    inputSchema: ProfileDiscoveryInputSchema,
    outputSchema: ProfileDiscoveryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
