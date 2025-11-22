import { db } from "../config/firebase";
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  getDoc,
} from "firebase/firestore";

/**
 * Favorite Recipe Entry
 */
export interface FavoriteRecipe {
  recipeId: string;
  title: string;
  addedAt: Date;
}

/**
 * Firebase Model for managing favorite recipes
 * Follows MVVM pattern - this is the Model layer
 */
export interface FavoritesModel {
  addFavorite(userId: string, recipeId: string, title: string): Promise<void>;
  removeFavorite(userId: string, recipeId: string): Promise<void>;
  loadFavorites(userId: string): Promise<FavoriteRecipe[]>;
  isFavorite(userId: string, recipeId: string): Promise<boolean>;
}

export class FirebaseFavoritesModel implements FavoritesModel {
  private collectionRef = collection(db, "favorites");

  /**
   * Add a recipe to user's favorites
   */
  async addFavorite(userId: string, recipeId: string, title: string): Promise<void> {
    const docId = `${userId}_${recipeId}`;
    const docRef = doc(this.collectionRef, docId);

    await setDoc(docRef, {
      userId,
      recipeId,
      title,
      addedAt: new Date().toISOString(),
    });
  }

  /**
   * Remove a recipe from user's favorites
   */
  async removeFavorite(userId: string, recipeId: string): Promise<void> {
    const docId = `${userId}_${recipeId}`;
    const docRef = doc(this.collectionRef, docId);
    await deleteDoc(docRef);
  }

  /**
   * Load all favorites for a user
   */
  async loadFavorites(userId: string): Promise<FavoriteRecipe[]> {
    const q = query(
      this.collectionRef,
      where("userId", "==", userId)
    );

    const snapshot = await getDocs(q);
    const favorites: FavoriteRecipe[] = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      favorites.push({
        recipeId: data.recipeId,
        title: data.title,
        addedAt: new Date(data.addedAt),
      });
    });

    // Sort by most recent first
    favorites.sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime());

    return favorites;
  }

  /**
   * Check if a recipe is in user's favorites
   */
  async isFavorite(userId: string, recipeId: string): Promise<boolean> {
    const docId = `${userId}_${recipeId}`;
    const docRef = doc(this.collectionRef, docId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists();
  }
}
