
'use server';

/**
 * @fileOverview Parses a resume and extracts key information.
 *
 * - parseResume - A function that handles the resume parsing process.
 * - ParseResumeInput - The input type for the parseResume function.
 * - ParseResumeOutput - The return type for the parseResume function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ParseResumeInputSchema = z.object({
  resumeText: z.string().describe('The text content of the resume to parse.'),
});
export type ParseResumeInput = z.infer<typeof ParseResumeInputSchema>;

const ParseResumeOutputSchema = z.object({
  name: z.string().describe('The full name of the candidate. If not found, return an empty string or "Not found".'),
  email: z.string().describe('The primary email address of the candidate. If not found, return an empty string or "Not found".'),
  phone: z.string().describe('The primary phone number of the candidate. If not found, return an empty string or "Not found".'),
  education: z.string().describe('A summary of the candidate\'s educational background. If not found, return an empty string or "Not found".'),
  experience: z.string().describe('A summary of the candidate\'s work experience. If not found, return an empty string or "Not found".'),
  skills: z.string().describe('A list or summary of the candidate\'s skills. If not found, return an empty string or "Not found".'),
  certifications: z.string().optional().describe('Any relevant certifications of the candidate. If not found, return an empty string or "Not found".'),
});
export type ParseResumeOutput = z.infer<typeof ParseResumeOutputSchema>;

export async function parseResume(input: ParseResumeInput): Promise<ParseResumeOutput> {
  return parseResumeFlow(input);
}

const parseResumePrompt = ai.definePrompt({
  name: 'parseResumePrompt',
  input: {schema: ParseResumeInputSchema},
  output: {schema: ParseResumeOutputSchema},
  prompt: `You are an AI assistant that extracts information from resumes.
Carefully analyze the "Resume Text" provided below. Your task is to extract the specified fields.

- Name: The full name of the candidate.
- Email: The primary email address.
- Phone: The primary phone number.
- Education: A summary of their educational background.
- Experience: A summary of their work experience.
- Skills: A list or summary of their skills.
- Certifications: Any relevant certifications.

Resume Text:
{{{resumeText}}}

If any piece of information cannot be found in the "Resume Text", or if the text does not appear to be a valid resume, return an empty string for that field or a concise "Not found" message. Do NOT return placeholder type names like 'string' or 'object'. Provide only the extracted information as per the output schema.
  `,
});

const parseResumeFlow = ai.defineFlow(
  {
    name: 'parseResumeFlow',
    inputSchema: ParseResumeInputSchema,
    outputSchema: ParseResumeOutputSchema,
  },
  async input => {
    const {output} = await parseResumePrompt(input);
    return output!;
  }
);

