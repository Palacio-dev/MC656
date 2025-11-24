import React from 'react';
import { Product } from '../types/product';
import { fetchProducts } from '../services/ProductService';
import '../styles/IngredientSubstitutionModal.css';

interface IngredientSubstitutionModalProps {
  isOpen: boolean;
  ingredientText: string;
  ingredientIndex: number;
  currentProduct: Product | null;
  onSubstitute: (ingredientIndex: number, newProduct: Product) => void;
  onClose: () => void;
}

export const IngredientSubstitutionModal: React.FC<IngredientSubstitutionModalProps> = ({
  isOpen,
  ingredientText,
  ingredientIndex,
  currentProduct,
  onSubstitute,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);

  // Initialize search with current product name
  React.useEffect(() => {
    if (isOpen && currentProduct) {
      const mainWord = currentProduct.name.split(',')[0].trim().toLowerCase();
      setSearchQuery(mainWord);
      performSearch(mainWord);
    }
  }, [isOpen, currentProduct]);

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const results = await fetchProducts(query.trim());
      setSearchResults(results.slice(0, 10)); // Limit to 10 results
    } catch (error) {
      console.error('Error searching products:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchQuery);
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleConfirmSubstitution = () => {
    if (selectedProduct) {
      onSubstitute(ingredientIndex, selectedProduct);
      onClose();
    }
  };

  const handleCancel = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedProduct(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="substitution-modal-overlay" onClick={handleCancel}>
      <div className="substitution-modal" onClick={(e) => e.stopPropagation()}>
        <button className="substitution-modal-close" onClick={handleCancel}>
          ✕
        </button>

        <h3 className="substitution-modal-title">Substituir Ingrediente</h3>

        <div className="substitution-original">
          <p className="substitution-label">Ingrediente original:</p>
          <p className="substitution-ingredient-text">{ingredientText}</p>
          {currentProduct && (
            <div className="substitution-current-product">
              <span className="substitution-current-label">Usando atualmente:</span>
              <span className="substitution-current-name">{currentProduct.name}</span>
              <div className="substitution-current-nutrition">
                {currentProduct.calories} kcal • C: {currentProduct.carbs}g • P: {currentProduct.protein}g • G: {currentProduct.fat}g
              </div>
            </div>
          )}
        </div>

        <form className="substitution-search-form" onSubmit={handleSearch}>
          <input
            type="text"
            className="substitution-search-input"
            placeholder="Buscar substituto (ex: leite desnatado, azeite)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          <button type="submit" className="substitution-search-btn">
            🔍 Buscar
          </button>
        </form>

        {loading && (
          <div className="substitution-loading">
            <div className="substitution-spinner"></div>
            <p>Buscando alternativas...</p>
          </div>
        )}

        {!loading && searchResults.length > 0 && (
          <div className="substitution-results">
            <p className="substitution-results-label">
              Selecione um substituto ({searchResults.length} opções):
            </p>
            <div className="substitution-results-list">
              {searchResults.map((product, idx) => (
                <div
                  key={idx}
                  className={`substitution-result-item ${selectedProduct === product ? 'selected' : ''}`}
                  onClick={() => handleSelectProduct(product)}
                >
                  <div className="substitution-result-name">{product.name}</div>
                  <div className="substitution-result-nutrition">
                    {product.calories} kcal • C: {product.carbs.toFixed(1)}g • 
                    P: {product.protein.toFixed(1)}g • G: {product.fat.toFixed(1)}g
                  </div>
                  {selectedProduct === product && (
                    <div className="substitution-selected-check">✓</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && searchQuery && searchResults.length === 0 && (
          <div className="substitution-no-results">
            <p>⚠️ Nenhum resultado encontrado</p>
            <p className="substitution-no-results-hint">Tente buscar por outro termo</p>
          </div>
        )}

        <div className="substitution-actions">
          <button className="substitution-cancel-btn" onClick={handleCancel}>
            Cancelar
          </button>
          <button
            className="substitution-confirm-btn"
            onClick={handleConfirmSubstitution}
            disabled={!selectedProduct}
          >
            Confirmar Substituição
          </button>
        </div>
      </div>
    </div>
  );
};
