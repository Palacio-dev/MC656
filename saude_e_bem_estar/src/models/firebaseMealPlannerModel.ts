import { db } from "../config/firebase";
import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import type { MealEntry } from "../hooks/MealPlannerHook";

export interface MealPlannerModel {
  saveMealForDate(
    userId: string,
    date: Date,
    meal: MealEntry
  ): Promise<void>;

  loadMealsForRange(
    userId: string,
    start: Date,
    end: Date
  ): Promise<Record<string, MealEntry>>;
}

function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export class FirebaseMealPlannerModel implements MealPlannerModel {
  private collectionRef = collection(db, "mealPlans");

  async saveMealForDate(
    userId: string,
    date: Date,
    meal: MealEntry
  ): Promise<void> {
    const dateKey = toDateKey(date);
    const docId = `${userId}_${dateKey}`;

    const docRef = doc(this.collectionRef, docId);

    await setDoc(
      docRef,
      {
        userId,
        date: dateKey,
        breakfast: meal.breakfast ?? "",
        lunch: meal.lunch ?? "",
        dinner: meal.dinner ?? "",
        snack: meal.snack ?? "",
      },
      { merge: true }
    );
  }

  async loadMealsForRange(
    userId: string,
    start: Date,
    end: Date
  ): Promise<Record<string, MealEntry>> {
    const startKey = toDateKey(start);
    const endKey = toDateKey(end);

    console.log("[MealPlannerModel] range:", {
      userId,
      start,
      end,
      startKey,
      endKey,
    });

    const q = query(
      this.collectionRef,
      where("userId", "==", userId),
      where("date", ">=", startKey),
      where("date", "<=", endKey)
    );

    const snapshot = await getDocs(q);

    console.log("[MealPlannerModel] docs encontrados:", snapshot.size);

    const result: Record<string, MealEntry> = {};

    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as any;
      const dateKey = data.date as string;

      result[dateKey] = {
        breakfast: data.breakfast ?? "",
        lunch: data.lunch ?? "",
        dinner: data.dinner ?? "",
        snack: data.snack ?? "",
      };
    });

    return result;
  }
}