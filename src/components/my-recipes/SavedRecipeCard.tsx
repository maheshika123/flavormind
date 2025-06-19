
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { SavedRecipe } from '@/types';
import { useSavedRecipes } from '@/hooks/useSavedRecipes';
import { Eye, Trash2, CalendarDays, Clock, Utensils } from 'lucide-react';
import { format } from 'date-fns';
// import Image from 'next/image'; // Removed Image import

interface SavedRecipeCardProps {
  recipe: SavedRecipe;
}

export default function SavedRecipeCard({ recipe }: SavedRecipeCardProps) {
  const { removeRecipe } = useSavedRecipes();

  const handleDelete = () => {
    removeRecipe(recipe.id);
  };

  // Pass the full SavedRecipe object to the view page
  const recipeLink = `/recipes/view?recipe=${encodeURIComponent(JSON.stringify(recipe))}`;


  return (
    <Card className="bg-card hover:shadow-2xl transition-shadow duration-300 ease-in-out flex flex-col justify-between animate-slide-in-up">
      <CardHeader>
        <CardTitle className="text-xl font-headline text-primary">{recipe.title}</CardTitle>
         {/* Image display removed */}
        <CardDescription className="text-xs text-muted-foreground pt-1">
          <div className="flex items-center">
            <CalendarDays className="h-3 w-3 mr-1.5" />
            Saved on: {format(new Date(recipe.createdAt), 'MMM d, yyyy')}
          </div>
          {recipe.cuisine && (
            <div className="flex items-center mt-1">
              <Utensils className="h-3 w-3 mr-1.5" /> Cuisine: {recipe.cuisine}
            </div>
          )}
           {recipe.totalTime && (
            <div className="flex items-center mt-1">
              <Clock className="h-3 w-3 mr-1.5" /> Total Time: {recipe.totalTime}
            </div>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {recipe.description && (
          <p className="text-sm text-foreground/80 line-clamp-2 mb-2">
            {recipe.description}
          </p>
        )}
        <p className="text-sm text-foreground/70 italic line-clamp-1">
          Based on: {recipe.userInputIngredients}
        </p>
      </CardContent>
      <CardFooter className="flex justify-end gap-2 pt-4">
        <Button variant="outline" asChild>
          <Link href={recipeLink} aria-label={`View details for ${recipe.title}`}>
            <Eye className="mr-2 h-4 w-4" /> View
          </Link>
        </Button>
        <Button variant="destructive" onClick={handleDelete} aria-label={`Delete ${recipe.title}`}>
          <Trash2 className="mr-2 h-4 w-4" /> Delete
        </Button>
      </CardFooter>
    </Card>
  );
}
