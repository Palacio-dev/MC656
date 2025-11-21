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
   */
  const fetchRecipeDetails = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    setRecipe(null);

    try {
      const data = await getRecipeById(id);
      setRecipe(data);
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

  useEffect(() => {
    if (recipe) {
      FirebaseRecipeService.saveRecipe(recipe)
        .then(() => console.log("Receita salva no Firebase:", recipe.title))
        .catch(err => console.error("Erro ao salvar receita:", err));
    }
  }, [recipe]);

  return {
    // State
    recipe,
    isLoading,
    error,
    
    // Actions
    retry,
  };
}
