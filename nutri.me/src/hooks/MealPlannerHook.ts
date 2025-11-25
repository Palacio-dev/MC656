import { makeAutoObservable, runInAction } from "mobx";
import { MealPlannerStrategy } from "../components/strategies/MealPlannerStrategy";
import { DailyStrategy } from "../components/strategies/DailyStrategy";
import { WeeklyStrategy } from "../components/strategies/WeeklyStrategy";
import { MonthlyStrategy } from "../components/strategies/MonthlyStrategy";
import type { MealPlannerModel } from "../services/firebaseMealPlannerModel";

export interface MealData {
  title: string;
  recipeId?: string; // Optional: TudoGostoso recipe ID if it's from a recipe
}

export interface MealEntry {
  breakfast?: MealData | string; // Support both new format and legacy string
  lunch?: MealData | string;
  dinner?: MealData | string;
  snack?: MealData | string;
  [key: string]: MealData | string | undefined; // Allow custom meal slots
}

function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`; // 'YYYY-MM-DD'
}

export class MealPlannerViewModel {
  strategy: MealPlannerStrategy;
  private model: MealPlannerModel;
  private userId: string | null;

  mealsByDate: Record<string, MealEntry> = {};
  loading: boolean = false;
  error: string | null = null;

  constructor(model: MealPlannerModel, userId: string | null) {
    this.model = model;
    this.strategy = new DailyStrategy(new Date());
    this.userId = null; // será definido via setUser

    makeAutoObservable(this);

    // Toda a lógica de troca de usuário fica centralizada aqui
    this.setUser(userId);
  }

  // Troca de usuário (login / logout / troca de conta)
  setUser(userId: string | null) {
    this.userId = userId;

    // Sempre limpa cache ao trocar de usuário pra não misturar dados
    this.mealsByDate = {};
    this.error = null;

    if (this.userId) {
      // Se há usuário logado, carrega refeições para a visão atual
      this.loadMealsForCurrentView();
    } else {
      // Se não há usuário, garante que não estamos em "loading"
      this.loading = false;
    }
  }

  private getDateRangeForCurrentView() {
    return this.strategy.getDateRange();
  }

  async loadMealsForCurrentView() {
    if (!this.userId) {
      // Sem usuário -> limpa estado e não tenta bater no Firebase
      runInAction(() => {
        this.mealsByDate = {};
        this.loading = false;
        this.error = null;
      });
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
        // Mescla com o que já estava em memória (caso já tenhamos carregado outros períodos)
        this.mealsByDate = {
          ...this.mealsByDate,
          ...meals,
        };
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
    value: string | MealData
  ) {
    const key = toDateKey(date);
    const current = this.mealsByDate[key] || {};

    const updated: MealEntry = {
      ...current,
      [mealType]: value,
    };

    // Atualiza estado local sempre (para UI responder na hora)
    this.mealsByDate[key] = updated;

    // Sem usuário logado -> não persiste no Firebase
    if (!this.userId) return;

    try {
      await this.model.saveMealForDate(this.userId, date, updated);
    } catch (err) {
      console.error(err);
    }
  }

  // Helper to get meal title (works with both string and MealData format)
  getMealTitle(meal: string | MealData | undefined): string {
    if (!meal) return "";
    if (typeof meal === "string") return meal;
    return meal.title;
  }

  // Helper to get meal recipe ID
  getMealRecipeId(meal: string | MealData | undefined): string | undefined {
    if (!meal || typeof meal === "string") return undefined;
    return meal.recipeId;
  }
}
