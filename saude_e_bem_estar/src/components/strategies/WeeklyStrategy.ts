// strategies/WeeklyStrategy.ts
import { MealPlannerStrategy } from "./MealPlannerStrategy";

export class WeeklyStrategy implements MealPlannerStrategy {
  constructor(private startOfWeek: Date) {}

  getTitle() {
    return `Planejamento Semanal`;
  }

  getGrid() {
    const days = 7;
    const meals = ["Café da manhã", "Almoço", "Jantar", "Lanche Extra"];

    return Array.from({ length: days }).map((_, i) => {
      const date = new Date(this.startOfWeek);
      date.setDate(this.startOfWeek.getDate() + i);
      return meals.map(label => ({ label, meals: [], date }));
    });
  }
}
