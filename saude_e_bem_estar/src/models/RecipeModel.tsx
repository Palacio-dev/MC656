// Recipe model interfaces based on the Receitas Web Scrapper API

/**
 * Recipe search result item
 * Used when searching for recipes by title
 */
export interface RecipeSearchResult {
  title: string;
  id: string;
}

/**
 * Recipe statistics
 */
export interface RecipeStats {
  prepare_time_minutes: number;
  portion_output: number;
  favorites: number;
}

/**
 * Recipe section (ingredients or instructions)
 * Can have multiple sections like "massa", "cobertura", etc.
 * or a single "default" section
 */
export interface RecipeSection {
  title: string;
  items: string[];
}

/**
 * Complete recipe details
 */
export interface RecipeDetails {
  title: string;
  stats: RecipeStats;
  ingredients: RecipeSection[];
  instructions: RecipeSection[];
}

/**
 * API Response types
 */
export type RecipeSearchResponse = RecipeSearchResult[];

export interface RecipeDetailsResponse extends RecipeDetails {}

/**
 * API Error response
 */
export interface RecipeErrorResponse {
  erro: string;
}
