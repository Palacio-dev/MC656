import { doc, setDoc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { RecipeDetailsResponse } from "../models/RecipeModel";
import { RecipeNutrition } from "./RecipeNutritionService";
import { db } from "../config/firebase";

export class FirebaseRecipeService {
  static async saveRecipe(recipe: RecipeDetailsResponse) {
    // Usamos o ID original do TudoGostoso
    const recipeRef = doc(db, "recipes", recipe.id);
    await setDoc(recipeRef, recipe, { merge: true });
  }

  static async getRecipe(recipeId: string): Promise<RecipeDetailsResponse | null> {
    const recipeRef = doc(db, "recipes", recipeId);
    const recipeSnap = await getDoc(recipeRef);

    if (recipeSnap.exists()) {
      return recipeSnap.data() as RecipeDetailsResponse;
    }

    return null;
  }

  /**
   * Save nutrition data for a recipe
   */
  static async saveRecipeNutrition(recipeId: string, nutrition: RecipeNutrition) {
    const recipeRef = doc(db, "recipes", recipeId);
    
    // Store nutrition data within the recipe document
    await setDoc(
      recipeRef,
      { 
        nutrition: {
          ...nutrition,
          lastCalculated: nutrition.lastCalculated.toISOString()
        }
      },
      { merge: true }
    );
  }

  /**
   * Get nutrition data for a recipe
   * Returns null if not found or not calculated yet
   */
  static async getRecipeNutrition(recipeId: string): Promise<RecipeNutrition | null> {
    const recipeRef = doc(db, "recipes", recipeId);
    const recipeSnap = await getDoc(recipeRef);

    if (recipeSnap.exists()) {
      const data = recipeSnap.data();
      
      if (data.nutrition) {
        return {
          ...data.nutrition,
          lastCalculated: new Date(data.nutrition.lastCalculated)
        } as RecipeNutrition;
      }
    }

    return null;
  }

  /**
   * Get all custom recipes (recipes with IDs starting with "custom_")
   * Returns array of custom recipes with title and id
   */
  static async getAllCustomRecipes(): Promise<{ id: string; title: string }[]> {
    try {
      const recipesRef = collection(db, "recipes");
      const snapshot = await getDocs(recipesRef);
      
      const customRecipes: { id: string; title: string }[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        const recipeId = doc.id;
        
        // Filter only custom recipes (IDs starting with "custom_")
        if (recipeId.startsWith("custom_") && data.title) {
          customRecipes.push({
            id: recipeId,
            title: data.title
          });
        }
      });
      
      return customRecipes;
    } catch (error) {
      console.error("Error fetching custom recipes:", error);
      return [];
    }
  }
}
