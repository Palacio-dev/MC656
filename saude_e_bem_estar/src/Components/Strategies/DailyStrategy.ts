import { MealPlannerStrategy } from "./MealPlannerStrategy";

export class DailyStrategy implements MealPlannerStrategy {
  constructor(private date: Date) {}

  getTitle() {
    return `Planejamento do Dia - ${this.date.toLocaleDateString()}`;
  }

  getGrid() {
    return [
      [
        { label: "Café da manhã", meals: [] },
        { label: "Almoço", meals: [] },
        { label: "Jantar", meals: [] },
        { label: "Lanche Extra", meals: [] },
      ],
    ];
  }
}
