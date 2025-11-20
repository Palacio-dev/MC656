import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useRecipeDetails } from '../hooks/useRecipeDetails';
import '../styles/RecipeDetails.css';

/**
 * Recipe Details Page
 * Displays full recipe information including ingredients and instructions
 */
const RecipeDetails: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const recipeId = searchParams.get('id');
  const [showShareMenu, setShowShareMenu] = React.useState(false);
  
  const { recipe, isLoading, error, retry } = useRecipeDetails(recipeId);

  /**
   * Navigate back to search page
   */
  const handleBack = () => {
    navigate('/Welcome/RecipeSearch');
  };

  /**
   * Toggle share menu
   */
  const toggleShareMenu = () => {
    setShowShareMenu(!showShareMenu);
  };

  /**
   * Get share URL and text
   */
  const getShareData = () => {
    if (!recipe || !recipeId) return { url: '', text: '' };
    const shareUrl = `${window.location.origin}/Welcome/RecipeDetails?id=${recipeId}`;
    const shareText = `Confira essa receita: ${recipe.title}`;
    return { url: shareUrl, text: shareText };
  };

  /**
   * Share to WhatsApp
   */
  const shareToWhatsApp = () => {
    const { url, text } = getShareData();
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + url)}`;
    window.open(whatsappUrl, '_blank');
    setShowShareMenu(false);
  };

  /**
   * Share to Facebook
   */
  const shareToFacebook = () => {
    const { url } = getShareData();
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, '_blank');
    setShowShareMenu(false);
  };

  /**
   * Share to Twitter
   */
  const shareToTwitter = () => {
    const { url, text } = getShareData();
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank');
    setShowShareMenu(false);
  };

  /**
   * Copy link to clipboard
   */
  const copyToClipboard = () => {
    const { url } = getShareData();
    navigator.clipboard.writeText(url).then(
      () => {
        alert('Link copiado para a área de transferência!');
        setShowShareMenu(false);
      },
      (err) => {
        console.error('Failed to copy:', err);
        alert('Não foi possível copiar o link');
      }
    );
  };

  /**
   * Close share menu when clicking outside
   */
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showShareMenu && !target.closest('.share-menu-container')) {
        setShowShareMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showShareMenu]);

  // No ID provided
  if (!recipeId) {
    return (
      <div className="recipe-details-container">
        <div className="recipe-error">
          <span className="error-icon">⚠️</span>
          <p>ID da receita não fornecido</p>
          <button onClick={handleBack} className="back-btn">
            Voltar para busca
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="recipe-details-container">
      {/* Header with back button and share button */}
      <div className="recipe-details-header">
        <button onClick={handleBack} className="back-btn" aria-label="Voltar">
          ← Voltar
        </button>
        {recipe && (
          <div className="share-menu-container">
            <button onClick={toggleShareMenu} className="share-btn" aria-label="Compartilhar">
              🔗 Compartilhar
            </button>
            {showShareMenu && (
              <div className="share-menu">
                <button onClick={shareToWhatsApp} className="share-option whatsapp">
                  <span className="share-icon">💬</span>
                  <span>WhatsApp</span>
                </button>
                <button onClick={shareToFacebook} className="share-option facebook">
                  <span className="share-icon">📘</span>
                  <span>Facebook</span>
                </button>
                <button onClick={shareToTwitter} className="share-option twitter">
                  <span className="share-icon">🐦</span>
                  <span>Twitter</span>
                </button>
                <button onClick={copyToClipboard} className="share-option copy-link">
                  <span className="share-icon">📋</span>
                  <span>Copiar Link</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="recipe-loading">
          <div className="loading-spinner"></div>
          <p>Carregando receita...</p>
          <p className="loading-note">Isso pode levar alguns segundos</p>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="recipe-error">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
          <button onClick={retry} className="retry-btn">
            Tentar novamente
          </button>
        </div>
      )}

      {/* Recipe Content */}
      {recipe && !isLoading && !error && (
        <div className="recipe-content">
          {/* Recipe Title */}
          <h1 className="recipe-title">{recipe.title}</h1>

          {/* Recipe Stats */}
          {recipe.stats && (
            <div className="recipe-stats">
              {recipe.stats.prepare_time_minutes > 0 && (
                <div className="stat-item">
                  <span className="stat-icon">⏱️</span>
                  <span className="stat-value">{recipe.stats.prepare_time_minutes} min</span>
                  <span className="stat-label">Preparo</span>
                </div>
              )}
              {recipe.stats.portion_output > 0 && (
                <div className="stat-item">
                  <span className="stat-icon">🍽️</span>
                  <span className="stat-value">{recipe.stats.portion_output}</span>
                  <span className="stat-label">Porções</span>
                </div>
              )}
            </div>
          )}

          {/* Ingredients Section */}
          {recipe.ingredients && recipe.ingredients.length > 0 && (
            <section className="recipe-section">
              <h2 className="section-title">📝 Ingredientes</h2>
              {recipe.ingredients.map((section, index) => (
                <div key={index} className="recipe-subsection">
                  {section.title && (
                    <h3 className="subsection-title">{section.title}</h3>
                  )}
                  <ul className="ingredients-list">
                    {section.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="ingredient-item">
                        <span className="ingredient-bullet">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>
          )}

          {/* Instructions Section */}
          {recipe.instructions && recipe.instructions.length > 0 && (
            <section className="recipe-section">
              <h2 className="section-title">👨‍🍳 Modo de Preparo</h2>
              {recipe.instructions.map((section, index) => (
                <div key={index} className="recipe-subsection">
                  {section.title && (
                    <h3 className="subsection-title">{section.title}</h3>
                  )}
                  <ol className="instructions-list">
                    {section.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="instruction-item">
                        {item}
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </section>
          )}
        </div>
      )}
    </div>
  );
};

export default RecipeDetails;
