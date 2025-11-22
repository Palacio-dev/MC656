import React, { useState } from 'react';
import { SearchInput } from './SearchInput';
import { fetchProducts } from '../services/ProductService';
import '../styles/ProductComparisonModal.css';

interface Product {
  name: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  fiber: number;
}

interface ProductComparisonModalProps {
  isOpen: boolean;
  baseProduct: Product;
  onClose: () => void;
}

export const ProductComparisonModal: React.FC<ProductComparisonModalProps> = ({
  isOpen,
  baseProduct,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [compareProduct, setCompareProduct] = useState<Product | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  if (!isOpen) return null;

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await fetchProducts(searchQuery);
      setSearchResults(results.slice(0, 10));
    } catch (error) {
      console.error('Error searching products:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectProduct = (product: Product) => {
    setCompareProduct(product);
    setSearchResults([]);
    setSearchQuery('');
  };

  const getNutrientValue = (product: Product, key: keyof Product): number => {
    const value = product[key];
    return typeof value === 'number' ? value : 0;
  };

  const calculateDifference = (base: number, compare: number): string => {
    if (base === 0 && compare === 0) return '0%';
    if (base === 0) return '+100%';
    
    const diff = ((compare - base) / base) * 100;
    const sign = diff > 0 ? '+' : '';
    return `${sign}${diff.toFixed(1)}%`;
  };

  const getDifferenceClass = (base: number, compare: number, lowerIsBetter: boolean = false): string => {
    if (compare === base) return 'neutral';
    if (lowerIsBetter) {
      return compare < base ? 'better' : 'worse';
    } else {
      return compare > base ? 'better' : 'worse';
    }
  };

  const renderNutrientRow = (
    label: string,
    key: keyof Product,
    unit: string,
    lowerIsBetter: boolean = false
  ) => {
    const baseValue = getNutrientValue(baseProduct, key);
    const compareValue = compareProduct ? getNutrientValue(compareProduct, key) : 0;
    const difference = compareProduct ? calculateDifference(baseValue, compareValue) : '';
    const diffClass = compareProduct ? getDifferenceClass(baseValue, compareValue, lowerIsBetter) : '';

    return (
      <div className="comparison-row">
        <div className="comparison-label">{label}</div>
        <div className="comparison-value">{baseValue.toFixed(1)}{unit}</div>
        {compareProduct && (
          <>
            <div className={`comparison-value ${diffClass}`}>
              {compareValue.toFixed(1)}{unit}
            </div>
            <div className={`comparison-diff ${diffClass}`}>
              {difference}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="comparison-modal-overlay" onClick={onClose}>
      <div className="comparison-modal" onClick={(e) => e.stopPropagation()}>
        <div className="comparison-modal-header">
          <h2>🔍 Comparar Produtos</h2>
          <button className="comparison-close-btn" onClick={onClose}>×</button>
        </div>

        <div className="comparison-modal-body">
          {/* Search for comparison product */}
          {!compareProduct && (
            <div className="comparison-search-section">
              <p className="comparison-instruction">
                Busque outro produto para comparar com <strong>{baseProduct.name}</strong>
              </p>
              <div className="comparison-search-input">
                <SearchInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Digite o nome do produto..."
                  loading={isSearching}
                  onEnter={handleSearch}
                />
                <button 
                  onClick={handleSearch}
                  disabled={isSearching || !searchQuery.trim()}
                  className="comparison-search-btn"
                >
                  {isSearching ? '⏳' : '🔍'} Buscar
                </button>
              </div>

              {searchResults.length > 0 && (
                <div className="comparison-search-results">
                  <p className="comparison-results-label">Selecione um produto:</p>
                  {searchResults.map((product, index) => (
                    <div
                      key={`${product.name}-${index}`}
                      className="comparison-search-result-item"
                      onClick={() => handleSelectProduct(product)}
                    >
                      <span className="comparison-result-name">{product.name}</span>
                      <span className="comparison-result-calories">
                        {product.calories?.toFixed(0) || '0'} kcal
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Comparison table */}
          {compareProduct && (
            <div className="comparison-table">
              <div className="comparison-header-row">
                <div className="comparison-header-label">Nutriente</div>
                <div className="comparison-header-product">{baseProduct.name}</div>
                <div className="comparison-header-product">{compareProduct.name}</div>
                <div className="comparison-header-diff">Diferença</div>
              </div>

              <div className="comparison-body">
                {renderNutrientRow('Calorias', 'calories', ' kcal')}
                {renderNutrientRow('Carboidratos', 'carbs', 'g')}
                {renderNutrientRow('Proteínas', 'protein', 'g')}
                {renderNutrientRow('Gorduras', 'fat', 'g')}
                {renderNutrientRow('Fibras', 'fiber', 'g')}
              </div>

              <div className="comparison-actions">
                <button
                  className="comparison-change-btn"
                  onClick={() => {
                    setCompareProduct(null);
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                >
                  🔄 Comparar com outro produto
                </button>
              </div>

              <div className="comparison-legend">
                <div className="legend-item">
                  <span className="legend-dot better"></span>
                  <span>Melhor valor</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot worse"></span>
                  <span>Pior valor</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot neutral"></span>
                  <span>Igual</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
