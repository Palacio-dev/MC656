import React, { useEffect, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { useProductSearch } from "../hooks/useProductSearch";
import { SearchInput } from "../components/SearchInput";
import { SuggestionsList } from "../components/SuggestionsList";
import { ProductDetails } from "../components/ProductDetails";
import { SearchHistory } from "../components/SearchHistory";
import "../styles/ProductSearch.css";
import AddProductToShoppingListModal from '../components/AddProductToShoppingListModal';

const ProductSearchView: React.FC = () => {
  const vm = useProductSearch();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [comparisonModalOpen, setComparisonModalOpen] = useState(false);

  // Open modal automatically whenever vm.selected changes (user picks a product).
  useEffect(() => {
    if (!vm.selected) {
      // close modal if selection cleared
      setSelectedProduct(null);
      setModalOpen(false);
      return;
    }
    const newProduct = Array.isArray(vm.selected) ? (vm.selected[0] ?? null) : vm.selected;
    setSelectedProduct(newProduct);
    setModalOpen(true);
  }, [vm.selected]);

  function closeAddModal() {
    setSelectedProduct(null);
    setModalOpen(false);
  }

  // Update modal's shown product whenever the global selection changes
  // while the modal is open (so switching products in the search updates modal content).
  useEffect(() => {
    if (!modalOpen) return;
    if (!vm.selected) {
      setSelectedProduct(null);
      return;
    }
    const newProduct = Array.isArray(vm.selected) ? (vm.selected[0] ?? null) : vm.selected;
    setSelectedProduct(newProduct);
  }, [vm.selected, modalOpen]);

  return (
    <div className="product-search-container">
      <PageHeader 
        title="Busca de Produtos"
        subtitle="Digite o nome do produto para buscar informações nutricionais"
      />
      
      <div className="product-search-content">
        <div className="search-box-wrapper">
          <SearchInput 
            value={vm.query} 
            onChange={vm.setQuery} 
            placeholder="Digite o nome do produto (ex: farinha trigo)..." 
            loading={vm.loading}
            onEnter={vm.triggerSearch}
          />
          {vm.suggestions.length > 0 && (
            <SuggestionsList 
              items={vm.suggestions} 
              onSelect={vm.select} 
            />
          )}
        </div>

        {vm.selected && (
          <div>
            <ProductDetails product={vm.selected} />
            <div className="product-actions">
              <button
                className="compare-btn"
                onClick={() => setComparisonModalOpen(true)}
              >
                🔍 Comparar com outro produto
              </button>
            </div>
          </div>
        )}

        <SearchHistory 
          history={vm.history} 
          onSelect={vm.selectFromHistory} 
          onClear={vm.clearHistory} 
        />


      </div>

      <AddProductToShoppingListModal
        open={modalOpen}
        onClose={closeAddModal}
        product={selectedProduct}
      />

      {vm.selected && (
        <ProductComparisonModal
          isOpen={comparisonModalOpen}
          baseProduct={Array.isArray(vm.selected) ? vm.selected[0] : vm.selected}
          onClose={() => setComparisonModalOpen(false)}
        />
      )}
    </div>
  );
}

export default ProductSearchView;