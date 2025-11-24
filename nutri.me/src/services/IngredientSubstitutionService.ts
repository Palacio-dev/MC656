import { doc, setDoc, getDoc, query, where, collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";
import { RecipeNutrition } from "./RecipeNutritionService";

/**
 * User-specific ingredient substitution
 */
export interface IngredientSubstitution {
  recipeId: string;
  originalIngredient: string; // Original ingredient text
  substitutedProductName: string; // Name of the new product
  substitutedProductId?: string; // Optional: ID in alimentos database
  createdAt: Date;
}

/**
 * Recipe with user substitutions
 * Stored in top-level collection with userId field (matches shoppingLists pattern)
 */
export interface RecipeWithSubstitutions {
  userId: string;
  recipeId: string;
  substitutions: { [ingredientIndex: number]: IngredientSubstitution };
  customNutrition?: RecipeNutrition; // Recalculated nutrition with substitutions
  lastModified: Date;
}

/**
 * Save user substitutions for a recipe
 * Uses top-level collection with userId field to match existing Firebase security rules
 */
export async function saveUserSubstitutions(
  userId: string,
  recipeId: string,
  substitutions: { [ingredientIndex: number]: IngredientSubstitution },
  customNutrition?: RecipeNutrition
): Promise<void> {
  // Create a unique document ID combining userId and recipeId
  const docId = `${userId}_${recipeId}`;
  const docRef = doc(db, "recipeSubstitutions", docId);
  
  await setDoc(docRef, {
    userId,
    recipeId,
    substitutions,
    customNutrition: customNutrition ? {
      ...customNutrition,
      lastCalculated: customNutrition.lastCalculated.toISOString()
    } : null,
    lastModified: new Date().toISOString()
  });
}

/**
 * Get user substitutions for a recipe
 */
export async function getUserSubstitutions(
  userId: string,
  recipeId: string
): Promise<RecipeWithSubstitutions | null> {
  const docId = `${userId}_${recipeId}`;
  const docRef = doc(db, "recipeSubstitutions", docId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      userId: data.userId,
      recipeId: data.recipeId,
      substitutions: data.substitutions || {},
      customNutrition: data.customNutrition ? {
        ...data.customNutrition,
        lastCalculated: new Date(data.customNutrition.lastCalculated)
      } : undefined,
      lastModified: new Date(data.lastModified)
    };
  }
  
  return null;
}

/**
 * Delete user substitutions for a recipe
 */
export async function deleteUserSubstitutions(
  userId: string,
  recipeId: string
): Promise<void> {
  const docId = `${userId}_${recipeId}`;
  const docRef = doc(db, "recipeSubstitutions", docId);
  await setDoc(docRef, { deleted: true, userId, recipeId }); // Soft delete with userId for security rules
}
