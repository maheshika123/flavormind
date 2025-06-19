
import type { DetailedRecipe as AIDetailedRecipe } from '@/ai/flows/generate-recipe-ideas';

// This is the structure of a recipe as returned by the AI
export type RecipeSuggestion = AIDetailedRecipe & {
  id?: string; // Client-side generated optional ID
};

// This is the structure of a recipe when saved by the user
export interface SavedRecipe extends RecipeSuggestion {
  id: string; // Ensure ID is always present for saved recipes
  userInputIngredients: string;
  createdAt: string;
}

