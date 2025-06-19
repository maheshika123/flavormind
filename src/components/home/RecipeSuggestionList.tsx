
'use client';

import type { RecipeSuggestion } from '@/types';
import RecipeSuggestionCard from './RecipeSuggestionCard';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface RecipeSuggestionListProps {
  suggestions: RecipeSuggestion[]; // This is now DetailedRecipe[]
  userInputIngredients: string;
}

export default function RecipeSuggestionList({ suggestions, userInputIngredients }: RecipeSuggestionListProps) {
  if (!suggestions) { // Can be null if action fails very early
    return null;
  }
  
  // This specific condition for no recipes found is now handled by IngredientClientPage's error state
  // or the form's toast message. If suggestions is an empty array, we render the list header
  // but the map will render nothing.

  return (
    <div className="mt-10 animate-fade-in">
      <h2 className="text-3xl font-headline font-semibold mb-6 text-center text-primary">Recipe Ideas</h2>
      {suggestions.length === 0 && !userInputIngredients && ( 
        // Only show this if there was no input yet to trigger a search.
        // Otherwise, error/no results messages are handled by IngredientClientPage or form.
        <div className="text-center py-10">
          <p className="text-muted-foreground">Enter some ingredients to see recipe ideas here!</p>
        </div>
      )}
      {suggestions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6"> {/* Changed to 1 column for better display of more details */}
          {suggestions.map((suggestion, index) => (
            <RecipeSuggestionCard 
              key={suggestion.id || suggestion.title || index} // Use title as fallback key if no id
              suggestion={suggestion} 
              userInputIngredients={userInputIngredients} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
