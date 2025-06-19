
'use client';

import { useState, useMemo } from 'react';
import { useSavedRecipes } from '@/hooks/useSavedRecipes';
import SavedRecipeCard from '@/components/my-recipes/SavedRecipeCard';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

export default function MyRecipesPage() {
  const { savedRecipes, isLoading } = useSavedRecipes();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRecipes = useMemo(() => {
    if (!searchTerm) {
      return savedRecipes;
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return savedRecipes.filter(recipe => {
      const titleMatch = recipe.title.toLowerCase().includes(lowerCaseSearchTerm);
      const descriptionMatch = recipe.description && recipe.description.toLowerCase().includes(lowerCaseSearchTerm);
      const ingredientsMatch = recipe.userInputIngredients.toLowerCase().includes(lowerCaseSearchTerm);
      const tagsMatch = recipe.tags && recipe.tags.some(tag => tag.toLowerCase().includes(lowerCaseSearchTerm));
      const cuisineMatch = recipe.cuisine && recipe.cuisine.toLowerCase().includes(lowerCaseSearchTerm);
      return titleMatch || descriptionMatch || ingredientsMatch || tagsMatch || cuisineMatch;
    });
  }, [savedRecipes, searchTerm]);

  if (isLoading) {
    return (
      <div className="animate-fade-in">
        <h1 className="text-4xl font-headline font-bold mb-8 text-center text-primary">My Saved Recipes</h1>
        <Skeleton className="h-10 w-full max-w-lg mx-auto mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-60 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h1 className="text-4xl font-headline font-bold mb-6 text-center text-primary">My Saved Recipes</h1>
      
      <div className="mb-8 max-w-lg mx-auto">
        <Input
          type="search"
          placeholder="Search saved recipes (title, ingredients, tags...)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-card border-border focus:ring-primary"
        />
      </div>

      {savedRecipes.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg shadow-md">
          <AlertTriangle className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-xl text-muted-foreground mb-6">You haven't saved any recipes yet.</p>
          <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Link href="/">Find Recipes</Link>
          </Button>
        </div>
      ) : filteredRecipes.length === 0 && searchTerm ? (
        <div className="text-center py-12 bg-card rounded-lg shadow-md">
          <SearchX className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-xl text-muted-foreground mb-2">No recipes match your search.</p>
          <p className="text-md text-muted-foreground">Try a different search term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map(recipe => (
            <SavedRecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
}
