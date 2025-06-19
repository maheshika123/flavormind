
'use server';
/**
 * @fileOverview Translates recipe content into a specified target language.
 *
 * - translateRecipeContent - A function that translates various parts of a recipe.
 * - TranslateRecipeInput - The input type for the translateRecipeContent function.
 * - TranslatedRecipeOutput - The return type for the translateRecipeContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IngredientTranslationSchema = z.object({
  name: z.string().describe("Name of the ingredient. Example: 'Chicken'"),
  quantity: z.string().describe("Quantity of the ingredient. Example: '500g' (This should NOT be translated)."),
});

const TranslateRecipeInputSchema = z.object({
  recipeTitle: z.string().describe("The title of the recipe."),
  recipeDescription: z.string().optional().describe("The description of the recipe."),
  recipeIngredients: z.array(IngredientTranslationSchema).describe("An array of ingredients with name and quantity."),
  recipeInstructions: z.array(z.string()).describe("An array of cooking instructions."),
  recipeTags: z.array(z.string()).optional().describe("An array of tags associated with the recipe."),
  targetLanguage: z.string().describe("The target language for translation (e.g., 'Spanish', 'French', 'Sinhala')."),
});
export type TranslateRecipeInput = z.infer<typeof TranslateRecipeInputSchema>;

const TranslatedRecipeOutputSchema = z.object({
  translatedTitle: z.string().describe("The translated title of the recipe."),
  translatedDescription: z.string().optional().describe("The translated description of the recipe."),
  translatedIngredients: z.array(IngredientTranslationSchema).describe("The array of ingredients with only the 'name' translated. 'quantity' must remain unchanged."),
  translatedInstructions: z.array(z.string()).describe("The translated cooking instructions."),
  translatedTags: z.array(z.string()).optional().describe("The translated tags."),
});
export type TranslatedRecipeOutput = z.infer<typeof TranslatedRecipeOutputSchema>;

export async function translateRecipeContent(input: TranslateRecipeInput): Promise<TranslatedRecipeOutput> {
  return translateRecipeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'translateRecipePrompt',
  input: {schema: TranslateRecipeInputSchema},
  output: {schema: TranslatedRecipeOutputSchema},
  prompt: `Translate the following recipe details into {{targetLanguage}}.
Focus on accuracy, especially for cooking terms and instructions.
For ingredients, ONLY translate the 'name' field. The 'quantity' field MUST remain exactly as provided in the input.

Original Recipe Details:
Title: {{{recipeTitle}}}
{{#if recipeDescription}}Description: {{{recipeDescription}}}{{/if}}

Ingredients (translate name, keep quantity):
{{#each recipeIngredients}}
- Name: {{{this.name}}}, Quantity: {{{this.quantity}}}
{{/each}}

Instructions:
{{#each recipeInstructions}}
- {{{this}}}
{{/each}}

{{#if recipeTags}}
Tags:
{{#each recipeTags}}
- {{{this}}}
{{/each}}
{{/if}}

Return the translated content strictly as a JSON object matching the TranslatedRecipeOutputSchema structure.
Ensure all original fields are present in the translated output object (e.g. if original description is present, translatedDescription must be present).
If optional fields like description or tags are not present in the input, do not include them or their translations in the output unless the schema requires empty arrays.
Example for ingredients: if input is { "name": "Chicken", "quantity": "500g" } and target language is Spanish, output should be { "name": "Pollo", "quantity": "500g" }.
`,
});

const translateRecipeFlow = ai.defineFlow(
  {
    name: 'translateRecipeFlow',
    inputSchema: TranslateRecipeInputSchema,
    outputSchema: TranslatedRecipeOutputSchema,
  },
  async (input: TranslateRecipeInput) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('Translation failed: AI did not return an output.');
    }
    // Ensure ingredient quantities are not accidentally translated if AI makes a mistake
    // This is a safeguard. The prompt strongly instructs the AI, but this ensures it.
    const validatedOutput = {...output};
    if (input.recipeIngredients && output.translatedIngredients && input.recipeIngredients.length === output.translatedIngredients.length) {
      validatedOutput.translatedIngredients = output.translatedIngredients.map((tIng, index) => ({
        ...tIng,
        quantity: input.recipeIngredients[index].quantity, // Force original quantity
      }));
    }
    return validatedOutput;
  }
);

