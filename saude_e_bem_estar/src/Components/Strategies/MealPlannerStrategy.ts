export interface GridCell {
  label: string;
  meals: string[];
  date?: Date;
}

export interface MealPlannerStrategy {
  getTitle(): string;
  getGrid(): GridCell[][];
}