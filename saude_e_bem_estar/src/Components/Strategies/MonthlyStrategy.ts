import { MealPlannerStrategy } from "./MealPlannerStrategy";

export class MonthlyStrategy implements MealPlannerStrategy {
  constructor(private month: number, private year: number) {}

  getTitle() {
    return `Planejamento Mensal`;
  }

  getGrid() {
    const daysInMonth = new Date(this.year, this.month + 1, 0).getDate();
    const meals = ["Café da manhã", "Almoço", "Jantar", "Lanche Extra"];

    return Array.from({ length: daysInMonth }).map((_, i) => {
      const date = new Date(this.year, this.month, i + 1);
      return meals.map(label => ({ label, meals: [], date }));
    });
  }
}