import { FirebaseRecipeService } from './FirebaseRecipeService';
import { RecipeNutrition } from './RecipeNutritionService';

export interface PeriodNutritionSummary {
  totalCalories: number;
  totalCarbs: number;
  totalProtein: number;
  totalFat: number;
  totalFiber: number;
  mealsWithNutrition: number;
  totalMeals: number;
  dailyAverages: {
    calories: number;
    carbs: number;
    protein: number;
    fat: number;
    fiber: number;
  };
}

/**
 * Extract recipe ID from meal object
 */
function extractRecipeId(meal: any): string | null {
  if (!meal) return null;
  
  if (typeof meal === 'object' && meal.recipeId) {
    return meal.recipeId;
  }
  
  return null;
}

/**
 * Calculate nutrition summary for a date range
 */
export async function calculatePeriodNutrition(
  mealPlan: { [dateKey: string]: any },
  startDate: Date,
  endDate: Date
): Promise<PeriodNutritionSummary> {
  console.log(`\n📊 Calculando nutrição do período: ${startDate.toLocaleDateString()} até ${endDate.toLocaleDateString()}`);
  
  let totalCalories = 0;
  let totalCarbs = 0;
  let totalProtein = 0;
  let totalFat = 0;
  let totalFiber = 0;
  let mealsWithNutrition = 0;
  let totalMeals = 0;
  
  // Iterate through each date in the range
  const currentDate = new Date(startDate);
  const daysInPeriod = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  while (currentDate <= endDate) {
    const dateKey = currentDate.toISOString().split('T')[0];
    const mealsForDate = mealPlan[dateKey];
    
    if (mealsForDate) {
      // Check all meal slots for this date
      for (const mealKey in mealsForDate) {
        const meal = mealsForDate[mealKey];
        if (!meal) continue;
        
        totalMeals++;
        const recipeId = extractRecipeId(meal);
        
        if (recipeId) {
          // Try to get nutrition data for this recipe
          const nutrition = await FirebaseRecipeService.getRecipeNutrition(recipeId);
          
          if (nutrition) {
            // Use per-serving values
            totalCalories += nutrition.perServing.calories;
            totalCarbs += nutrition.perServing.carbs;
            totalProtein += nutrition.perServing.protein;
            totalFat += nutrition.perServing.fat;
            totalFiber += nutrition.perServing.fiber;
            mealsWithNutrition++;
            
            console.log(`  ✅ ${recipeId}: ${nutrition.perServing.calories.toFixed(0)} kcal`);
          } else {
            console.log(`  ⚠️ ${recipeId}: sem dados nutricionais`);
          }
        }
      }
    }
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Calculate daily averages
  const dailyAverages = {
    calories: totalCalories / daysInPeriod,
    carbs: totalCarbs / daysInPeriod,
    protein: totalProtein / daysInPeriod,
    fat: totalFat / daysInPeriod,
    fiber: totalFiber / daysInPeriod,
  };
  
  console.log(`\n📈 RESUMO DO PERÍODO:`);
  console.log(`   Total: ${totalCalories.toFixed(0)} kcal em ${daysInPeriod} dias`);
  console.log(`   Média diária: ${dailyAverages.calories.toFixed(0)} kcal/dia`);
  console.log(`   Refeições com dados: ${mealsWithNutrition}/${totalMeals}\n`);
  
  return {
    totalCalories,
    totalCarbs,
    totalProtein,
    totalFat,
    totalFiber,
    mealsWithNutrition,
    totalMeals,
    dailyAverages,
  };
}
