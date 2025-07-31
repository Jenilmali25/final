'use server';

/**
 * @fileOverview Implements a Genkit flow to filter audio commands and ensure clarity before initiating emergency calls.
 *
 * - filterAudioCommands - A function that filters user speech for clarity before initiating an emergency call.
 * - FilterAudioCommandsInput - The input type for the filterAudioCommands function.
 * - FilterAudioCommandsOutput - The return type for the filterAudioCommands function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FilterAudioCommandsInputSchema = z.object({
  speech: z
    .string()
    .describe('The user speech to analyze for clarity.'),
});
export type FilterAudioCommandsInput = z.infer<typeof FilterAudioCommandsInputSchema>;

const FilterAudioCommandsOutputSchema = z.object({
  isClear: z
    .boolean()
    .describe('Whether the speech is clear and contains a valid emergency command.'),
  filteredSpeech: z
    .string()
    .describe('The filtered and clarified speech, if any.'),
});
export type FilterAudioCommandsOutput = z.infer<typeof FilterAudioCommandsOutputSchema>;

export async function filterAudioCommands(input: FilterAudioCommandsInput): Promise<FilterAudioCommandsOutput> {
  return filterAudioCommandsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'filterAudioCommandsPrompt',
  input: {schema: FilterAudioCommandsInputSchema},
  output: {schema: FilterAudioCommandsOutputSchema},
  prompt: `You are an AI assistant that filters user speech to determine if it contains a clear emergency command.

  Analyze the following speech:
  {{speech}}

  Determine if the speech is clear and contains a valid emergency command (e.g., "Call 911", "Emergency Alert", "SOS").

  If the speech is unclear or does not contain a valid emergency command, clarify it or ask the user to repeat.  If it is clearly an emergency command, pass it through without modification.  If it seems to be a request for information or something else, return isClear=false.

  Return a JSON object with the following fields:
  - isClear: true if the speech is clear and contains a valid emergency command, false otherwise.
  - filteredSpeech: The filtered and clarified speech, or the original speech if it was clear.
`,
});

const filterAudioCommandsFlow = ai.defineFlow(
  {
    name: 'filterAudioCommandsFlow',
    inputSchema: FilterAudioCommandsInputSchema,
    outputSchema: FilterAudioCommandsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
