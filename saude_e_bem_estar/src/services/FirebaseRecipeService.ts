import { doc, setDoc } from "firebase/firestore";
import { RecipeDetailsResponse } from "../models/RecipeModel";
import { db } from "../config/firebase";

export class FirebaseRecipeService {
  static async saveRecipe(recipe: RecipeDetailsResponse) {

    // Usamos o ID original do TudoGostoso
    const recipeRef = doc(db, "recipes", recipe.id);

    await setDoc(recipeRef, recipe, { merge: true });
  }
}
