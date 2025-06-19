
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { RecipeSuggestion } from '@/types'; // RecipeSuggestion is now DetailedRecipe
import { useSavedRecipes } from '@/hooks/useSavedRecipes';
import { Bookmark, Eye, Clock, Users, Utensils, Tag, BarChart3 } from 'lucide-react';
// import Image from 'next/image'; // Removed Image import

interface RecipeSuggestionCardProps {
  suggestion: RecipeSuggestion; // This is now DetailedRecipe
  userInputIngredients: string;
}

export default function RecipeSuggestionCard({ suggestion, userInputIngredients }: RecipeSuggestionCardProps) {
  const { addRecipe, savedRecipes } = useSavedRecipes();

  const isSaved = savedRecipes.some(r => r.title === suggestion.title && r.userInputIngredients === userInputIngredients);

  const handleSave = () => {
    // addRecipe now expects the full suggestion object
    addRecipe(suggestion, userInputIngredients);
  };

  const recipeLink = `/recipes/view?recipe=${encodeURIComponent(JSON.stringify(suggestion))}&userInputIngredients=${encodeURIComponent(userInputIngredients)}`;

  return (
    <Card className="bg-card hover:shadow-2xl transition-shadow duration-300 ease-in-out animate-slide-in-up flex flex-col">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-primary">{suggestion.title}</CardTitle>
        {/* Image display removed */}
        {suggestion.description && (
          <CardDescription className="pt-2 text-sm text-foreground/80 line-clamp-3">{suggestion.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-3 flex-grow">
        {suggestion.cuisine && (
          <div className="flex items-center text-xs text-muted-foreground">
            <Utensils className="h-3.5 w-3.5 mr-1.5" /> Cuisine: {suggestion.cuisine}
          </div>
        )}
        {(suggestion.prepTime || suggestion.cookTime || suggestion.totalTime) && (
          <div className="flex items-center text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5 mr-1.5" />
            {suggestion.prepTime && `Prep: ${suggestion.prepTime} `}
            {suggestion.cookTime && `Cook: ${suggestion.cookTime} `}
            {suggestion.totalTime && `Total: ${suggestion.totalTime}`}
          </div>
        )}
        {suggestion.servingSize && (
          <div className="flex items-center text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5 mr-1.5" /> Serves: {suggestion.servingSize}
          </div>
        )}
        {suggestion.difficulty && (
          <div className="flex items-center text-xs text-muted-foreground">
            <BarChart3 className="h-3.5 w-3.5 mr-1.5" /> Difficulty: {suggestion.difficulty}
          </div>
        )}
        {suggestion.tags && suggestion.tags.length > 0 && (
           <div className="flex items-center text-xs text-muted-foreground">
            <Tag className="h-3.5 w-3.5 mr-1.5" /> Tags: {suggestion.tags.join(', ')}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2 pt-4">
        <Button variant="outline" asChild>
          <Link href={recipeLink} aria-label={`View details for ${suggestion.title}`}>
            <Eye className="mr-2 h-4 w-4" /> View Full Recipe
          </Link>
        </Button>
        <Button onClick={handleSave} disabled={isSaved} className="bg-accent hover:bg-accent/90 text-accent-foreground" aria-label={`Save ${suggestion.title}`}>
          <Bookmark className="mr-2 h-4 w-4" /> {isSaved ? 'Saved' : 'Save'}
        </Button>
      </CardFooter>
    </Card>
  );
}
