'use server';

import { summarizeProductDescription } from '@/ai/flows/summarize-product-descriptions';

export async function getSummary(description: string): Promise<string> {
  if (!description) {
    return "No description available to summarize.";
  }

  try {
    const result = await summarizeProductDescription({ description });
    return result.summary;
  } catch (error) {
    console.error("Error summarizing description:", error);
    return "Could not generate summary at this time.";
  }
}
