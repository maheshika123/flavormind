
'use client';

import { useFormStatus } from 'react-dom';
import { useActionState, useEffect, useRef } from 'react'; // Changed useFormState to useActionState and import from 'react'
import { getRecipeSuggestionsAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Wand2 } from 'lucide-react';
import type { RecipeSuggestion } from '@/types';
import { useToast } from '@/hooks/use-toast';


interface IngredientFormProps {
  onSuggestions: (suggestions: RecipeSuggestion[], ingredients: string) => void;
  onError: (message: string) => void;
  onLoading: (loading: boolean) => void;
}

const initialState: {
  message: string | null;
  recipes: RecipeSuggestion[] | null;
  errors: { _form?: string[]; ingredients?: string[] } | null;
} = {
  message: null,
  recipes: null,
  errors: null,
};

interface SubmitButtonProps {
  // onLoading is removed as its logic is now self-contained via useEffect and useFormStatus
}

function SubmitButton({}: SubmitButtonProps) { // onLoading prop removed
  const { pending } = useFormStatus();
  // onLoading callback to parent is removed as its effect is now handled by parent's isLoading state via IngredientForm's onLoading prop triggered by form status.

  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground"
      aria-live="polite"
      aria-busy={pending}
    >
      <Wand2 className="mr-2 h-5 w-5" />
      {pending ? 'Generating...' : 'Generate Recipes'}
    </Button>
  );
}

export default function IngredientForm({ onSuggestions, onError, onLoading }: IngredientFormProps) {
  const [state, formAction] = useActionState(getRecipeSuggestionsAction, initialState); // Changed back to useActionState
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();
  const { pending } = useFormStatus(); // Get pending state here to call onLoading

  useEffect(() => {
    onLoading(pending);
  }, [pending, onLoading]);

  useEffect(() => {
    if (state?.recipes) {
      const ingredientsInput = formRef.current?.elements.namedItem('ingredients') as HTMLTextAreaElement | HTMLInputElement | null;
      const ingredients = ingredientsInput?.value || '';
      onSuggestions(state.recipes, ingredients);
      if (state.message && state.recipes.length > 0) {
        toast({
          title: "Recipes Generated!",
          description: state.message,
        });
      } else if (state.message && state.recipes.length === 0) {
         onError(state.message);
         toast({
            title: "No Recipes",
            description: state.message,
            variant: "default"
         })
      }
    } else if (state?.message && !state.recipes) {
      let errorMessage = state.message;
      if (state.errors?.ingredients) {
        errorMessage = state.errors.ingredients.join(', ');
      } else if (state.errors?._form) {
        errorMessage = state.errors._form.join(', ');
      }
      onError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [state, onSuggestions, onError, toast]);

  return (
    <form action={formAction} ref={formRef} className="space-y-6 bg-card p-6 sm:p-8 rounded-lg shadow-xl animate-fade-in">
      <div>
        <Label htmlFor="ingredients" className="text-lg font-semibold mb-2 block">
          What ingredients do you have?
        </Label>
        <Textarea
          id="ingredients"
          name="ingredients"
          placeholder="e.g., chicken breast, broccoli, garlic, soy sauce"
          rows={4}
          className="bg-background border-border focus:ring-primary"
          aria-describedby="ingredients-error"
          required
        />
        {state?.errors?.ingredients && (
          <p id="ingredients-error" className="text-sm text-destructive mt-1">
            {state.errors.ingredients.join(', ')}
          </p>
        )}
         {state?.errors?._form && (
          <p className="text-sm text-destructive mt-1">
            {state.errors._form.join(', ')}
          </p>
        )}
      </div>
      <SubmitButton />
    </form>
  );
}

