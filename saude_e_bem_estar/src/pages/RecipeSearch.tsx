import React from 'react';
import { useRecipeSearch } from '../hooks/useRecipeSearch';
import '../Styles/RecipeSearch.css';

/**
 * Recipe Search Page
 * Allows users to search for recipes by name
 */
const RecipeSearch: React.FC = () => {
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

  return (
    <div className="recipe-search-container">
      <div className="recipe-search-header">
        <h1>Buscar Receitas</h1>
        <p className="recipe-search-subtitle">
          Encontre receitas deliciosas para sua lista de compras
        </p>
      </div>

      {/* Search Bar */}
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
                  <button
                    className="view-recipe-btn"
                    onClick={() => {
                      // TODO: Navigate to recipe details page
                      console.log('View recipe:', recipe.id);
                    }}
                  >
                    Ver Receita
                  </button>
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
    </div>
  );
};

export default RecipeSearch;
