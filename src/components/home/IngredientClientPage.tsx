
'use client';

import { useState, useCallback, useEffect } from 'react';
import type { RecipeSuggestion } from '@/types';
import IngredientForm from '@/components/home/IngredientForm';
import RecipeSuggestionList from '@/components/home/RecipeSuggestionList';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, Trash2 } from 'lucide-react';

const CURRENT_RECIPE_SEARCH_LS_KEY = 'flavorMind_currentRecipeSearch';

export default function IngredientClientPage() {
  const [recipeSuggestions, setRecipeSuggestions] = useState<RecipeSuggestion[]>([]);
  const [userInputIngredients, setUserInputIngredients] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedSearch = localStorage.getItem(CURRENT_RECIPE_SEARCH_LS_KEY);
      if (storedSearch) {
        const { suggestions, ingredients } = JSON.parse(storedSearch);
        if (suggestions && Array.isArray(suggestions) && typeof ingredients === 'string') {
          setRecipeSuggestions(suggestions);
          setUserInputIngredients(ingredients);
        } else {
          // Clear potentially corrupted data
          localStorage.removeItem(CURRENT_RECIPE_SEARCH_LS_KEY);
        }
      }
    } catch (e) {
      console.error("Failed to load suggestions from local storage", e);
      localStorage.removeItem(CURRENT_RECIPE_SEARCH_LS_KEY); // Clear if parsing fails
    }
  }, []);

  const handleSuggestions = useCallback((suggestions: RecipeSuggestion[], ingredients: string) => {
    const suggestionsWithIds = suggestions.map(s => ({...s, id: s.id || crypto.randomUUID() }));
    setRecipeSuggestions(suggestionsWithIds);
    setUserInputIngredients(ingredients);
    setError(null);
    setIsLoading(false);
    try {
      const dataToStore = { suggestions: suggestionsWithIds, ingredients };
      localStorage.setItem(CURRENT_RECIPE_SEARCH_LS_KEY, JSON.stringify(dataToStore));
    } catch (e) {
      console.error("Failed to save suggestions to local storage", e);
      toast({
        title: "Storage Error",
        description: "Could not save current suggestions.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleError = useCallback((message: string) => {
    setError(message);
    setRecipeSuggestions([]);
    setUserInputIngredients('');
    setIsLoading(false);
    try {
      localStorage.removeItem(CURRENT_RECIPE_SEARCH_LS_KEY);
    } catch (e) {
      console.error("Failed to clear suggestions from local storage on error", e);
    }
  }, []);
  
  const handleLoading = useCallback((loading: boolean) => {
    setIsLoading(loading);
    if(loading) {
      setError(null);
      setRecipeSuggestions([]);
      setUserInputIngredients('');
      try {
        localStorage.removeItem(CURRENT_RECIPE_SEARCH_LS_KEY);
      } catch (e) {
        console.error("Failed to clear suggestions from local storage on new search", e);
      }
    }
  }, []);

  const handleClearSuggestions = useCallback(() => {
    setRecipeSuggestions([]);
    setUserInputIngredients('');
    setError(null);
    try {
      localStorage.removeItem(CURRENT_RECIPE_SEARCH_LS_KEY);
    } catch (e) {
      console.error("Failed to clear suggestions from local storage", e);
    }
    toast({
      title: 'Suggestions Cleared',
      description: 'Your current recipe ideas have been cleared.',
    });
  }, [toast]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <IngredientForm
        onSuggestions={handleSuggestions}
        onError={handleError}
        onLoading={handleLoading}
      />
      
      {isLoading && (
        <div className="mt-10 space-y-4">
          <h2 className="text-3xl font-headline font-semibold mb-6 text-center text-primary">Generating Recipes...</h2>
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-48 w-full rounded-lg" />
        </div>
      )}

      {!isLoading && error && recipeSuggestions.length === 0 && (
         <Alert variant="destructive" className="mt-10 animate-fade-in">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Generation Failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {!isLoading && !error && recipeSuggestions.length > 0 && (
        <div className="mt-6 animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-3xl font-headline font-semibold text-primary">Recipe Ideas</h2>
            <Button variant="outline" size="sm" onClick={handleClearSuggestions} aria-label="Clear current recipe suggestions">
              <Trash2 className="mr-1.5 h-4 w-4" />
              Clear Suggestions
            </Button>
          </div>
          <RecipeSuggestionList
            suggestions={recipeSuggestions}
            userInputIngredients={userInputIngredients}
          />
        </div>
      )}
      
      {/* Message for when there are no suggestions and no error, not loading (e.g. initial state or after clearing) */}
      {!isLoading && !error && recipeSuggestions.length === 0 && userInputIngredients === '' && (
         <div className="mt-10 text-center py-10 text-muted-foreground">
          <p>Enter some ingredients above to discover new recipes!</p>
        </div>
      )}
    </div>
  );
}
