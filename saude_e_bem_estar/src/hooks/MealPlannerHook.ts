import { makeAutoObservable, runInAction } from "mobx";
import { MealPlannerStrategy } from "../components/strategies/MealPlannerStrategy";
import { DailyStrategy } from "../components/strategies/DailyStrategy";
import { WeeklyStrategy } from "../components/strategies/WeeklyStrategy";
import { MonthlyStrategy } from "../components/strategies/MonthlyStrategy";
import type { MealPlannerModel } from "../models/firebaseMealPlannerModel";

export interface MealEntry {
  breakfast?: string;
  lunch?: string;
  dinner?: string;
  snack?: string;
}

function toDateKey(date: Date): string {
  return date.toISOString().split("T")[0]; // 'YYYY-MM-DD'
}

export class MealPlannerViewModel {
  strategy: MealPlannerStrategy;
  private model: MealPlannerModel;
  private userId: string | null;

  // Estado das refeições organizado por índice da linha (dia)
  mealsByDate: Record<string, MealEntry> = {};

  loading: boolean = false;
  error: string | null = null;

  constructor(model: MealPlannerModel, userId: string | null) {
    this.model = model;
    this.userId = userId;

    this.strategy = new DailyStrategy(new Date());
    makeAutoObservable(this);

    this.loadMealsForCurrentView();
  }

  private getDateRangeForCurrentView() {
    return this.strategy.getDateRange();
  }


  async loadMealsForCurrentView() {
    if (!this.userId) {
      this.mealsByDate = {}
      this.loading = false;
      this.error = null;
      return;
    }

    this.loading = true;
    this.error = null;

    const { start, end } = this.getDateRangeForCurrentView();

    try {
      const meals = await this.model.loadMealsForRange(
        this.userId,
        start,
        end
      );

      runInAction(() => {
        this.mealsByDate = meals;
      });
    } catch (err: any) {
      console.error(err);
      runInAction(() => {
        this.error = err.message || "Erro ao carregar refeições.";
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }


  setDailyView(date: Date) {
    this.strategy = new DailyStrategy(date);
    this.loadMealsForCurrentView();
  }

  setWeeklyView() {
    this.strategy = new WeeklyStrategy(new Date());
    this.loadMealsForCurrentView();
  }

  setMonthlyView(month: number, year: number) {
    this.strategy = new MonthlyStrategy(month, year);
    this.loadMealsForCurrentView();
  }

  getMealForDate(date: Date): MealEntry | undefined {
    return this.mealsByDate[toDateKey(date)];
  }

  async updateMeal(
    date: Date,
    mealType: keyof MealEntry,
    value: string
  ) {
    const key = toDateKey(date);
    const current = this.mealsByDate[key] || {};

    const updated: MealEntry = {
      ...current,
      [mealType]: value,
    };

    this.mealsByDate[key] = updated;
    if (!this.userId) return;

    try {
      await this.model.saveMealForDate(this.userId, date, updated);
    } catch (err) {
      console.error(err);
      // se quiser, pode setar alguma mensagem de erro
    }
  }
}