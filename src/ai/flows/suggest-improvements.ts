'use server';

/**
 * @fileOverview AI-powered tool that analyzes past entries and provides suggestions to maximize earnings.
 *
 * - suggestImprovements - A function that handles the suggestion generation process.
 * - SuggestImprovementsInput - The input type for the suggestImprovements function.
 * - SuggestImprovementsOutput - The return type for the suggestImprovements function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestImprovementsInputSchema = z.object({
  entries: z.array(
    z.object({
      date: z.string().describe('The date of the entry.'),
      kmInicial: z.number().describe('The initial kilometer reading.'),
      kmFinal: z.number().describe('The final kilometer reading.'),
      gastoAlimentacao: z.number().describe('The amount spent on food.'),
      outrosGastos: z.number().describe('Other expenses incurred.'),
      ganho: z.number().describe('The earnings for the trip.'),
    })
  ).describe('An array of past revenue and expense entries.'),
});
export type SuggestImprovementsInput = z.infer<typeof SuggestImprovementsInputSchema>;

const SuggestImprovementsOutputSchema = z.object({
  suggestions: z.array(
    z.string().describe('A suggestion to maximize earnings on each trip.')
  ).max(2).describe('A list of suggestions, not more than 2, to improve the earnings per trip. ')
});
export type SuggestImprovementsOutput = z.infer<typeof SuggestImprovementsOutputSchema>;

export async function suggestImprovements(input: SuggestImprovementsInput): Promise<SuggestImprovementsOutput> {
  return suggestImprovementsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestImprovementsPrompt',
  input: {schema: SuggestImprovementsInputSchema},
  output: {schema: SuggestImprovementsOutputSchema},
  prompt: `You are an expert consultant for delivery motoboys, specializing in maximizing their earnings and efficiency. Analyze the motoboy's past entries and provide a maximum of two clear, actionable suggestions on how to maximize earnings on each trip.

Past Entries:
{{#each entries}}
  - Date: {{date}}, Distance: {{(kmFinal - kmInicial)}}, Food Expenses: {{gastoAlimentacao}}, Other Expenses: {{outrosGastos}}, Earnings: {{ganho}}
{{/each}}

Suggestions:
`,
});

const suggestImprovementsFlow = ai.defineFlow(
  {
    name: 'suggestImprovementsFlow',
    inputSchema: SuggestImprovementsInputSchema,
    outputSchema: SuggestImprovementsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
