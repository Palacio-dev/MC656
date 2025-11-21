import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecipeSearch } from '../hooks/useRecipeSearch';
import { AddRecipeToMealPlanModal, MealPlanConfig } from '../components/AddRecipeToMealPlanModal';
import { RecipeToMealPlanService } from '../services/RecipeToMealPlanService';
import { MealPlannerViewModel } from '../hooks/MealPlannerHook';
import { FirebaseMealPlannerModel } from '../models/firebaseMealPlannerModel';
import { useAuth } from '../hooks/useAuth';
import { getRecipeById } from "../services/RecipeService";
import { FirebaseRecipeService } from "../services/FirebaseRecipeService";
import { PageHeader } from '../components/PageHeader';
import '../styles/RecipeSearch.css';

/**
 * Recipe Search Page
 * Allows users to search for recipes by name
 */
const RecipeSearch: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [isMealPlanModalOpen, setIsMealPlanModalOpen] = React.useState(false);
  const [selectedRecipe, setSelectedRecipe] = React.useState<{ id: string; title: string } | null>(null);
  const [showOnlyCustom, setShowOnlyCustom] = React.useState(false);
  const [customRecipes, setCustomRecipes] = React.useState<{ id: string; title: string }[]>([]);
  const [loadingCustom, setLoadingCustom] = React.useState(false);
  
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

  /**
   * Load custom recipes from Firebase
   */
  React.useEffect(() => {
    const loadCustomRecipes = async () => {
      if (showOnlyCustom) {
        setLoadingCustom(true);
        try {
          const recipes = await FirebaseRecipeService.getAllCustomRecipes();
          setCustomRecipes(recipes);
        } catch (err) {
          console.error("Error loading custom recipes:", err);
          setCustomRecipes([]);
        } finally {
          setLoadingCustom(false);
        }
      }
    };

    loadCustomRecipes();
  }, [showOnlyCustom]);

  /**
   * Toggle custom recipes filter
   */
  const handleToggleCustomFilter = () => {
    setShowOnlyCustom(!showOnlyCustom);
    if (!showOnlyCustom) {
      clearSearch(); // Clear regular search when switching to custom
    }
  };

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

      {/* Filter Toggle */}
      <div className="recipe-filter-toggle">
        <label className="filter-toggle-label">
          <input
            type="checkbox"
            checked={showOnlyCustom}
            onChange={handleToggleCustomFilter}
            className="filter-toggle-checkbox"
          />
          <span>Mostrar apenas receitas personalizadas</span>
        </label>
      </div>

      {/* Search Bar - Only show when NOT filtering custom recipes */}
      {!showOnlyCustom && (
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

      {/* Loading State - Custom Recipes */}
      {loadingCustom && showOnlyCustom && (
        <div className="recipe-loading">
          <div className="loading-spinner"></div>
          <p>Carregando receitas personalizadas...</p>
        </div>
      )}

      {/* Custom Recipes Results */}
      {showOnlyCustom && !loadingCustom && (
        <div className="recipe-results">
          <h2 className="results-title">
            {customRecipes.length > 0
              ? `${customRecipes.length} receita${customRecipes.length !== 1 ? 's' : ''} personalizada${customRecipes.length !== 1 ? 's' : ''}`
              : 'Nenhuma receita personalizada encontrada'}
          </h2>
          
          {customRecipes.length > 0 && (
            <div className="recipe-list">
              {customRecipes.map((recipe) => (
                <div key={recipe.id} className="recipe-card">
                  <div className="recipe-card-content">
                    <h3 className="recipe-title">
                      🍽️ {recipe.title}
                    </h3>
                    <div className="recipe-card-actions">
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
                        Ver Detalhes
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Loading State - Regular Search */}
      {isLoading && !showOnlyCustom && (
        <div className="recipe-loading">
          <div className="loading-spinner"></div>
          <p>Procurando receitas...</p>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && !showOnlyCustom && (
        <div className="recipe-error">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
        </div>
      )}

      {/* Search Results - Regular Search */}
      {!showOnlyCustom && !isLoading && !error && hasSearched && searchResults.length > 0 && (
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
};

export default RecipeSearch;
