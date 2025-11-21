import {
  RecipeSearchResponse,
  RecipeDetailsResponse,
} from '../models/RecipeModel';

// API base URL
// In development: connect directly to backend on port 4000
// In production/mobile: can be configured via REACT_APP_API_URL environment variable
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

/**
 * Generic API call wrapper for the Recipe API
 */
async function recipeApiCall<T>(endpoint: string): Promise<T> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log('[RecipeService] Fetching:', url);
    const response = await fetch(url);
    
    // Check if response is ok before parsing
    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
    }

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Resposta não é JSON:', text.substring(0, 200));
      throw new Error('Resposta inválida do servidor');
    }

    const data = await response.json();
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
  const data = await recipeApiCall<RecipeDetailsResponse>(`/recipe/${encodedId}`);

  // 👇 Aqui adicionamos o ID manualmente ao objeto
  return {
    ...data,
    id // <-- mantém o ID original do TudoGostoso
  } as RecipeDetailsResponse;
}
