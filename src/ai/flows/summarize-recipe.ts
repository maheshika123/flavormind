// Summarizes a recipe into a few bullet points for a quick overview.
'use server';

/**
 * @fileOverview Summarizes a given recipe into a few bullet points for a quick and easy overview.
 *
 * - summarizeRecipe - A function that handles the recipe summarization process.
 * - SummarizeRecipeInput - The input type for the summarizeRecipe function.
 * - SummarizeRecipeOutput - The return type for the summarizeRecipe function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeRecipeInputSchema = z.object({
  recipe: z
    .string()
    .describe('The recipe to summarize. Should include ingredients and instructions.'),
});
export type SummarizeRecipeInput = z.infer<typeof SummarizeRecipeInputSchema>;

const SummarizeRecipeOutputSchema = z.object({
  summary: z
    .string()
    .describe('A summary of the recipe, presented as a few bullet points.'),
});
export type SummarizeRecipeOutput = z.infer<typeof SummarizeRecipeOutputSchema>;

export async function summarizeRecipe(input: SummarizeRecipeInput): Promise<SummarizeRecipeOutput> {
  return summarizeRecipeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeRecipePrompt',
  input: {schema: SummarizeRecipeInputSchema},
  output: {schema: SummarizeRecipeOutputSchema},
  prompt: `Summarize the following recipe into a few bullet points for a quick and easy overview:

{{{recipe}}}`,
});

const summarizeRecipeFlow = ai.defineFlow(
  {
    name: 'summarizeRecipeFlow',
    inputSchema: SummarizeRecipeInputSchema,
    outputSchema: SummarizeRecipeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
