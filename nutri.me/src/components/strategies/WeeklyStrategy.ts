import { MealPlannerStrategy, MealPlannerCell } from "./MealPlannerStrategy";

export class WeeklyStrategy implements MealPlannerStrategy {
  private referenceDate: Date;

  constructor(referenceDate: Date) {
    this.referenceDate = referenceDate;
  }

  private getStartOfWeek(): Date {
    const d = new Date(this.referenceDate);
    const day = d.getDay(); // 0 = domingo, 1 = segunda...
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // começar na segunda
    return new Date(d.setDate(diff));
  }

  private getEndOfWeek(): Date {
    const start = this.getStartOfWeek();
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return end;
  }

  getTitle(): string {
    const start = this.getStartOfWeek();
    const end = this.getEndOfWeek();
    return `Planejamento semanal: ${start.toLocaleDateString('pt-BR')} - ${end.toLocaleDateString('pt-BR')}`;
  }

  getGrid(): MealPlannerCell[][] {
    const start = this.getStartOfWeek();
    const rows: MealPlannerCell[][] = [];

    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);

      rows.push([
        { label: "Café da manhã", date: day },
        { label: "Almoço",        date: day },
        { label: "Jantar",        date: day },
        { label: "Lanche",        date: day },
      ]);
    }

    return rows;
  }

  getDateRange(): { start: Date; end: Date } {
    return {
      start: this.getStartOfWeek(),
      end: this.getEndOfWeek(),
    };
  }
}