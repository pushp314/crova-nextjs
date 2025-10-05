'use server';

/**
 * @fileOverview A flow that summarizes product descriptions.
 *
 * - summarizeProductDescription - A function that summarizes the description of a product.
 * - SummarizeProductDescriptionInput - The input type for the summarizeProductDescription function.
 * - SummarizeProductDescriptionOutput - The return type for the summarizeProductDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const SummarizeProductDescriptionInputSchema = z.object({
  description: z
    .string()
    .describe('The full product description to be summarized.'),
});
export type SummarizeProductDescriptionInput =
  z.infer<typeof SummarizeProductDescriptionInputSchema>;

const SummarizeProductDescriptionOutputSchema = z.object({
  summary: z
    .string()
    .describe('A concise summary of the product description.'),
});
export type SummarizeProductDescriptionOutput =
  z.infer<typeof SummarizeProductDescriptionOutputSchema>;

export async function summarizeProductDescription(
  input: SummarizeProductDescriptionInput
): Promise<SummarizeProductDescriptionOutput> {
  return summarizeProductDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeProductDescriptionPrompt',
  input: {schema: SummarizeProductDescriptionInputSchema},
  output: {schema: SummarizeProductDescriptionOutputSchema},
  prompt: `Summarize the following product description in a concise manner, highlighting the key features and benefits:\n\nDescription: {{{description}}}`,
});

const summarizeProductDescriptionFlow = ai.defineFlow(
  {
    name: 'summarizeProductDescriptionFlow',
    inputSchema: SummarizeProductDescriptionInputSchema,
    outputSchema: SummarizeProductDescriptionOutputSchema,
  },
  async (input: SummarizeProductDescriptionInput) => {
    const {output} = await prompt(input);
    return output!;
  }
);
