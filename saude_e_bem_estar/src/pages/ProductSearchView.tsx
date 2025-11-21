import React, { useState, useEffect } from 'react';
import { useProductSearch } from "../hooks/useProductSearch";
import { SearchInput } from "../components/SearchInput";
import { SuggestionsList } from "../components/SuggestionsList";
import { ProductDetails } from "../components/ProductDetails";
import { SearchHistory } from "../components/SearchHistory";
import { useNavigate } from "react-router-dom";
import "../styles/ProductSearch.css";
import AddProductToShoppingListModal from '../components/AddProductToShoppingListModal';

export default function ProductSearchView(/* props */) {
  const navigate = useNavigate();
  const vm = useProductSearch();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

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

  function openAddModal(product: any) {
    setSelectedProduct(product);
    setModalOpen(true);
  }
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
      <div className="header-top">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Voltar
        </button>
        <h1 className="titulo">Busca de Produtos</h1>
      </div>
      
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
          <ProductDetails product={vm.selected} />
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
    </div>
  );
}