import React from "react";
import { useNavigate } from "react-router-dom";
import { useProductSearch } from "../hooks/useProductSearch";
import { SearchInput } from "../components/SearchInput";
import { SuggestionsList } from "../components/SuggestionsList";
import { ProductDetails } from "../components/ProductDetails";
import { SearchHistory } from "../components/SearchHistory";

const ProductSearchView: React.FC = () => {
  const vm = useProductSearch();
  const navigate = useNavigate();

  return (
    <div className="p-6 grid gap-6">
      <div className="header-top">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Voltar
        </button>

        <h1 className="titulo">Busca de Produtos</h1>
      </div>

      
      <div className="shadow-lg border rounded-lg p-4 relative">
        <SearchInput 
          value={vm.query} 
          onChange={vm.setQuery} 
          placeholder="Search for a product..." 
          loading={vm.loading}
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
  );
};


export default ProductSearchView;