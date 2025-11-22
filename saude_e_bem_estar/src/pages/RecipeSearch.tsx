import React from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import { useRecipeSearch } from '../hooks/useRecipeSearch';
import { AddRecipeToMealPlanModal, MealPlanConfig } from '../components/AddRecipeToMealPlanModal';
import { RecipeToMealPlanService } from '../services/RecipeToMealPlanService';
import { MealPlannerViewModel } from '../hooks/MealPlannerHook';
import { FirebaseMealPlannerModel } from '../models/firebaseMealPlannerModel';
import { FavoritesViewModel } from '../hooks/useFavorites';
import { FirebaseFavoritesModel } from '../models/firebaseFavoritesModel';
import { useAuth } from '../hooks/useAuth';
import { getRecipeById } from "../services/RecipeService";
import { FirebaseRecipeService } from "../services/FirebaseRecipeService";
import { PageHeader } from '../components/PageHeader';
import '../styles/RecipeSearch.css';

/**
 * Recipe Search Page
 * Allows users to search for recipes by name
 */
const RecipeSearch: React.FC = observer(() => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [isMealPlanModalOpen, setIsMealPlanModalOpen] = React.useState(false);
  const [selectedRecipe, setSelectedRecipe] = React.useState<{ id: string; title: string } | null>(null);
  
  const {
    searchQuery,
    searchResults,
    isLoading,
    error,
    hasSearched,
    handleSearchChange,
    handleSearchSubmit,
    clearSearch,
  } = useRecipeSearch();
  
  // Initialize MealPlanner ViewModel
  const mealPlannerViewModel = React.useMemo(() => {
    const model = new FirebaseMealPlannerModel();
    return new MealPlannerViewModel(model, currentUser?.uid || null);
  }, [currentUser]);

  // Initialize Favorites ViewModel
  const favoritesViewModel = React.useMemo(() => {
    const model = new FirebaseFavoritesModel();
    return new FavoritesViewModel(model, currentUser?.uid || null);
  }, [currentUser]);

  /**
   * Navigate to recipe details page
   */
  const handleViewRecipe = (recipeId: string) => {
    navigate(`/Welcome/RecipeDetails?id=${recipeId}`);
  };

  /**
   * Handle form submission
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearchSubmit();
  };

  /**
   * Handle Enter key press in search input
   */
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  /**
   * Open meal plan modal for a recipe
   */
  const handleAddRecipeToMealPlan = (recipeId: string, recipeTitle: string) => {
    if (!currentUser) {
      alert('Você precisa estar logado para adicionar receitas ao planejamento');
      return;
    }
    setSelectedRecipe({ id: recipeId, title: recipeTitle });
    setIsMealPlanModalOpen(true);
  };

  /**
   * Handle adding recipe to meal plan
   */
  const handleAddToMealPlan = async (config: MealPlanConfig) => {
    if (!selectedRecipe || !currentUser) return;

    try {
      // 1️⃣ Buscar detalhes completos da receita com ID do TudoGostoso
      const recipeDetails = await getRecipeById(selectedRecipe.id);

      console.log("Recipe details:", recipeDetails);

      // 2️⃣ Salvar no Firebase (AGORA funciona!)
      await FirebaseRecipeService.saveRecipe(recipeDetails);

      console.log("Receita salva no Firebase!");

      // 3️⃣ Adicionar ao planejamento usando o título e ID
      const count = await RecipeToMealPlanService.addRecipeToMealPlan(
        mealPlannerViewModel,
        selectedRecipe.title,
        recipeDetails.id,
        config
      );

      if (config.mode === 'single') {
        alert(`Receita "${selectedRecipe.title}" adicionada ao planejamento!`);
      } else {
        alert(`Receita "${selectedRecipe.title}" adicionada a ${count} refeições!`);
      }

      setIsMealPlanModalOpen(false);
      setSelectedRecipe(null);
    } catch (err: any) {
      console.error("Erro ao adicionar ao planejamento:", err);
      alert(err.message || "Erro ao adicionar ao planejamento");
    }
  };


  return (
    <div className="recipe-search-container">
      <PageHeader
        title="Buscar Receitas"
        subtitle="Encontre receitas deliciosas para adicionar ao seu planejamento"
      />

      {/* Search Bar */}
      {(
        <form onSubmit={handleSubmit} className="recipe-search-form">
          <div className="search-input-wrapper">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite o nome da receita (ex: bolo de cenoura)"
              className="recipe-search-input"
              disabled={isLoading}
            />
            
            {searchQuery && !isLoading && (
              <button
                type="button"
                onClick={clearSearch}
                className="clear-search-btn"
                aria-label="Limpar busca"
              >
                ✕
              </button>
            )}
          </div>

          <button
            type="submit"
            className="recipe-search-btn"
            disabled={isLoading || !searchQuery.trim()}
          >
            {isLoading ? 'Buscando...' : 'Buscar'}
          </button>
        </form>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="recipe-loading">
          <div className="loading-spinner"></div>
          <p>Procurando receitas...</p>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="recipe-error">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
        </div>
      )}

      {/* Search Results */}
      {!isLoading && !error && hasSearched && searchResults.length > 0 && (
        <div className="recipe-results">
          <h2 className="results-title">
            Encontramos {searchResults.length} receita{searchResults.length !== 1 ? 's' : ''}
          </h2>
          
          <div className="recipe-list">
            {searchResults.map((recipe) => (
              <div key={recipe.id} className="recipe-card">
                <div className="recipe-card-content">
                  <h3 className="recipe-title">{recipe.title}</h3>
                  <div className="recipe-card-actions">
                    <button
                      className={`favorite-btn-small ${favoritesViewModel.isFavorite(recipe.id) ? 'favorited' : ''}`}
                      onClick={async () => {
                        try {
                          await favoritesViewModel.toggleFavorite(recipe.id, recipe.title);
                        } catch (err: any) {
                          alert(err.message || 'Erro ao atualizar favoritos');
                        }
                      }}
                      title={favoritesViewModel.isFavorite(recipe.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                    >
                      {favoritesViewModel.isFavorite(recipe.id) ? '❤️' : '🤍'}
                    </button>
                    <button
                      className="add-to-plan-btn-small"
                      onClick={() => handleAddRecipeToMealPlan(recipe.id, recipe.title)}
                      title="Adicionar ao planejamento"
                    >
                      📅
                    </button>
                    <button
                      className="view-recipe-btn"
                      onClick={() => handleViewRecipe(recipe.id)}
                    >
                      Ver Receita
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State - No Search Yet */}
      {!hasSearched && !isLoading && (
        <div className="recipe-empty-state">
          <div className="empty-state-icon">🔍</div>
          <h3>Busque por suas receitas favoritas</h3>
          <p>Digite o nome de uma receita acima para começar</p>
        </div>
      )}

      {/* Meal Plan Modal */}
      {selectedRecipe && (
        <AddRecipeToMealPlanModal
          isOpen={isMealPlanModalOpen}
          onClose={() => {
            setIsMealPlanModalOpen(false);
            setSelectedRecipe(null);
          }}
          recipeTitle={selectedRecipe.title}
          onAddToMealPlan={handleAddToMealPlan}
        />
      )}
    </div>
  );
});

export default RecipeSearch;
