import { useState, useCallback } from 'react';
import { searchRecipes } from '../services/RecipeService';
import { RecipeSearchResult } from '../models/RecipeModel';

/**
 * Custom hook for recipe search functionality
 * Handles search state, loading, and error management
 */
export function useRecipeSearch() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<RecipeSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  /**
   * Perform recipe search
   */
  const performSearch = useCallback(async (query: string | null | undefined) => {
    // Validate query
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      setError('Por favor, digite o nome de uma receita');
      setSearchResults([]);
      setHasSearched(false);
      setIsLoading(false);
      return;
    }

    if (!/^[a-zA-Z0-9À-ÿ% ]+$/.test(query)) {
      setError("Por favor, digite apenas letras e números");
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const results = await searchRecipes(query.trim());
      setSearchResults(results);
      
      if (results.length === 0) {
        setError('Nenhuma receita encontrada. Tente outra busca.');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erro ao buscar receitas. Tente novamente.');
      }
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Handle search input change
   */
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    // Clear error when user starts typing again
    if (error) {
      setError(null);
    }
  }, [error]);

  /**
   * Handle search submission
   */
  const handleSearchSubmit = useCallback(() => {
    performSearch(searchQuery);
  }, [searchQuery, performSearch]);

  /**
   * Clear search results and reset state
   */
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setError(null);
    setHasSearched(false);
  }, []);

  return {
    // State
    searchQuery,
    searchResults,
    isLoading,
    error,
    hasSearched,
    
    // Actions
    handleSearchChange,
    handleSearchSubmit,
    performSearch,
    clearSearch,
  };
}
