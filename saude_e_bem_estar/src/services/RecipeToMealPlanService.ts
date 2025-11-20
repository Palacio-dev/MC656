import { MealPlannerViewModel, MealEntry } from '../hooks/MealPlannerHook';
import type { MealPlanConfig } from '../components/AddRecipeToMealPlanModal';
import { FirebaseRecipeService } from "./FirebaseRecipeService";

/**
 * Service para adicionar receitas ao planejamento de refeições
 */
export class RecipeToMealPlanService {
  /**
   * Adiciona uma receita ao planejamento baseado na configuração
   */
  static async addRecipeToMealPlan(
    viewModel: MealPlannerViewModel,
    recipeTitle: string,
    config: MealPlanConfig
  ): Promise<number> {
    if (config.mode === 'single') {
      // Modo simples: adicionar a um dia específico
      if (!config.date) {
        throw new Error('Data não especificada');
      }
      
      await viewModel.updateMeal(config.date, config.mealType, recipeTitle);
      return 1; // 1 refeição adicionada
    } else {
      // Modo recorrente: adicionar a todos os dias da semana especificados no mês
      if (!config.weekdays || config.weekdays.length === 0) {
        throw new Error('Nenhum dia da semana selecionado');
      }
      if (config.month === undefined || config.year === undefined) {
        throw new Error('Mês ou ano não especificado');
      }

      return await this.addRecurringMeals(
        viewModel,
        recipeTitle,
        config.mealType,
        config.weekdays,
        config.month,
        config.year
      );
    }
  }

  /**
   * Adiciona refeições recorrentes para todos os dias da semana especificados em um mês
   */
  private static async addRecurringMeals(
    viewModel: MealPlannerViewModel,
    recipeTitle: string,
    mealType: string,
    weekdays: number[],
    month: number,
    year: number
  ): Promise<number> {
    const dates = this.getDatesForWeekdaysInMonth(weekdays, month, year);
    
    // Adiciona a receita para cada data encontrada
    const promises = dates.map(date => 
      viewModel.updateMeal(date, mealType, recipeTitle)
    );
    
    await Promise.all(promises);
    
    return dates.length; // Retorna o número de refeições adicionadas
  }

  /**
   * Retorna todas as datas de um mês que correspondem aos dias da semana especificados
   * @param weekdays Array de dias da semana (0 = Domingo, 1 = Segunda, ..., 6 = Sábado)
   * @param month Mês (0-11)
   * @param year Ano
   */
  private static getDatesForWeekdaysInMonth(
    weekdays: number[],
    month: number,
    year: number
  ): Date[] {
    const dates: Date[] = [];
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayOfWeek = date.getDay();
      
      if (weekdays.includes(dayOfWeek)) {
        dates.push(date);
      }
    }

    return dates;
  }
}
