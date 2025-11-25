import { makeAutoObservable, runInAction } from "mobx";
import type { FavoritesModel, FavoriteRecipe } from "../services/firebaseFavoritesModel";

/**
 * Favorites ViewModel
 * Follows MVVM pattern - this is the ViewModel layer
 */
export class FavoritesViewModel {
  private model: FavoritesModel;
  private userId: string | null;

  favorites: FavoriteRecipe[] = [];
  favoriteIds: Set<string> = new Set(); // For quick lookup
  loading: boolean = false;
  error: string | null = null;

  constructor(model: FavoritesModel, userId: string | null) {
    this.model = model;
    this.userId = userId;

    makeAutoObservable(this);

    if (this.userId) {
      this.loadFavorites();
    }
  }

  /**
   * Update user (for login/logout scenarios)
   */
  setUser(userId: string | null) {
    this.userId = userId;
    this.favorites = [];
    this.favoriteIds.clear();
    this.error = null;

    if (this.userId) {
      this.loadFavorites();
    }
  }

  /**
   * Load all favorites for the current user
   */
  async loadFavorites() {
    if (!this.userId) {
      runInAction(() => {
        this.favorites = [];
        this.favoriteIds.clear();
        this.loading = false;
      });
      return;
    }

    this.loading = true;
    this.error = null;

    try {
      const favorites = await this.model.loadFavorites(this.userId);

      runInAction(() => {
        this.favorites = favorites;
        this.favoriteIds = new Set(favorites.map(f => f.recipeId));
      });
    } catch (err: any) {
      console.error("Error loading favorites:", err);
      runInAction(() => {
        this.error = err.message || "Erro ao carregar favoritos";
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  /**
   * Add a recipe to favorites
   */
  async addFavorite(recipeId: string, title: string) {
    if (!this.userId) {
      throw new Error("Usuário não autenticado");
    }

    try {
      await this.model.addFavorite(this.userId, recipeId, title);

      runInAction(() => {
        const newFavorite: FavoriteRecipe = {
          recipeId,
          title,
          addedAt: new Date(),
        };
        this.favorites.unshift(newFavorite); // Add to beginning
        this.favoriteIds.add(recipeId);
      });
    } catch (err: any) {
      console.error("Error adding favorite:", err);
      throw new Error("Erro ao adicionar aos favoritos");
    }
  }

  /**
   * Remove a recipe from favorites
   */
  async removeFavorite(recipeId: string) {
    if (!this.userId) {
      throw new Error("Usuário não autenticado");
    }

    try {
      await this.model.removeFavorite(this.userId, recipeId);

      runInAction(() => {
        this.favorites = this.favorites.filter(f => f.recipeId !== recipeId);
        this.favoriteIds.delete(recipeId);
      });
    } catch (err: any) {
      console.error("Error removing favorite:", err);
      throw new Error("Erro ao remover dos favoritos");
    }
  }

  /**
   * Toggle favorite status
   */
  async toggleFavorite(recipeId: string, title: string) {
    if (this.isFavorite(recipeId)) {
      await this.removeFavorite(recipeId);
    } else {
      await this.addFavorite(recipeId, title);
    }
  }

  /**
   * Check if a recipe is favorited (quick check using Set)
   */
  isFavorite(recipeId: string): boolean {
    return this.favoriteIds.has(recipeId);
  }
}
