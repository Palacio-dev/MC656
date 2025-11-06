export interface GridCell {
  label: string;
  meals: string[];
}

export interface MealPlannerStrategy {
  getTitle(): string;
  getGrid(): GridCell[][];
}