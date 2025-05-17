
'use server';
/**
 * @fileOverview Analyzes the sentiment of a given text (e.g., an endorsement or review).
 *
 * - analyzeSentiment - A function that handles the sentiment analysis process.
 * - SentimentAnalysisInput - The input type for the function.
 * - SentimentAnalysisOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SentimentAnalysisInputSchema = z.object({
  textToAnalyze: z.string().describe('The text content of the endorsement, review, or any other text to be analyzed for sentiment.'),
});
export type SentimentAnalysisInput = z.infer<typeof SentimentAnalysisInputSchema>;

const SentimentAnalysisOutputSchema = z.object({
  sentiment: z.enum(["Positive", "Negative", "Neutral"]).describe('The overall sentiment detected in the text (Positive, Negative, or Neutral).'),
  justification: z.string().optional().describe('A brief explanation or key phrases from the text that support the sentiment classification.'),
});
export type SentimentAnalysisOutput = z.infer<typeof SentimentAnalysisOutputSchema>;

export async function analyzeSentiment(input: SentimentAnalysisInput): Promise<SentimentAnalysisOutput> {
  return sentimentAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'sentimentAnalysisPrompt',
  input: {schema: SentimentAnalysisInputSchema},
  output: {schema: SentimentAnalysisOutputSchema},
  prompt: `You are an AI expert in sentiment analysis.
Your task is to analyze the sentiment of the following text and classify it as "Positive", "Negative", or "Neutral".
Provide a brief justification for your classification, highlighting key phrases or aspects of the text that led to your decision.

Text to Analyze:
"{{{textToAnalyze}}}"

If the text is too short, ambiguous, or doesn't express a clear sentiment, classify it as "Neutral" and briefly explain why if possible in the justification.
Respond strictly according to the output schema.
`,
});

const sentimentAnalysisFlow = ai.defineFlow(
  {
    name: 'sentimentAnalysisFlow',
    inputSchema: SentimentAnalysisInputSchema,
    outputSchema: SentimentAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
