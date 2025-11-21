import { MealPlannerStrategy, MealPlannerCell } from "./MealPlannerStrategy";

export class MonthlyStrategy implements MealPlannerStrategy {
  private month: number; // 0-11
  private year: number;

  constructor(month: number, year: number) {
    this.month = month;
    this.year = year;
  }

  private getStartOfMonth(): Date {
    return new Date(this.year, this.month, 1);
  }

  private getEndOfMonth(): Date {
    return new Date(this.year, this.month + 1, 0); // dia 0 do próximo mês = último do atual
  }

  getTitle(): string {
    const start = this.getStartOfMonth();
    return `Planejamento mensal - ${start.toLocaleDateString(undefined, {
      month: "long",
      year: "numeric",
    })}`;
  }

  getGrid(): MealPlannerCell[][] {
    const start = this.getStartOfMonth();
    const end = this.getEndOfMonth();

    const rows: MealPlannerCell[][] = [];
    let current = new Date(start);

    while (current <= end) {
      // cada linha poderia ser um dia com 4 refeições
      rows.push([
        { label: "Café da manhã", date: new Date(current) },
        { label: "Almoço",        date: new Date(current) },
        { label: "Jantar",        date: new Date(current) },
        { label: "Lanche",        date: new Date(current) },
      ]);

      current.setDate(current.getDate() + 1);
    }

    return rows;
  }

  getDateRange(): { start: Date; end: Date } {
    return {
      start: this.getStartOfMonth(),
      end: this.getEndOfMonth(),
    };
  }
}