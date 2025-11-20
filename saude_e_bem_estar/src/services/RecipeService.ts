import {
  RecipeSearchResponse,
  RecipeDetailsResponse,
  RecipeErrorResponse,
} from '../models/RecipeModel';

// API base URL - Recipe API runs on port 4000 (React app uses 3000)
const API_BASE_URL = 'http://localhost:4000';

/**
 * Generic API call wrapper for the Recipe API
 */
async function recipeApiCall<T>(endpoint: string): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    const data = await response.json();

    if (!response.ok) {
      // API returns error in 'erro' field
      const errorData = data as RecipeErrorResponse;
      throw new Error(errorData.erro || 'Erro ao buscar receitas');
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Erro desconhecido ao buscar receitas');
  }
}

/**
 * Search for recipes by title
 * @param title - Recipe title or part of it
 * @returns Array of recipe search results
 * 
 * Example:
 * ```
 * const recipes = await searchRecipes('bolo');
 * ```
 */
export async function searchRecipes(title: string): Promise<RecipeSearchResponse> {
  if (!title || title.trim().length === 0) {
    throw new Error('Título da receita é obrigatório');
  }

  const encodedTitle = encodeURIComponent(title.trim());
  return recipeApiCall<RecipeSearchResponse>(`/search/${encodedTitle}`);
}

/**
 * Get recipe details by ID
 * @param id - Unique recipe identifier (obtained from search results)
 * @returns Complete recipe details
 * 
 * Example:
 * ```
 * const recipe = await getRecipeById('307527-bolo-de-aveia-com-cacau-no-micro-ondas');
 * ```
 */
export async function getRecipeById(id: string): Promise<RecipeDetailsResponse> {
  if (!id || id.trim().length === 0) {
    throw new Error('ID da receita é obrigatório');
  }

  const encodedId = encodeURIComponent(id.trim());
  return recipeApiCall<RecipeDetailsResponse>(`/recipe/${encodedId}`);
}
