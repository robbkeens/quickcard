'use server';
/**
 * @fileOverview An AI agent for generating professional taglines for digital business cards.
 *
 * - generateTagline - A function that generates a tagline based on job title and industry.
 * - TaglineSuggestionInput - The input type for the generateTagline function.
 * - TaglineSuggestionOutput - The return type for the generateTagline function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const TaglineSuggestionInputSchema = z.object({
  jobTitle: z.string().describe('The job title of the user.'),
  industry: z.string().describe('The industry of the user.'),
});
export type TaglineSuggestionInput = z.infer<typeof TaglineSuggestionInputSchema>;

const TaglineSuggestionOutputSchema = z.object({
  tagline: z.string().describe('The generated professional tagline.'),
});
export type TaglineSuggestionOutput = z.infer<typeof TaglineSuggestionOutputSchema>;

export async function generateTagline(input: TaglineSuggestionInput): Promise<TaglineSuggestionOutput> {
  return taglineSuggestionFlow(input);
}

const taglineSuggestionPrompt = ai.definePrompt({
  name: 'taglineSuggestionPrompt',
  input: {
    schema: z.object({
      jobTitle: z.string().describe('The job title of the user.'),
      industry: z.string().describe('The industry of the user.'),
    }),
  },
  output: {
    schema: z.object({
      tagline: z.string().describe('The generated professional tagline.'),
    }),
  },
  prompt: `You are a professional marketing expert specializing in creating taglines.

  Generate a professional tagline for a digital business card based on the user's job title and industry.

  Job Title: {{{jobTitle}}}
  Industry: {{{industry}}}

  Tagline:`,
});

const taglineSuggestionFlow = ai.defineFlow<
  typeof TaglineSuggestionInputSchema,
  typeof TaglineSuggestionOutputSchema
>(
  {
    name: 'taglineSuggestionFlow',
    inputSchema: TaglineSuggestionInputSchema,
    outputSchema: TaglineSuggestionOutputSchema,
  },
  async input => {
    const {output} = await taglineSuggestionPrompt(input);
    return output!;
  }
);
