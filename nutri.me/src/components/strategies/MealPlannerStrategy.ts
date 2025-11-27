export interface MealPlannerCell {
  label: string;
  date?: Date;
}

export interface MealPlannerStrategy {
  getGrid(): MealPlannerCell[][];
  getTitle(): string;

  getDateRange(): { start: Date; end: Date };
}