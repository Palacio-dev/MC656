import { RecipeDetailsResponse } from './RecipeModel';
import { searchIngredientMatches } from './IngredientMatcherService';
import { Product } from '../types/product';

/**
 * Nutritional information for a recipe
 */
export interface RecipeNutrition {
  recipeId: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  fiber: number;
  portionOutput: number; // Number of servings
  perServing: {
    calories: number;
    carbs: number;
    protein: number;
    fat: number;
    fiber: number;
  };
  calculationMethod: 'stored' | 'calculated';
  lastCalculated: Date;
  ingredients: IngredientNutrition[];
}

export interface IngredientNutrition {
  originalText: string;
  matchedProduct: Product | null;
  estimatedQuantity: number; // in grams
  nutritionContribution: {
    calories: number;
    carbs: number;
    protein: number;
    fat: number;
    fiber: number;
  };
}

/**
 * Extract quantity from ingredient text
 * Examples:
 * - "200g de farinha" -> 200
 * - "2 xícaras de açúcar" -> 240 (1 xícara = 120g)
 * - "4 ovos" -> 200 (1 ovo = 50g)
 * - "1/2 xícara" -> 60
 * - "2 e 1/2 xícaras" -> 300
 */
function extractQuantity(ingredientText: string): number {
  const text = ingredientText.toLowerCase();
  
  // Check for "a gosto" or "pitada" first - these should be minimal
  if (text.includes('pitada') || text.includes('a gosto') || text.includes('q.b.') || text.includes('quanto baste')) {
    return 1; // Very small amount, almost negligible
  }
  
  // Handle fractions and mixed numbers
  let baseNumber = 0;
  
  // Pattern: "2 e 1/2" or "2 1/2"
  const mixedMatch = text.match(/(\d+)\s*(?:e\s*)?(\d+)\/(\d+)/);
  if (mixedMatch) {
    const whole = parseInt(mixedMatch[1]);
    const numerator = parseInt(mixedMatch[2]);
    const denominator = parseInt(mixedMatch[3]);
    baseNumber = whole + (numerator / denominator);
  } else {
    // Pattern: "1/2"
    const fractionMatch = text.match(/(\d+)\/(\d+)/);
    if (fractionMatch) {
      const numerator = parseInt(fractionMatch[1]);
      const denominator = parseInt(fractionMatch[2]);
      baseNumber = numerator / denominator;
    } else {
      // Pattern: regular number with optional decimal
      const numberMatch = text.match(/(\d+[.,]?\d*)/);
      baseNumber = numberMatch ? parseFloat(numberMatch[1].replace(',', '.')) : 1;
    }
  }
  
  // Common unit conversions to grams
  const unitConversions: { [key: string]: number } = {
    // Weight units - check these first
    'kg': 1000,
    'g': 1,
    'gr': 1,
    'grama': 1,
    'gramas': 1,
    
    // Volume to weight (approximate for common ingredients)
    'xícara': 120,
    'xícaras': 120,
    'xic': 120,
    'copo': 240,
    'copos': 240,
    
    // Spoon measures - MUST come before checking for just numbers
    'colher (sopa)': 15,
    'colheres (sopa)': 15,
    'colher de sopa': 15,
    'colheres de sopa': 15,
    'colher sopa': 15,
    'col. sopa': 15,
    'col sopa': 15,
    'cs': 15,
    '(sopa)': 15, // Catches "colher (sopa)"
    'sopa': 15, // Last resort for sopa
    
    'colher (chá)': 5,
    'colheres (chá)': 5,
    'colher de chá': 5,
    'colheres de chá': 5,
    'colher chá': 5,
    'col. chá': 5,
    'col chá': 5,
    'cc': 5,
    '(chá)': 5, // Catches "colher (chá)"
    
    // Liquid measures
    'ml': 1,
    'mililitro': 1,
    'mililitros': 1,
    'litro': 1000,
    'litros': 1000,
    
    // Common items
    'ovo': 50,
    'ovos': 50,
    'dente': 5, // garlic clove
    'dentes': 5,
  };
  
  // Check for unit matches (order matters - check longer strings first)
  const sortedUnits = Object.entries(unitConversions).sort((a, b) => b[0].length - a[0].length);
  for (const [unit, gramsPerUnit] of sortedUnits) {
    if (text.includes(unit)) {
      const result = baseNumber * gramsPerUnit;
      console.log(`   📏 Extraído: ${baseNumber} ${unit} = ${result}g`);
      return result;
    }
  }
  
  // Special case: if text has "l" at the end preceded by number (like "200ml" -> already handled, but "2l")
  if (text.match(/(\d+)\s*l\b/)) {
    const result = baseNumber * 1000;
    console.log(`   📏 Extraído: ${baseNumber} litros = ${result}g`);
    return result;
  }
  
  // If we found a number but no unit, try to infer from ingredient
  if (baseNumber > 0) {
    // Check for specific ingredients with known weights
    if (text.includes('banana')) {
      const result = baseNumber * 120;
      console.log(`   📏 Extraído: ${baseNumber} bananas = ${result}g`);
      return result;
    }
    if (text.includes('tomate')) {
      const result = baseNumber * 100;
      console.log(`   📏 Extraído: ${baseNumber} tomates = ${result}g`);
      return result;
    }
    if (text.includes('cebola')) {
      const result = baseNumber * 150;
      console.log(`   📏 Extraído: ${baseNumber} cebolas = ${result}g`);
      return result;
    }
    if (text.includes('batata')) {
      const result = baseNumber * 150;
      console.log(`   📏 Extraído: ${baseNumber} batatas = ${result}g`);
      return result;
    }
    if (text.includes('cenoura')) {
      const result = baseNumber * 100;
      console.log(`   📏 Extraído: ${baseNumber} cenouras = ${result}g`);
      return result;
    }
    if (text.includes('maçã')) {
      const result = baseNumber * 150;
      console.log(`   📏 Extraído: ${baseNumber} maçãs = ${result}g`);
      return result;
    }
    
    // Generic fallback for counted items
    console.log(`   📏 Extraído: ${baseNumber} unidades (genérico) = ${baseNumber * 30}g`);
    return baseNumber * 30;
  }
  
  // No quantity found - assume very small amount since it wasn't specified
  console.log(`   📏 Sem quantidade especificada, assumindo 20g`);
  return 20;
}

/**
 * Calculate nutrition contribution from a matched product
 */
function calculateNutritionContribution(
  product: Product,
  quantityInGrams: number
): IngredientNutrition['nutritionContribution'] {
  // Product nutrition is per 100g, so we scale by quantity
  const multiplier = quantityInGrams / 100;
  
  return {
    calories: product.calories * multiplier,
    carbs: product.carbs * multiplier,
    protein: product.protein * multiplier,
    fat: product.fat * multiplier,
    fiber: product.fiber * multiplier,
  };
}

/**
 * Calculate nutrition for a single ingredient
 */
async function calculateIngredientNutrition(
  ingredientText: string
): Promise<IngredientNutrition> {
  // Extract quantity from ingredient text
  const estimatedQuantity = extractQuantity(ingredientText);
  
  // Search for matching product in database
  const matchResult = await searchIngredientMatches(ingredientText);
  const matchedProduct = matchResult.matches[0] || null;
  
  // Calculate nutrition contribution
  let nutritionContribution = {
    calories: 0,
    carbs: 0,
    protein: 0,
    fat: 0,
    fiber: 0,
  };
  
  if (matchedProduct) {
    nutritionContribution = calculateNutritionContribution(
      matchedProduct,
      estimatedQuantity
    );
  }
  
  return {
    originalText: ingredientText,
    matchedProduct,
    estimatedQuantity,
    nutritionContribution,
  };
}

/**
 * Calculate total nutrition for a recipe based on ingredients
 */
export async function calculateRecipeNutrition(
  recipe: RecipeDetailsResponse
): Promise<RecipeNutrition> {
  console.log(`\n🍳 Calculando nutrição para: ${recipe.title}`);
  
  // Extract all ingredient items from all sections
  const allIngredients: string[] = [];
  recipe.ingredients.forEach(section => {
    allIngredients.push(...section.items);
  });
  
  console.log(`📝 Total de ingredientes: ${allIngredients.length}`);
  
  // Calculate nutrition for each ingredient
  const ingredientNutritions: IngredientNutrition[] = [];
  
  for (const ingredient of allIngredients) {
    const nutrition = await calculateIngredientNutrition(ingredient);
    ingredientNutritions.push(nutrition);
    
    if (nutrition.matchedProduct) {
      console.log(
        `✅ "${ingredient}"\n` +
        `   → ${nutrition.matchedProduct.name}\n` +
        `   → ${nutrition.estimatedQuantity}g = ${nutrition.nutritionContribution.calories.toFixed(0)} kcal`
      );
    } else {
      console.log(`⚠️ "${ingredient}" → Não encontrado (contribuição: 0 kcal)`);
    }
  }
  
  // Sum up total nutrition
  const totalNutrition = ingredientNutritions.reduce(
    (sum, ing) => ({
      calories: sum.calories + ing.nutritionContribution.calories,
      carbs: sum.carbs + ing.nutritionContribution.carbs,
      protein: sum.protein + ing.nutritionContribution.protein,
      fat: sum.fat + ing.nutritionContribution.fat,
      fiber: sum.fiber + ing.nutritionContribution.fiber,
    }),
    { calories: 0, carbs: 0, protein: 0, fat: 0, fiber: 0 }
  );
  
  const portionOutput = recipe.stats.portion_output || 1;
  
  // Calculate per serving
  const perServing = {
    calories: totalNutrition.calories / portionOutput,
    carbs: totalNutrition.carbs / portionOutput,
    protein: totalNutrition.protein / portionOutput,
    fat: totalNutrition.fat / portionOutput,
    fiber: totalNutrition.fiber / portionOutput,
  };
  
  console.log(`\n📊 RESUMO DA RECEITA:`);
  console.log(`   Total: ${totalNutrition.calories.toFixed(0)} kcal`);
  console.log(`   Porções: ${portionOutput}`);
  console.log(`   Por porção: ${perServing.calories.toFixed(0)} kcal`);
  console.log(`   Carbs: ${perServing.carbs.toFixed(1)}g | Proteína: ${perServing.protein.toFixed(1)}g | Gordura: ${perServing.fat.toFixed(1)}g\n`);
  
  return {
    recipeId: recipe.id,
    calories: totalNutrition.calories,
    carbs: totalNutrition.carbs,
    protein: totalNutrition.protein,
    fat: totalNutrition.fat,
    fiber: totalNutrition.fiber,
    portionOutput,
    perServing,
    calculationMethod: 'calculated',
    lastCalculated: new Date(),
    ingredients: ingredientNutritions,
  };
}

/**
 * Get or calculate recipe nutrition
 * First checks if nutrition data is stored in Firebase
 * If not found, calculates it from ingredients and optionally saves it
 */
export async function getRecipeNutrition(
  recipe: RecipeDetailsResponse,
  saveToFirebase: boolean = true
): Promise<RecipeNutrition> {
  // Import dynamically to avoid circular dependency
  const { FirebaseRecipeService } = await import('./FirebaseRecipeService');
  
  // Check if nutrition data already exists in Firebase
  const storedNutrition = await FirebaseRecipeService.getRecipeNutrition(recipe.id);
  
  if (storedNutrition) {
    console.log('✅ Dados nutricionais encontrados no cache');
    return {
      ...storedNutrition,
      calculationMethod: 'stored'
    };
  }
  
  // Calculate nutrition from ingredients
  console.log('🔄 Calculando nutrição dos ingredientes...');
  const nutrition = await calculateRecipeNutrition(recipe);
  
  if (saveToFirebase) {
    console.log('💾 Salvando dados nutricionais no Firebase...');
    await FirebaseRecipeService.saveRecipeNutrition(recipe.id, nutrition);
  }
  
  return nutrition;
}
