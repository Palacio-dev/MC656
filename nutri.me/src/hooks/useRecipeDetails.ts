import { useState, useEffect, useCallback } from 'react';
import { getRecipeById } from '../services/RecipeService';
import { RecipeDetailsResponse } from '../models/RecipeModel';
import { FirebaseRecipeService } from '../services/FirebaseRecipeService';

/**
 * Custom hook for recipe details functionality
 * Handles fetching and displaying a single recipe's full details
 */
export function useRecipeDetails(recipeId: string | null) {
  const [recipe, setRecipe] = useState<RecipeDetailsResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch recipe details by ID
   * First checks Firebase cache, then falls back to API
   */
  const fetchRecipeDetails = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    setRecipe(null);

    try {
      // First, try to get the recipe from Firebase
      const cachedRecipe = await FirebaseRecipeService.getRecipe(id);
      
      if (cachedRecipe) {
        console.log('Recipe loaded from Firebase:', cachedRecipe.title);
        setRecipe(cachedRecipe);
      } else {
        // If not in Firebase, fetch from API
        console.log('Recipe not in Firebase, fetching from API...');
        const data = await getRecipeById(id);
        setRecipe(data);
        
        // Save to Firebase for future use
        await FirebaseRecipeService.saveRecipe(data);
        console.log('Recipe saved to Firebase:', data.title);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erro ao carregar receita. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Retry loading the recipe
   */
  const retry = useCallback(() => {
    if (recipeId) {
      fetchRecipeDetails(recipeId);
    }
  }, [recipeId, fetchRecipeDetails]);

  /**
   * Load recipe when ID changes
   */
  useEffect(() => {
    if (recipeId) {
      fetchRecipeDetails(recipeId);
    }
  }, [recipeId, fetchRecipeDetails]);

  return {
    // State
    recipe,
    isLoading,
    error,
    
    // Actions
    retry,
  };
}
