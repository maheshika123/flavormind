
'use server';
/**
 * @fileOverview Generates detailed recipe ideas based on user-provided ingredients.
 *
 * - generateRecipeIdeas - A function that takes a list of ingredients and returns detailed recipe ideas.
 * - GenerateRecipeIdeasInput - The input type for the generateRecipeIdeas function.
 * - GenerateRecipeIdeasOutput - The return type for the generateRecipeIdeas function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateRecipeIdeasInputSchema = z.object({
  ingredients: z
    .string()
    .describe('A comma-separated list of ingredients available to use in the recipe.'),
});
export type GenerateRecipeIdeasInput = z.infer<typeof GenerateRecipeIdeasInputSchema>;

const IngredientSchema = z.object({
  name: z.string().describe("Name of the ingredient. Example: 'Chicken'"),
  quantity: z.string().describe("Quantity of the ingredient. Example: '500g'"),
});

const DetailedRecipeSchema = z.object({
  title: z.string().describe("Title of the recipe. Example: 'Sri Lankan Chicken Curry'"),
  description: z.string().describe("A brief description of the recipe. Example: 'A spicy and aromatic chicken curry made with Sri Lankan spices.'"),
  ingredients: z.array(IngredientSchema).describe("List of ingredients with name and quantity."),
  instructions: z.array(z.string()).describe("Step-by-step cooking instructions. Example: ['Heat oil in a pan...', 'Add chicken...']"),
  prepTime: z.string().optional().describe("Preparation time. Example: '15 min'"),
  cookTime: z.string().optional().describe("Cooking time. Example: '30 min'"),
  totalTime: z.string().optional().describe("Total time. Example: '45 min'"),
  servingSize: z.string().optional().describe("Number of servings. Example: 'Serves 4'"),
  cuisine: z.string().optional().describe("Type of cuisine. Example: 'Sri Lankan'"),
  difficulty: z.string().optional().describe("Difficulty level. Example: 'Easy', 'Intermediate', 'Hard'"),
  tags: z.array(z.string()).optional().describe("Keywords or tags associated with the recipe. Example: ['spicy', 'dinner', 'non-veg']"),
});
export type DetailedRecipe = z.infer<typeof DetailedRecipeSchema>;

const GenerateRecipeIdeasOutputSchema = z.object({
  recipes: z
    .array(DetailedRecipeSchema)
    .describe('An array of detailed recipe objects based on the provided ingredients.'),
});
export type GenerateRecipeIdeasOutput = z.infer<typeof GenerateRecipeIdeasOutputSchema>;

export async function generateRecipeIdeas(input: GenerateRecipeIdeasInput): Promise<GenerateRecipeIdeasOutput> {
  return generateRecipeIdeasFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateRecipeIdeasPrompt',
  input: {schema: GenerateRecipeIdeasInputSchema},
  output: {schema: GenerateRecipeIdeasOutputSchema},
  prompt: `Given the following ingredients: {{{ingredients}}}, generate 2-3 detailed recipe ideas.
Each recipe should strictly use only the ingredients provided or common pantry staples (like salt, pepper, oil, water) if absolutely necessary but prioritize the given ingredients.
Recipes should be very different from each other in cuisine and preparation style.
For each recipe, provide all the following details: title, description, a list of ingredients (each with name and quantity), step-by-step instructions, prepTime, cookTime, totalTime, servingSize, cuisine, difficulty.
Optionally, include relevant tags.

Return the response as a JSON object with a key "recipes" which is an array of these detailed recipe objects. Ensure your output strictly adheres to this structure.
Example of a single recipe object structure:
{
  "title": "Quick Tomato & Basil Pasta",
  "description": "A simple and fast pasta dish with fresh tomatoes and basil.",
  "ingredients": [
    { "name": "Pasta", "quantity": "200g" },
    { "name": "Tomatoes", "quantity": "3 large, chopped" },
    { "name": "Basil", "quantity": "1/2 cup, fresh leaves" },
    { "name": "Garlic", "quantity": "2 cloves, minced" },
    { "name": "Olive Oil", "quantity": "2 tbsp" }
  ],
  "instructions": [
    "Cook pasta according to package directions.",
    "While pasta cooks, heat olive oil in a pan, add garlic and cook until fragrant.",
    "Add chopped tomatoes and cook for 5-7 minutes until softened.",
    "Drain pasta and add to the pan with tomatoes. Stir in fresh basil.",
    "Season with salt and pepper to taste."
  ],
  "prepTime": "10 min",
  "cookTime": "15 min",
  "totalTime": "25 min",
  "servingSize": "Serves 2",
  "cuisine": "Italian",
  "difficulty": "Easy",
  "tags": ["quick", "vegetarian", "pasta"]
}`,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_ONLY_HIGH', // Be more permissive for cooking instructions
      },
    ],
  },
});

const generateRecipeIdeasFlow = ai.defineFlow(
  {
    name: 'generateRecipeIdeasFlow',
    inputSchema: GenerateRecipeIdeasInputSchema,
    outputSchema: GenerateRecipeIdeasOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    // Ensure recipes are always an array, even if AI fails to produce it or output is null
    return output ? output : { recipes: [] };
  }
);

