import { MealPlannerStrategy } from "./MealPlannerStrategy";

export class DailyStrategy implements MealPlannerStrategy {
  constructor(private date: Date) {}

  getTitle() {
    return `Planejamento do Dia - ${this.date.toLocaleDateString()}`;
  }

  getGrid() {
    const meals = [
      "Café da manhã",
      "Almoço",
      "Jantar",
      "Lanche Extra",
    ];
    return [
      meals.map(label => ({
        label,
        meals: [],
        date: this.date,
      })),
    ];
  }

}
