
'use server';

import { generateRecipeIdeas, type GenerateRecipeIdeasInput, type DetailedRecipe } from '@/ai/flows/generate-recipe-ideas';
import { translateRecipeContent, type TranslateRecipeInput, type TranslatedRecipeOutput } from '@/ai/flows/translate-recipe-flow';
import { z } from 'zod';

const IngredientsSchema = z.string().min(3, "Please enter at least one ingredient.");

export async function getRecipeSuggestionsAction(prevState: any, formData: FormData) {
  const ingredients = formData.get('ingredients') as string;

  const validationResult = IngredientsSchema.safeParse(ingredients);
  if (!validationResult.success) {
    return {
      message: 'Validation failed',
      errors: validationResult.error.flatten().fieldErrors,
      recipes: null,
      translatedContent: null,
    };
  }

  try {
    const input: GenerateRecipeIdeasInput = { ingredients: validationResult.data };
    const result = await generateRecipeIdeas(input); 
    
    if (result && result.recipes && result.recipes.length > 0) {
      const recipesWithClientIds: DetailedRecipe[] = result.recipes.map(recipe => ({
        ...recipe,
      }));
      return { message: 'Recipes generated successfully', recipes: recipesWithClientIds, errors: null, translatedContent: null };
    }
    return { message: 'No recipes found for these ingredients.', recipes: [], errors: null, translatedContent: null };
  } catch (error) {
    console.error("Error generating recipe ideas:", error);
    let errorMessage = 'Failed to generate recipes. Please try again.';
    if (error instanceof Error && 'details' in error) {
        const genkitError = error as any;
        if (genkitError.details?.finishReason) {
            errorMessage = `Recipe generation stopped: ${genkitError.details.finishReason}. Please try different ingredients or simplify your request.`;
        }
    } else if (error instanceof Error) {
        errorMessage = error.message;
    }
    
    return { message: errorMessage, recipes: null, errors: { _form: [errorMessage] }, translatedContent: null };
  }
}


export async function translateRecipeAction(
  currentRecipeData: Omit<TranslateRecipeInput, 'targetLanguage'>,
  targetLanguage: string
): Promise<{ translatedContent: TranslatedRecipeOutput | null; error: string | null }> {
  if (!currentRecipeData || !targetLanguage) {
    return { translatedContent: null, error: 'Missing recipe data or target language.' };
  }

  const input: TranslateRecipeInput = {
    ...currentRecipeData,
    targetLanguage,
  };

  try {
    const translatedContent = await translateRecipeContent(input);
    return { translatedContent, error: null };
  } catch (error) {
    console.error('Error translating recipe:', error);
    let errorMessage = 'Failed to translate recipe. Please try again.';
     if (error instanceof Error && 'details' in error) {
        const genkitError = error as any;
        if (genkitError.details?.finishReason === 'SAFETY') {
            errorMessage = `Translation was blocked due to safety settings. The content might be sensitive.`;
        } else if (genkitError.message) {
            errorMessage = `Translation error: ${genkitError.message}`;
        }
    } else if (error instanceof Error) {
        errorMessage = error.message;
    }
    return { translatedContent: null, error: errorMessage };
  }
}
