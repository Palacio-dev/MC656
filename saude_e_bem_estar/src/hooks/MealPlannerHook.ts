import { makeAutoObservable } from "mobx";
import { MealPlannerStrategy } from "../components/strategies/MealPlannerStrategy";
import { DailyStrategy } from "../components/strategies/DailyStrategy";
import { WeeklyStrategy } from "../components/strategies/WeeklyStrategy";
import { MonthlyStrategy } from "../components/strategies/MonthlyStrategy";

export interface MealEntry {
  breakfast?: string;
  lunch?: string;
  dinner?: string;
  snack?: string;
}

export class MealPlannerViewModel {
  strategy: MealPlannerStrategy;

  // Estado das refeições organizado por índice da linha (dia)
  meals: Record<number, MealEntry> = {};

  constructor() {
    this.strategy = new DailyStrategy(new Date());
    makeAutoObservable(this);
  }

  setDailyView(date: Date) {
    this.strategy = new DailyStrategy(date);
  }

  setWeeklyView() {
    this.strategy = new WeeklyStrategy(new Date());
  }

  setMonthlyView(month: number, year: number) {
    this.strategy = new MonthlyStrategy(month, year);
  }

  // ✅ Método para atualizar refeições
  updateMeal(dayIndex: number, mealType: keyof MealEntry, value: string) {
    if (!this.meals[dayIndex]) this.meals[dayIndex] = {};
    this.meals[dayIndex][mealType] = value;
  }
}