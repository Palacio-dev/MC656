import { MealPlannerStrategy, MealPlannerCell } from "./MealPlannerStrategy";

export class DailyStrategy implements MealPlannerStrategy {
  constructor(private date: Date) {
    this.date = date;
  }

  getTitle() {
    return `Planejamento do Dia - ${this.date.toLocaleDateString()}`;
  }

  getGrid(): MealPlannerCell[][] {
    return [[
      { label: "Café da manhã", date: this.date },
      { label: "Almoço", date: this.date },
      { label: "Jantar", date: this.date },
      { label: "Lanche", date: this.date },
    ]];
  }

  getDateRange(): { start: Date; end: Date; } {
      const start = new Date(this.date);
      const end = new Date(this.date);
      return { start, end };
  }
}
