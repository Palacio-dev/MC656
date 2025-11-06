// strategies/WeeklyStrategy.ts
import { MealPlannerStrategy } from "./MealPlannerStrategy";

export class WeeklyStrategy implements MealPlannerStrategy {
  constructor(private startOfWeek: Date) {}

  getTitle() {
    return `Planejamento Semanal`;
  }

  getGrid() {
    const days = 7;
    return Array.from({ length: days }).map(() => [
      { label: "Café da manhã", meals: [] },
      { label: "Almoço", meals: [] },
      { label: "Jantar", meals: [] },
      { label: "Lanche Extra", meals: [] },
    ]);
  }
}
