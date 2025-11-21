import React from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import { FavoritesViewModel } from '../hooks/useFavorites';
import { FirebaseFavoritesModel } from '../models/firebaseFavoritesModel';
import { useAuth } from '../hooks/useAuth';
import { PageHeader } from '../components/PageHeader';
import '../styles/Favorites.css';

/**
 * Favorites Page
 * Displays user's favorite recipes
 */
const Favorites: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Initialize ViewModel
  const viewModel = React.useMemo(() => {
    const model = new FirebaseFavoritesModel();
    return new FavoritesViewModel(model, currentUser?.uid || null);
  }, [currentUser]);

  /**
   * Navigate to recipe details
   */
  const handleViewRecipe = (recipeId: string) => {
    navigate(`/Welcome/RecipeDetails?id=${recipeId}`);
  };

  /**
   * Remove from favorites
   */
  const handleRemoveFavorite = async (recipeId: string, title: string) => {
    if (window.confirm(`Remover "${title}" dos favoritos?`)) {
      try {
        await viewModel.removeFavorite(recipeId);
      } catch (err: any) {
        alert(err.message || 'Erro ao remover dos favoritos');
      }
    }
  };

  return (
    <div className="favorites-container">
      <PageHeader
        title="Receitas Favoritas"
        subtitle="Suas receitas salvas para consulta rápida"
        showBackButton={true}
        showHomeButton={true}
      />

      {/* Loading State */}
      {viewModel.loading && (
        <div className="favorites-loading">
          <div className="loading-spinner"></div>
          <p>Carregando favoritos...</p>
        </div>
      )}

      {/* Error State */}
      {viewModel.error && !viewModel.loading && (
        <div className="favorites-error">
          <span className="error-icon">⚠️</span>
          <p>{viewModel.error}</p>
          <button onClick={() => viewModel.loadFavorites()} className="retry-btn">
            Tentar novamente
          </button>
        </div>
      )}

      {/* Empty State */}
      {!viewModel.loading && !viewModel.error && viewModel.favorites.length === 0 && (
        <div className="favorites-empty">
          <div className="empty-icon">❤️</div>
          <h3>Nenhuma receita favorita ainda</h3>
          <p>Adicione receitas aos favoritos para encontrá-las facilmente aqui!</p>
          <button 
            className="browse-recipes-btn"
            onClick={() => navigate('/Welcome/RecipeSearch')}
          >
            Buscar Receitas
          </button>
        </div>
      )}

      {/* Favorites List */}
      {!viewModel.loading && !viewModel.error && viewModel.favorites.length > 0 && (
        <div className="favorites-content">
          <div className="favorites-header">
            <h2>{viewModel.favorites.length} receita{viewModel.favorites.length !== 1 ? 's' : ''} favorita{viewModel.favorites.length !== 1 ? 's' : ''}</h2>
          </div>

          <div className="favorites-list">
            {viewModel.favorites.map((favorite) => (
              <div key={favorite.recipeId} className="favorite-card">
                <div className="favorite-card-content">
                  <div className="favorite-info">
                    <h3 className="favorite-title">{favorite.title}</h3>
                    <p className="favorite-date">
                      Adicionado em {favorite.addedAt.toLocaleDateString('pt-BR')}
                    </p>
                  </div>

                  <div className="favorite-actions">
                    <button
                      className="view-favorite-btn"
                      onClick={() => handleViewRecipe(favorite.recipeId)}
                      title="Ver receita"
                    >
                      Ver Receita
                    </button>
                    <button
                      className="remove-favorite-btn"
                      onClick={() => handleRemoveFavorite(favorite.recipeId, favorite.title)}
                      title="Remover dos favoritos"
                    >
                      ❤️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default observer(Favorites);
