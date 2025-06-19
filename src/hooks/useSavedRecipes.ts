
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { SavedRecipe, RecipeSuggestion } from '@/types';
import { useToast } from '@/hooks/use-toast';

const LOCAL_STORAGE_KEY = 'flavorMind_savedRecipes';

export function useSavedRecipes() {
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedRecipes = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedRecipes) {
        setSavedRecipes(JSON.parse(storedRecipes));
      }
    } catch (error) {
      console.error("Failed to load recipes from local storage", error);
      toast({
        title: "Error",
        description: "Could not load saved recipes from local storage.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  }, [toast]);

  const updateLocalStorage = useCallback((recipes: SavedRecipe[]) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(recipes));
    } catch (error) {
      console.error("Failed to save recipes to local storage", error);
      toast({
        title: "Error",
        description: "Could not save recipes to local storage.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const addRecipe = useCallback((recipe: RecipeSuggestion, userInputIngredients: string) => {
    const newSavedRecipe: SavedRecipe = {
      ...recipe,
      id: recipe.id || crypto.randomUUID(), // Use provided ID or generate new one
      userInputIngredients,
      createdAt: new Date().toISOString(),
    };
    
    const recipeExists = savedRecipes.some(r => r.title === newSavedRecipe.title && r.userInputIngredients === userInputIngredients);
    if (recipeExists) {
      toast({
        title: "Already Saved",
        description: `"${newSavedRecipe.title}" is already in your saved recipes.`,
      });
      return;
    }

    setSavedRecipes(prevRecipes => {
      const updatedRecipes = [...prevRecipes, newSavedRecipe];
      updateLocalStorage(updatedRecipes);
      return updatedRecipes;
    });
    toast({
      title: "Recipe Saved!",
      description: `"${newSavedRecipe.title}" has been added to your recipes.`,
    });
  }, [savedRecipes, updateLocalStorage, toast]);

  const removeRecipe = useCallback((recipeId: string) => {
    setSavedRecipes(prevRecipes => {
      const recipeToRemove = prevRecipes.find(r => r.id === recipeId);
      const updatedRecipes = prevRecipes.filter(recipe => recipe.id !== recipeId);
      updateLocalStorage(updatedRecipes);
      if (recipeToRemove) {
        toast({
          title: "Recipe Removed",
          description: `"${recipeToRemove.title}" has been removed.`,
        });
      }
      return updatedRecipes;
    });
  }, [updateLocalStorage, toast]);

  const getRecipeById = useCallback((recipeId: string): SavedRecipe | undefined => {
    return savedRecipes.find(recipe => recipe.id === recipeId);
  }, [savedRecipes]);

  return { savedRecipes, addRecipe, removeRecipe, getRecipeById, isLoading };
}
