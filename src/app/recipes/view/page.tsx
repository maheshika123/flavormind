
'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useMemo, Suspense } from 'react'; // Added Suspense
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardFooter, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Share2, ClipboardCheck, ChefHat, Clock, Users, Utensils, Tag, BarChart3, Soup, ListChecks, Languages, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import type { RecipeSuggestion, SavedRecipe } from '@/types';
import { useSavedRecipes } from '@/hooks/useSavedRecipes';
import { Badge } from '@/components/ui/badge';
import { translateRecipeAction } from '@/app/actions';
import type { TranslatedRecipeOutput, TranslateRecipeInput } from '@/ai/flows/translate-recipe-flow';

function isSavedRecipe(recipe: any): recipe is SavedRecipe {
  return recipe && typeof recipe.createdAt === 'string';
}

const availableLanguages = [
  { value: 'English', label: 'English' },
  { value: 'Spanish', label: 'Español (Spanish)' },
  { value: 'French', label: 'Français (French)' },
  { value: 'German', label: 'Deutsch (German)' },
  { value: 'Sinhala', label: 'සිංහල (Sinhala)' },
  { value: 'Tamil', label: 'தமிழ் (Tamil)' },
  // Add more languages as needed
];

// Moved original RecipeViewPage content to RecipeViewClientContent
function RecipeViewClientContent() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [originalRecipe, setOriginalRecipe] = useState<RecipeSuggestion | SavedRecipe | null>(null);
  const [userInputIngredients, setUserInputIngredients] = useState<string | null>(null);
  const [isLoadingRecipe, setIsLoadingRecipe] = useState(true);
  const [isShareCopied, setIsShareCopied] = useState(false);

  const { addRecipe, savedRecipes } = useSavedRecipes();
  const [isRecipeSaved, setIsRecipeSaved] = useState(false);

  const [targetLanguage, setTargetLanguage] = useState<string>(availableLanguages[0].value);
  const [translatedContent, setTranslatedContent] = useState<TranslatedRecipeOutput | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);

  useEffect(() => {
    const recipeString = searchParams.get('recipe');
    const ingredientsString = searchParams.get('userInputIngredients');

    if (recipeString) {
      try {
        const parsedRecipe = JSON.parse(recipeString);
        setOriginalRecipe(parsedRecipe);
        if (ingredientsString) {
          setUserInputIngredients(ingredientsString);
        } else if (isSavedRecipe(parsedRecipe)) {
          setUserInputIngredients(parsedRecipe.userInputIngredients);
        }
      } catch (e) {
        console.error("Failed to parse recipe data from URL", e);
        setOriginalRecipe(null);
      }
    }
    setIsLoadingRecipe(false);
  }, [searchParams]);

  useEffect(() => {
    if (originalRecipe) {
      const currentIng = userInputIngredients || (isSavedRecipe(originalRecipe) ? originalRecipe.userInputIngredients : '');
      const checkSaved = savedRecipes.some(r => r.title === originalRecipe.title && r.userInputIngredients === currentIng);
      setIsRecipeSaved(checkSaved);
    }
  }, [originalRecipe, savedRecipes, userInputIngredients]);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: 'Link Copied!',
        description: 'Recipe link copied to clipboard.',
      });
      setIsShareCopied(true);
      setTimeout(() => setIsShareCopied(false), 2000);
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to copy link.',
        variant: 'destructive',
      });
    }
  };

  const handleSave = () => {
    if (originalRecipe && userInputIngredients) {
      const recipeToSave: RecipeSuggestion = { ...originalRecipe };
      if ('createdAt' in recipeToSave) {
        delete (recipeToSave as any).createdAt;
        delete (recipeToSave as any).userInputIngredients;
      }
      addRecipe(recipeToSave, userInputIngredients);
    } else if (originalRecipe && isSavedRecipe(originalRecipe)) {
        addRecipe(originalRecipe, originalRecipe.userInputIngredients);
    }
  };

  const handleTranslate = async () => {
    if (!originalRecipe || !targetLanguage || targetLanguage === "English") {
      setTranslatedContent(null); 
      setTranslationError(null);
      if (targetLanguage === "English") {
        toast({ title: "Showing Original", description: "Displaying the recipe in its original language." });
      }
      return;
    }

    setIsTranslating(true);
    setTranslationError(null);
    setTranslatedContent(null);

    const recipeDataForTranslation: Omit<TranslateRecipeInput, 'targetLanguage'> = {
      recipeTitle: originalRecipe.title,
      recipeDescription: originalRecipe.description,
      recipeIngredients: originalRecipe.ingredients || [],
      recipeInstructions: originalRecipe.instructions || [],
      recipeTags: originalRecipe.tags || [],
    };

    const result = await translateRecipeAction(recipeDataForTranslation, targetLanguage);

    setIsTranslating(false);
    if (result.error) {
      setTranslationError(result.error);
      toast({ title: 'Translation Failed', description: result.error, variant: 'destructive' });
    } else if (result.translatedContent) {
      setTranslatedContent(result.translatedContent);
      toast({ title: 'Translation Successful', description: `Recipe translated to ${targetLanguage}.` });
    } else {
      setTranslationError('An unknown error occurred during translation.');
       toast({ title: 'Translation Failed', description: 'An unknown error occurred.', variant: 'destructive' });
    }
  };
  
  const recipeToDisplay = useMemo(() => {
    if (translatedContent && targetLanguage !== "English") {
      return {
        ...originalRecipe, 
        title: translatedContent.translatedTitle,
        description: translatedContent.translatedDescription,
        ingredients: translatedContent.translatedIngredients,
        instructions: translatedContent.translatedInstructions,
        tags: translatedContent.translatedTags,
      };
    }
    return originalRecipe;
  }, [originalRecipe, translatedContent, targetLanguage]);

  if (isLoadingRecipe) {
    return <RecipeViewLoadingSkeleton />; // Use the defined skeleton component
  }

  if (!recipeToDisplay || !recipeToDisplay.title) {
    return <div className="text-center text-destructive py-10 text-xl">Recipe not found or data is incomplete.</div>;
  }
  
  const currentBaseIngredients = userInputIngredients || (isSavedRecipe(originalRecipe!) ? originalRecipe!.userInputIngredients : 'your ingredients');

  return (
    <div className="max-w-3xl mx-auto py-8 animate-fade-in">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-4xl font-headline text-primary">{recipeToDisplay.title}</CardTitle>
          {recipeToDisplay.description && (
            <CardDescription className="text-md pt-2 text-foreground/90">{recipeToDisplay.description}</CardDescription>
          )}
           <CardDescription className="text-sm pt-1">
              Based on: <span className="italic text-foreground/80">{currentBaseIngredients}</span>
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end border-b pb-4 mb-4">
            <div>
              <Label htmlFor="language-select" className="text-sm font-medium text-muted-foreground">Translate Recipe To:</Label>
              <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                <SelectTrigger id="language-select" className="w-full mt-1">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {availableLanguages.map(lang => (
                    <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleTranslate} disabled={isTranslating || !originalRecipe || targetLanguage === "English"} className="w-full sm:w-auto">
              {isTranslating ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Languages className="mr-2 h-5 w-5" />}
              {isTranslating ? 'Translating...' : (targetLanguage === "English" ? "Show Original" : `Translate to ${targetLanguage}`)}
            </Button>
          </div>
            {translationError && <p className="text-sm text-destructive">{translationError}</p>}

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            {recipeToDisplay.prepTime && <div className="flex items-center"><Clock className="mr-2 h-4 w-4 text-primary" /> Prep: {recipeToDisplay.prepTime}</div>}
            {recipeToDisplay.cookTime && <div className="flex items-center"><Clock className="mr-2 h-4 w-4 text-primary" /> Cook: {recipeToDisplay.cookTime}</div>}
            {recipeToDisplay.totalTime && <div className="flex items-center"><Clock className="mr-2 h-4 w-4 text-primary" /> Total: {recipeToDisplay.totalTime}</div>}
            {recipeToDisplay.servingSize && <div className="flex items-center"><Users className="mr-2 h-4 w-4 text-primary" /> Serves: {recipeToDisplay.servingSize}</div>}
            {recipeToDisplay.cuisine && <div className="flex items-center"><Utensils className="mr-2 h-4 w-4 text-primary" /> Cuisine: {recipeToDisplay.cuisine}</div>}
            {recipeToDisplay.difficulty && <div className="flex items-center"><BarChart3 className="mr-2 h-4 w-4 text-primary" /> Difficulty: {recipeToDisplay.difficulty}</div>}
          </div>

          {recipeToDisplay.ingredients && recipeToDisplay.ingredients.length > 0 && (
            <div>
              <h3 className="text-2xl font-semibold font-headline mb-3 text-primary/90 flex items-center"><Soup className="mr-2 h-6 w-6"/>Ingredients</h3>
              <ul className="list-disc list-inside bg-muted/30 p-4 rounded-lg space-y-1">
                {recipeToDisplay.ingredients.map((ing, index) => (
                  <li key={index} className="text-foreground/80">
                    <span className="font-medium">{ing.name}</span>: {ing.quantity}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {recipeToDisplay.instructions && recipeToDisplay.instructions.length > 0 && (
            <div>
              <h3 className="text-2xl font-semibold font-headline mb-3 text-primary/90 flex items-center"><ListChecks className="mr-2 h-6 w-6"/>Instructions</h3>
              <ol className="list-decimal list-outside ml-5 bg-muted/30 p-4 rounded-lg space-y-2">
                {recipeToDisplay.instructions.map((step, index) => (
                  <li key={index} className="text-foreground/80 pl-2">{step}</li>
                ))}
              </ol>
            </div>
          )}

          {recipeToDisplay.tags && recipeToDisplay.tags.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold font-headline mb-2 text-primary/80 flex items-center"><Tag className="mr-2 h-5 w-5"/>Tags</h3>
              <div className="flex flex-wrap gap-2">
                {recipeToDisplay.tags.map((tag, index) => <Badge key={`${tag}-${index}`} variant="secondary">{tag}</Badge>)}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t mt-6">
           {!isSavedRecipe(originalRecipe!) && userInputIngredients && ( 
            <Button onClick={handleSave} disabled={isRecipeSaved} className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <ChefHat className="mr-2 h-5 w-5" /> {isRecipeSaved ? 'Saved to My Recipes' : 'Save to My Recipes'}
            </Button>
           )}
           {isSavedRecipe(originalRecipe!) && ( 
             <Button disabled className="bg-accent/70 text-accent-foreground">
              <ChefHat className="mr-2 h-5 w-5" /> Saved
            </Button>
           )}
          <Button onClick={handleShare} variant="outline">
            {isShareCopied ? <ClipboardCheck className="mr-2 h-5 w-5" /> : <Share2 className="mr-2 h-5 w-5" />}
            {isShareCopied ? 'Copied Link!' : 'Share Recipe'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

// Skeleton component for Suspense fallback
function RecipeViewLoadingSkeleton() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto py-8">
      <Skeleton className="h-12 w-3/4" />
      <Skeleton className="h-8 w-1/2" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end border-b pb-4 mb-4">
        <Skeleton className="h-10 w-full sm:w-48" />
        <Skeleton className="h-10 w-full sm:w-36" />
      </div>
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-60 w-full" />
      <div className="flex justify-end gap-2 pt-6 border-t mt-6">
          <Skeleton className="h-10 w-36" />
          <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}

// New default export wrapping the client content with Suspense
export default function RecipeViewPage() {
  return (
    <Suspense fallback={<RecipeViewLoadingSkeleton />}>
      <RecipeViewClientContent />
    </Suspense>
  );
}
