'use server';
/**
 * @fileOverview A flow that interprets a natural language search query 
 *               and converts it into structured search terms for a database query.
 *
 * - productSearch - A function that takes a user query and returns structured search terms.
 * - ProductSearchInput - The input type for the productSearch function.
 * - ProductSearchOutput - The return type for the productSearch function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const ProductSearchInputSchema = z.object({
  query: z
    .string()
    .describe('The user\'s natural language search query.'),
});
export type ProductSearchInput = z.infer<typeof ProductSearchInputSchema>;

const ProductSearchOutputSchema = z.object({
  keywords: z
    .array(z.string())
    .describe('A list of keywords extracted from the query to use for full-text search. Should include synonyms or related terms.'),
  categories: z
    .array(z.string())
    .describe("A list of categories identified from the query (e.g., 'men', 'women'). Return an empty array if no category is mentioned."),
});
export type ProductSearchOutput = z.infer<typeof ProductSearchOutputSchema>;

export async function productSearch(input: ProductSearchInput): Promise<ProductSearchOutput> {
  return productSearchFlow(input);
}

const prompt = ai.definePrompt({
  name: 'productSearchPrompt',
  input: {schema: ProductSearchInputSchema},
  output: {schema: ProductSearchOutputSchema},
  prompt: `You are an intelligent search assistant for an e-commerce fashion store called NOVA.
Your task is to analyze a user's search query and break it down into structured terms that can be used to search the product database.

The store has two main categories: 'Men' and 'Women'.

From the user's query, extract the main keywords. These should be relevant nouns and adjectives. For example, if the user asks for "red summer dress for ladies", the keywords could be "red", "summer", "dress".
Also, identify if the query mentions a specific category ('Men' or 'Women').

Query: {{{query}}}

Return the keywords and categories in the specified JSON format.
If the query is "shirts for guys", the category should be 'Men'.
If the query is "dresses for ladies", the category should be 'Women'.
If no category is mentioned, return an empty array for categories.`,
});

const productSearchFlow = ai.defineFlow(
  {
    name: 'productSearchFlow',
    inputSchema: ProductSearchInputSchema,
    outputSchema: ProductSearchOutputSchema,
  },
  async (input: ProductSearchInput) => {
    const {output} = await prompt(input);
    return output!;
  }
);
