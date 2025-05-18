
'use server';
/**
 * @fileOverview Generates a custom, ATS-friendly resume text based on a student's digital resume and a job description.
 *
 * - generateCustomResume - A function that handles the custom resume generation process.
 * - GenerateCustomResumeInput - The input type for the function.
 * - GenerateCustomResumeOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { DigitalResume } from '@/context/candidate-context';

// Define the Zod schema for DigitalResume for use in the flow
// This should mirror the structure of the DigitalResume type
const DigitalResumeSchemaForFlow = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  skills: z.string().optional().describe("Comma-separated list of skills"),
  education: z.string().optional().describe("Summary of education"),
  experience: z.string().optional().describe("Summary of work experience"),
  summary: z.string().optional().describe("Professional summary if available from parsed resume"),
  certifications: z.string().optional(),
  // Add other fields from ParseResumeOutput / DigitalResume if they are relevant and consistently available
}).describe("The student's structured resume data.");


const GenerateCustomResumeInputSchema = z.object({
  jobDescriptionText: z.string().describe('The full text of the job description.'),
  studentDigitalResume: DigitalResumeSchemaForFlow.describe("The student's parsed digital resume data."),
});
export type GenerateCustomResumeInput = z.infer<typeof GenerateCustomResumeInputSchema>;

const GenerateCustomResumeOutputSchema = z.object({
  generatedResumeText: z.string().describe('The tailored, ATS-friendly resume text generated for the student and job.'),
});
export type GenerateCustomResumeOutput = z.infer<typeof GenerateCustomResumeOutputSchema>;

// This is the exported function that will be called by the client-side code
export async function generateCustomResume(input: GenerateCustomResumeInput): Promise<GenerateCustomResumeOutput> {
  return generateCustomResumeFlow(input);
}

const atsFriendlyTemplate = `
Name: {{studentDigitalResume.name}}
Email: {{studentDigitalResume.email}} | Phone: {{studentDigitalResume.phone}}

SUMMARY
{{!-- Generate a 2-3 sentence professional summary tailored to the Job Description, using information from studentDigitalResume.summary or experience. --}}
Based on my experience in {{{studentDigitalResume.experience}}} and skills in {{{studentDigitalResume.skills}}}, I am confident I can excel in this role.

EDUCATION
{{{studentDigitalResume.education}}}

WORK EXPERIENCE
{{{studentDigitalResume.experience}}}

SKILLS
{{{studentDigitalResume.skills}}}

CERTIFICATIONS
{{{studentDigitalResume.certifications}}}

References available on request.
`;

const prompt = ai.definePrompt({
  name: 'generateCustomResumePrompt',
  input: {schema: GenerateCustomResumeInputSchema},
  output: {schema: GenerateCustomResumeOutputSchema},
  prompt: `You are an expert resume writer specializing in creating ATS-friendly resumes tailored to specific job descriptions.
Your task is to generate a new resume text for a student based on their existing digital resume data and a target job description.
Follow the provided ATS-Friendly Resume Template as closely as possible. Ensure the output is plain text.

Job Description:
"""
{{{jobDescriptionText}}}
"""

Student's Digital Resume Data:
Name: {{studentDigitalResume.name}}
Email: {{studentDigitalResume.email}}
Phone: {{studentDigitalResume.phone}}
Skills: {{studentDigitalResume.skills}}
Education: {{studentDigitalResume.education}}
Experience: {{studentDigitalResume.experience}}
Summary (from parsed resume, if any): {{studentDigitalResume.summary}}
Certifications: {{studentDigitalResume.certifications}}

ATS-Friendly Resume Template to use as a guideline (adapt content from student's data to fit this structure and align with the Job Description):
"""
${atsFriendlyTemplate}
"""

Instructions:
1.  Fill in the template using the student's digital resume data.
2.  Prioritize information and skills from the student's data that are most relevant to the provided Job Description.
3.  Rephrase bullet points under Work Experience to actively showcase skills and achievements matching the job requirements.
4.  If certain information (e.g., LinkedIn, Address, specific extracurriculars, detailed education/experience formatting) is not directly available in the structured 'studentDigitalResume' object or is sparse, adapt the template gracefully. Focus on the core sections: Name, Contact, Summary (generated based on experience/skills if specific summary is missing), Education, Work Experience, Skills, Certifications.
5.  The final output should be ONLY the generated resume text as a single string in the "generatedResumeText" field. Do not include any preamble, explanation, or markdown formatting.
`,
});

const generateCustomResumeFlow = ai.defineFlow(
  {
    name: 'generateCustomResumeFlow',
    inputSchema: GenerateCustomResumeInputSchema,
    outputSchema: GenerateCustomResumeOutputSchema,
  },
  async (input: GenerateCustomResumeInput) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate custom resume. Output was null.');
    }
    return output;
  }
);
