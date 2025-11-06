import { MealPlannerStrategy } from "./MealPlannerStrategy";

export class MonthlyStrategy implements MealPlannerStrategy {
  constructor(private month: number, private year: number) {}

  getTitle() {
    return `Planejamento Mensal`;
  }

  getGrid() {
    const days = new Date(this.year, this.month + 1, 0).getDate();

    return Array.from({ length: days }).map(() => [
      { label: "Café da manhã", meals: [] },
      { label: "Almoço", meals: [] },
      { label: "Jantar", meals: [] },
      { label: "Lanche Extra", meals: [] },
    ]);
  }
}